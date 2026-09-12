import request from 'supertest';
import { createApp } from '../src/app.js';
import { getDatabase, initializeDatabase } from '../src/database/db.js';
import { seedDatabase } from '../src/database/seed.js';

describe('Careers Catalog & Exploration API', () => {
  let app: any;

  beforeAll(() => {
    process.env.DATABASE_PATH = ':memory:';
    const db = getDatabase(':memory:');
    initializeDatabase(db);
    seedDatabase(db);
    app = createApp();
  });

  it('GET /api/careers should return all 15 active careers', async () => {
    const res = await request(app).get('/api/careers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(15);
    expect(res.body.careers.length).toBe(15);

    const first = res.body.careers[0];
    expect(first.id).toBeDefined();
    expect(first.title).toBeDefined();
    expect(first.category).toBeDefined();
    expect(first.required_skills.length).toBeGreaterThan(0);
  });

  it('GET /api/careers with category filter should return filtered list', async () => {
    const res = await request(app).get('/api/careers?category=Data%20%26%20Analytics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.careers.every((c: any) => c.category === 'Data & Analytics')).toBe(true);
  });

  it('GET /api/careers/:id should return full details for valid slug', async () => {
    const res = await request(app).get('/api/careers/data-analyst');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.career.title).toBe('Data Analyst');
    expect(res.body.career.resources.length).toBeGreaterThanOrEqual(3);
    expect(res.body.career.roadmap.length).toBe(5);
    expect(res.body.career.projects.length).toBe(5);
  });

  it('GET /api/careers/:id should return 404 for unknown career', async () => {
    const res = await request(app).get('/api/careers/non-existent-career');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/careers/skills should return grouped skills by category', async () => {
    const res = await request(app).get('/api/careers/skills');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.skills_by_category.length).toBeGreaterThan(0);
  });

  it('GET /api/careers/interests should return all interests', async () => {
    const res = await request(app).get('/api/careers/interests');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.interests.length).toBeGreaterThanOrEqual(5);
  });

  it('GET /api/careers/projects should return project ideas list', async () => {
    const res = await request(app).get('/api/careers/projects');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });
});
