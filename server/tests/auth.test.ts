import request from 'supertest';
import { createApp } from '../src/app.js';
import { getDatabase, initializeDatabase } from '../src/database/db.js';
import { seedDatabase } from '../src/database/seed.js';

describe('Authentication & User Management API', () => {
  let app: any;
  const testEmail = `student_${Date.now()}@futurehub.edu`;
  let authToken = '';

  beforeAll(() => {
    process.env.DATABASE_PATH = ':memory:';
    process.env.JWT_SECRET = 'test-secret-key-12345';
    const db = getDatabase(':memory:');
    initializeDatabase(db);
    seedDatabase(db);
    app = createApp();
  });

  it('should successfully register a new student account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ritu Sharma',
        email: testEmail,
        password: 'Password123!',
        year: 'TYCS',
        department: 'Computer Science'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testEmail.toLowerCase());
    expect(res.body.user.name).toBe('Ritu Sharma');
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password_hash).toBeUndefined(); // never leak hash!

    authToken = res.body.token;
  });

  it('should reject registration with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ritu Duplicate',
        email: testEmail,
        password: 'AnotherPassword123'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/already exists/i);
  });

  it('should reject registration with short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Short Pass',
        email: 'shortpass@example.com',
        password: '123'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/at least 6 characters/i);
  });

  it('should successfully login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail.toLowerCase());
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'IncorrectPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/invalid email or password/i);
  });

  it('should reject access to protected /api/auth/me without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return profile on /api/auth/me with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testEmail.toLowerCase());
  });

  it('should reject access with malformed or tampered token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.tampered.token');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Profile API: should read and update profile fields partially without wiping untouched data', async () => {
    // 1. Initial read
    const getRes1 = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(getRes1.status).toBe(200);
    expect(getRes1.body.profile.name).toBe('Ritu Sharma');

    // 2. Partial update: only education and dream_career
    const updateRes = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        education: 'Bachelor of Computer Applications (BCA)',
        dream_career: 'AI / Machine Learning Engineer',
        location: 'Mumbai, India'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.profile.education).toBe('Bachelor of Computer Applications (BCA)');
    expect(updateRes.body.profile.dream_career).toBe('AI / Machine Learning Engineer');
    expect(updateRes.body.profile.location).toBe('Mumbai, India');
    // Name should remain untouched
    expect(updateRes.body.profile.name).toBe('Ritu Sharma');

    // 3. Second read confirms persistence
    const getRes2 = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(getRes2.status).toBe(200);
    expect(getRes2.body.profile.education).toBe('Bachelor of Computer Applications (BCA)');
    expect(getRes2.body.profile.name).toBe('Ritu Sharma');
  });
});
