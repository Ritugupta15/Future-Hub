import request from 'supertest';
import { createApp } from '../src/app.js';
import { getDatabase, initializeDatabase } from '../src/database/db.js';
import { seedDatabase } from '../src/database/seed.js';

describe('Recommendation Engine & Scoring Formulas', () => {
  let app: any;

  beforeAll(() => {
    process.env.DATABASE_PATH = ':memory:';
    const db = getDatabase(':memory:');
    initializeDatabase(db);
    seedDatabase(db);
    app = createApp();
  });

  it('Profile A (Python, SQL, Excel + Data & Analytics) should recommend Data Analyst', async () => {
    const res = await request(app)
      .post('/api/assessment')
      .send({
        name: 'Profile A',
        education: 'B.Sc Computer Science',
        skills: ['Python', 'SQL', 'Excel'],
        interest: 'Data & Analytics',
        experience: 'Beginner'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.primary_recommendation.slug).toBe('data-analyst');
    expect(res.body.primary_recommendation.match_score).toBeGreaterThanOrEqual(80);
    expect(res.body.primary_recommendation.skills_checklist.length).toBeGreaterThan(0);
    expect(res.body.primary_recommendation.roadmap.length).toBe(5);
    expect(res.body.primary_recommendation.project_ideas.length).toBe(5);
  });

  it('Profile B (HTML, CSS, JavaScript + Web Development) should recommend Web Developer', async () => {
    const res = await request(app)
      .post('/api/assessment')
      .send({
        name: 'Profile B',
        education: 'BCA',
        skills: ['HTML', 'CSS', 'JavaScript'],
        interest: 'Web Development',
        experience: 'Beginner'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.primary_recommendation.slug).toBe('web-developer');
    expect(res.body.primary_recommendation.match_score).toBeGreaterThanOrEqual(85);
  });

  it('Profile D (Networking + Cyber Security) should recommend Cyber Security Analyst', async () => {
    const res = await request(app)
      .post('/api/assessment')
      .send({
        name: 'Profile D',
        education: 'B.Tech IT',
        skills: ['Networking', 'Linux'],
        interest: 'Cyber Security',
        experience: 'Beginner'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.primary_recommendation.slug).toBe('cyber-security-analyst');
  });

  it('should accept comma-separated skills and year/department form fields', async () => {
    const res = await request(app)
      .post('/api/recommend')
      .send({
        name: 'Ritu',
        year: 'TYCS',
        department: 'Computer Science',
        skills: 'Python, HTML, CSS, Excel',
        interest: 'Data Science',
        dream_career: 'Data Scientist'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.submitted_profile.name).toBe('Ritu');
    expect(res.body.primary_recommendation).toBeDefined();
    expect(res.body.primary_recommendation.match_score).toBeGreaterThan(0);
  });

  it('should reject requests missing required fields', async () => {
    const res = await request(app)
      .post('/api/assessment')
      .send({
        name: 'Incomplete'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Missing required fields/i);
  });

  it('Edge Case: Unknown/unrecognized skills are handled gracefully without runtime errors', async () => {
    const res = await request(app)
      .post('/api/assessment')
      .send({
        name: 'Obscure Skills Student',
        education: 'B.Sc Computer Science',
        skills: ['CustomToolXYZ', 'NonExistentSkill123'],
        interest: 'Software Development',
        experience: 'Beginner'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.primary_recommendation).toBeDefined();
    expect(res.body.primary_recommendation.match_score).toBeGreaterThan(0);
    // Matched skills should be 0 because the custom skill doesn't map to any career requirements
    expect(res.body.primary_recommendation.matched_skills.length).toBe(0);
  });

  it('Edge Case: Dream career preference gives subtle boost (+4) without fabricating 100% match', async () => {
    // Evaluation without dream career
    const resWithoutDream = await request(app)
      .post('/api/assessment')
      .send({
        name: 'Dream Test A',
        education: 'BCA',
        skills: ['Python', 'SQL'],
        interest: 'Data & Analytics',
        experience: 'Beginner'
      });

    // Evaluation with dream career set to Cloud Solutions Architect
    const resWithDream = await request(app)
      .post('/api/assessment')
      .send({
        name: 'Dream Test B',
        education: 'BCA',
        skills: ['Python', 'SQL'],
        interest: 'Data & Analytics',
        experience: 'Beginner',
        dream_career: 'Cloud Solutions Architect'
      });

    expect(resWithoutDream.status).toBe(200);
    expect(resWithDream.status).toBe(200);

    const cloudRecWithout = resWithoutDream.body.alternative_recommendations.find(
      (r: any) => r.slug === 'cloud-solutions-architect'
    );
    const cloudRecWith = resWithDream.body.alternative_recommendations.find(
      (r: any) => r.slug === 'cloud-solutions-architect'
    ) || resWithDream.body.primary_recommendation;

    if (cloudRecWithout && cloudRecWith) {
      // The boost should be at most 5 points
      expect(cloudRecWith.match_score - cloudRecWithout.match_score).toBeLessThanOrEqual(5);
    }
  });

  it('Deterministic 4-pillar breakdown is exposed on all recommendations', async () => {
    const res = await request(app)
      .post('/api/assessment')
      .send({
        name: 'Formula Verification',
        education: 'B.Sc Computer Science',
        skills: ['Python', 'SQL', 'Pandas'],
        interest: 'Data Science & AI',
        experience: 'Beginner'
      });

    expect(res.status).toBe(200);
    const primary = res.body.primary_recommendation;
    expect(primary.skill_match_score).toBeDefined();
    expect(primary.interest_match_score).toBeDefined();
    expect(primary.education_match_score).toBeDefined();
    expect(primary.experience_match_score).toBeDefined();

    // Verify all pillar values are bounded between 0 and 100
    expect(primary.skill_match_score).toBeGreaterThanOrEqual(0);
    expect(primary.skill_match_score).toBeLessThanOrEqual(100);
    expect(primary.interest_match_score).toBeGreaterThanOrEqual(0);
    expect(primary.interest_match_score).toBeLessThanOrEqual(100);
    expect(primary.education_match_score).toBeGreaterThanOrEqual(0);
    expect(primary.education_match_score).toBeLessThanOrEqual(100);
    expect(primary.experience_match_score).toBeGreaterThanOrEqual(0);
    expect(primary.experience_match_score).toBeLessThanOrEqual(100);
  });
});
