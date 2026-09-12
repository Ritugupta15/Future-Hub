import request from 'supertest';
import { createApp } from '../src/app';
import { getDatabase, initializeDatabase, closeDatabase } from '../src/database/db';
import { seedDatabase } from '../src/database/seed';
import fs from 'fs';
import path from 'path';

describe('Resume / CV Security & Multi-Tenant Isolation (Anti-IDOR)', () => {
  let app: any;
  let userAToken: string;
  let userBToken: string;
  let userAId: number;
  let userBId: number;
  let userAResumeId: number;

  beforeAll(async () => {
    // Isolated in-memory database for security tests
    const db = getDatabase(':memory:');
    initializeDatabase(db);
    seedDatabase(db);
    app = createApp();

    // Register User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'student_a@example.com',
        password: 'Password123!',
        name: 'Alice Student',
        education: 'B.Sc Computer Science (TYCS / SYCS / FYCS)',
        experience_level: 'Beginner'
      });
    expect(resA.status).toBe(201);
    userAToken = resA.body.token;
    userAId = resA.body.user.id;

    // Register User B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'student_b@example.com',
        password: 'Password123!',
        name: 'Bob Attacker',
        education: 'Bachelor of Computer Applications (BCA)',
        experience_level: 'Beginner'
      });
    expect(resB.status).toBe(201);
    userBToken = resB.body.token;
    userBId = resB.body.user.id;
  });

  afterAll(() => {
    closeDatabase();
  });

  it('1. should successfully upload a valid resume for User A and deterministically extract skills', async () => {
    // Generate a minimal mock text payload with skills
    const sampleResumeContent = `
Alice Student
Email: student_a@example.com
Phone: (555) 123-4567
GitHub: github.com/alicestudent
LinkedIn: linkedin.com/in/alicestudent

Education:
B.Sc Computer Science at City University

Experience:
Web Development Intern at Tech Labs
Built interactive dashboards with React, TypeScript, and SQL.

Skills:
Python, JavaScript, React, SQL, Docker, Git
    `;

    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${userAToken}`)
      .attach('resume', Buffer.from(sampleResumeContent, 'utf8'), {
        filename: 'alice_resume.pdf',
        contentType: 'application/pdf'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.resume).toBeDefined();
    expect(res.body.resume.user_id).toBe(userAId);
    expect(res.body.resume.original_filename).toBe('alice_resume.pdf');
    expect(res.body.resume.is_active).toBe(1);

    userAResumeId = res.body.resume.id;
    expect(userAResumeId).toBeGreaterThan(0);

    // Verify extraction contains extracted skills
    const extraction = res.body.extraction;
    expect(extraction).toBeDefined();
    expect(extraction.extracted_json.email).toBe('student_a@example.com');
    expect(extraction.extracted_json.phone).toBe('(555) 123-4567');
    expect(extraction.extracted_json.links.github).toContain('github.com/alicestudent');

    const extractedSkillNames = extraction.extracted_json.skills.map((s: any) => s.name);
    expect(extractedSkillNames).toContain('Python');
    expect(extractedSkillNames).toContain('SQL');
    expect(extractedSkillNames).toContain('React');
  });

  it('2. should reject upload with invalid executable file extension (.exe)', async () => {
    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${userAToken}`)
      .attach('resume', Buffer.from('binary-content', 'utf8'), {
        filename: 'malicious.exe',
        contentType: 'application/octet-stream'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/invalid file type/i);
  });

  it('2b. should reject disguised binary executable masquerading as a .pdf', async () => {
    // Buffer with 'MZ' Windows executable header
    const disguisedExe = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${userAToken}`)
      .attach('resume', disguisedExe, {
        filename: 'invoice.pdf',
        contentType: 'application/pdf'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/disguised executable/i);
  });

  it('3. should reject oversized upload (> 5MB)', async () => {
    const oversizedBuffer = Buffer.alloc(5.5 * 1024 * 1024); // 5.5 MB
    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${userAToken}`)
      .attach('resume', oversizedBuffer, {
        filename: 'huge_document.pdf',
        contentType: 'application/pdf'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/exceeds/i);
  });

  it('4. Anti-IDOR: User B CANNOT download User A resume', async () => {
    const res = await request(app)
      .get(`/api/resume/${userAResumeId}/download`)
      .set('Authorization', `Bearer ${userBToken}`);

    // Must be 404/403 with access denied - zero leakage
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('5. Anti-IDOR: User B CANNOT delete User A resume', async () => {
    const res = await request(app)
      .delete(`/api/resume/${userAResumeId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('6. Anti-IDOR: User B CANNOT commit reviews on User A resume extraction', async () => {
    const res = await request(app)
      .post(`/api/resume/${userAResumeId}/review`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        accepted_skills: [{ name: 'Hacking Skill', proficiency: 'advanced' }]
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('7. User A reviews extraction and commits confirmed skills into profile', async () => {
    const res = await request(app)
      .post(`/api/resume/${userAResumeId}/review`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        accepted_skills: [
          { name: 'Python', proficiency: 'intermediate' },
          { name: 'SQL', proficiency: 'intermediate' },
          { name: 'React', proficiency: 'beginner' }
        ],
        accepted_education: [
          { institution: 'City University', degree: 'B.Sc Computer Science', major: 'Computer Science', year: '2024' }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify skills were merged into profile_skills
    const skillsRes = await request(app)
      .get('/api/profile/skills')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(skillsRes.status).toBe(200);
    const skillNames = skillsRes.body.skills.map((s: any) => s.skill_name);
    expect(skillNames).toContain('Python');
    expect(skillNames).toContain('SQL');
    expect(skillNames).toContain('React');
  });

  it('8. Full Profile API returns aggregate data and updated completeness score', async () => {
    const fullRes = await request(app)
      .get('/api/profile/full')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(fullRes.status).toBe(200);
    expect(fullRes.body.success).toBe(true);
    expect(fullRes.body.data.completeness.score).toBeGreaterThanOrEqual(50);
    expect(fullRes.body.data.skills.length).toBeGreaterThanOrEqual(3);
    expect(fullRes.body.data.active_resume).toBeDefined();
    expect(fullRes.body.data.active_resume.id).toBe(userAResumeId);
  });

  it('9. User A can successfully download their own active resume', async () => {
    const res = await request(app)
      .get(`/api/resume/${userAResumeId}/download`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('attachment; filename="alice_resume.pdf"');
  });

  it('10. User A deletes their resume cleanly without wiping confirmed profile skills', async () => {
    const delRes = await request(app)
      .delete(`/api/resume/${userAResumeId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Active resume should now be null
    const activeRes = await request(app)
      .get('/api/resume/active')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(activeRes.status).toBe(200);
    expect(activeRes.body.resume).toBeNull();

    // Profile skills confirmed earlier MUST remain intact
    const skillsRes = await request(app)
      .get('/api/profile/skills')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(skillsRes.status).toBe(200);
    const skillNames = skillsRes.body.skills.map((s: any) => s.skill_name);
    expect(skillNames).toContain('Python');
    expect(skillNames).toContain('SQL');
  });
});
