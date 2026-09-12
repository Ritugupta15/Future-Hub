import request from 'supertest';
import { createApp } from '../src/app.js';
import { getDatabase, initializeDatabase } from '../src/database/db.js';
import { seedDatabase } from '../src/database/seed.js';

describe('Profile Sub-Resources, Partial Updates, Validation & Completeness', () => {
  let app: any;
  let tokenA = '';
  let userAId = 0;
  let tokenB = '';
  let userBId = 0;

  beforeAll(async () => {
    process.env.DATABASE_PATH = ':memory:';
    process.env.JWT_SECRET = 'test-secret-key-subresources-123';
    const db = getDatabase(':memory:');
    initializeDatabase(db);
    seedDatabase(db);
    app = createApp();

    // Register User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Subresource',
        email: 'alice.sub@futurehub.edu',
        password: 'Password123!',
        education: 'B.Sc Computer Science (TYCS / SYCS / FYCS)',
        experience_level: 'Beginner',
        year: 'Third Year (TY)',
        department: 'Computer Science'
      });
    tokenA = resA.body.token;
    userAId = resA.body.user.id;

    // Register User B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Attacker',
        email: 'bob.sub@futurehub.edu',
        password: 'Password123!',
        education: 'BCA',
        experience_level: 'Beginner'
      });
    tokenB = resB.body.token;
    userBId = resB.body.user.id;
  });

  it('1. Initial profile completeness calculates accurately based on registration baseline', async () => {
    const res = await request(app)
      .get('/api/profile/completeness')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.completeness).toBeDefined();
    // Alice has name+email (15%), degree (10%), year (5%), dept (5%), exp (10%) = 45%
    expect(res.body.completeness.score).toBeGreaterThanOrEqual(40);
    expect(res.body.completeness.next_recommended_action).toBeDefined();
  });

  let skillReactId: number;
  it('2. User A can add technical skills with valid proficiency enums', async () => {
    const res = await request(app)
      .post('/api/profile/skills')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        skill_name: 'React',
        proficiency_level: 'intermediate',
        category: 'Web Development',
        source: 'manual'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.skill_name).toBe('React');
    expect(res.body.data.proficiency_level).toBe('intermediate');
    skillReactId = res.body.data.id;

    // Add 2 more skills to satisfy "3+ Technical Skills = 15%"
    await request(app)
      .post('/api/profile/skills')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ skill_name: 'TypeScript', proficiency_level: 'advanced' });

    await request(app)
      .post('/api/profile/skills')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ skill_name: 'Node.js', proficiency_level: 'intermediate' });
  });

  it('3. Rejects invalid proficiency enum value gracefully with HTTP 400', async () => {
    const res = await request(app)
      .post('/api/profile/skills')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        skill_name: 'Rust',
        proficiency_level: 'master_ninja'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  let eduId: number;
  it('4. User A can add formal education record', async () => {
    const res = await request(app)
      .post('/api/profile/education')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        institution: 'Mumbai Institute of Technology',
        degree: 'B.Sc Computer Science',
        major: 'Software Engineering',
        academic_year: 'Third Year (TY)',
        graduation_year: '2026'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.institution).toBe('Mumbai Institute of Technology');
    eduId = res.body.data.id;
  });

  let expId: number;
  it('5. User A can add practical experience / internship record', async () => {
    const res = await request(app)
      .post('/api/profile/experience')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        organization: 'Alpha Cloud Solutions',
        role: 'Frontend Engineering Intern',
        start_date: '2025-06-01',
        end_date: '2025-09-01',
        description: 'Developed React design system components and integrated REST endpoints.',
        technologies: 'React, TypeScript, Tailwind'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.organization).toBe('Alpha Cloud Solutions');
    expId = res.body.data.id;
  });

  let projId: number;
  it('6. User A can add portfolio project record', async () => {
    const res = await request(app)
      .post('/api/profile/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'FutureHub Guidance Platform',
        description: 'Deterministic career assessment engine built with Node.js and React.',
        technologies: 'TypeScript, React, Node.js, SQLite',
        github_url: 'https://github.com/alice/futurehub-core'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('FutureHub Guidance Platform');
    projId = res.body.data.id;
  });

  let certId: number;
  it('7. User A can add professional certification record', async () => {
    const res = await request(app)
      .post('/api/profile/certifications')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        issue_date: '2025-11-15',
        credential_id: 'AWS-CCP-987654',
        verification_url: 'https://aws.amazon.com/verify/AWS-CCP-987654'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('AWS Certified Cloud Practitioner');
    certId = res.body.data.id;
  });

  it('8. User A can set career goals and external links', async () => {
    const resGoals = await request(app)
      .put('/api/profile/goals')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        target_roles: 'Full Stack Engineer, Frontend Architect',
        preferred_domains: 'Web Development, Cloud',
        target_tech: 'React, TypeScript, GraphQL, Docker',
        short_term_goal: 'Secure a graduate full stack software engineering placement.',
        long_term_goal: 'Lead frontend engineering teams on distributed platforms.'
      });
    expect(resGoals.status).toBe(200);
    expect(resGoals.body.success).toBe(true);

    const resLinks = await request(app)
      .put('/api/profile/links')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        github_url: 'https://github.com/alice-engineer',
        linkedin_url: 'https://linkedin.com/in/alice-engineer',
        portfolio_url: 'https://alice.dev'
      });
    expect(resLinks.status).toBe(200);
    expect(resLinks.body.success).toBe(true);
  });

  it('9. Partial profile update never wipes untouched fields', async () => {
    // Alice updates only bio and dream_career
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        bio: 'Passionate computer science student building reliable software.',
        dream_career: 'Full Stack Engineer'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify all earlier fields remain intact!
    const meRes = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(meRes.body.profile.name).toBe('Alice Subresource');
    expect(meRes.body.profile.email).toBe('alice.sub@futurehub.edu');
    expect(meRes.body.profile.education).toBe('B.Sc Computer Science (TYCS / SYCS / FYCS)');
    expect(meRes.body.profile.year).toBe('Third Year (TY)');
    expect(meRes.body.profile.department).toBe('Computer Science');
    expect(meRes.body.profile.bio).toBe('Passionate computer science student building reliable software.');
    expect(meRes.body.profile.dream_career).toBe('Full Stack Engineer');
  });

  it('10. Full profile aggregation returns unified data and increased completeness', async () => {
    const res = await request(app)
      .get('/api/profile/full')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.skills.length).toBeGreaterThanOrEqual(3);
    expect(res.body.data.education.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.experience.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.projects.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.certifications.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.goals.target_roles).toContain('Full Stack Engineer');
    expect(res.body.data.links.github_url).toBe('https://github.com/alice-engineer');

    // Completeness score should now reflect full profile enrichment (>= 85%)
    expect(res.body.data.completeness.score).toBeGreaterThanOrEqual(85);
  });

  it('11. Anti-IDOR: User B CANNOT delete User A sub-resources', async () => {
    // User B attempts to delete User A's education entry
    const delEduRes = await request(app)
      .delete(`/api/profile/education/${eduId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(delEduRes.status).toBe(404);

    // User B attempts to delete User A's project
    const delProjRes = await request(app)
      .delete(`/api/profile/projects/${projId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(delProjRes.status).toBe(404);

    // User B attempts to delete User A's certification
    const delCertRes = await request(app)
      .delete(`/api/profile/certifications/${certId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(delCertRes.status).toBe(404);
  });

  it('12. User A can delete their own sub-resource cleanly with completeness recalculation', async () => {
    const res = await request(app)
      .delete(`/api/profile/certifications/${certId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const fullRes = await request(app)
      .get('/api/profile/full')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(fullRes.body.data.certifications.some((c: any) => c.id === certId)).toBe(false);
  });
});
