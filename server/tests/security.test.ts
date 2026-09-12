import request from 'supertest';
import { createApp } from '../src/app.js';
import { getDatabase, initializeDatabase } from '../src/database/db.js';
import { seedDatabase } from '../src/database/seed.js';

describe('Security & User Data Isolation (Anti-IDOR / Anti-BOLA)', () => {
  let app: any;
  let userAToken = '';
  let userBToken = '';
  let userAId = 0;
  let userBId = 0;

  beforeAll(async () => {
    process.env.DATABASE_PATH = ':memory:';
    process.env.JWT_SECRET = 'test-security-secret-45678';
    const db = getDatabase(':memory:');
    initializeDatabase(db);
    seedDatabase(db);
    app = createApp();

    // Register User A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'user_a@futurehub.edu',
      password: 'PasswordA123!',
      year: 'TYCS',
      department: 'Computer Science'
    });
    userAToken = resA.body.token;
    userAId = resA.body.user.id;

    // Register User B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'user_b@futurehub.edu',
      password: 'PasswordB123!',
      year: 'SYCS',
      department: 'Information Technology'
    });
    userBToken = resB.body.token;
    userBId = resB.body.user.id;
  });

  it('User A and User B should have different user IDs', () => {
    expect(userAId).toBeGreaterThan(0);
    expect(userBId).toBeGreaterThan(0);
    expect(userAId).not.toBe(userBId);
  });

  it('User A saves Career 1 ("data-analyst"), User B saves Career 3 ("frontend-engineer")', async () => {
    // User A saves career 1
    const resA = await request(app)
      .post('/api/saved-careers/1')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ notes: 'User A private note' });
    expect(resA.status).toBe(200);

    // User B saves career 3
    const resB = await request(app)
      .post('/api/saved-careers/3')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ notes: 'User B private note' });
    expect(resB.status).toBe(200);
  });

  it('User A requests /api/saved-careers -> returns only Career 1, NEVER Career 3', async () => {
    const res = await request(app)
      .get('/api/saved-careers')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.saved_careers.length).toBe(1);
    expect(res.body.saved_careers[0].id).toBe(1);
    expect(res.body.saved_careers[0].notes).toBe('User A private note');
  });

  it('User B requests /api/saved-careers -> returns only Career 3, NEVER Career 1', async () => {
    const res = await request(app)
      .get('/api/saved-careers')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.saved_careers.length).toBe(1);
    expect(res.body.saved_careers[0].id).toBe(3);
    expect(res.body.saved_careers[0].notes).toBe('User B private note');
  });

  it('User B cannot delete User A saved career', async () => {
    // User B tries to delete Career 1 (which User A saved, but User B did not)
    const res = await request(app)
      .delete('/api/saved-careers/1')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/not saved/i);

    // Verify User A career 1 is still safely intact!
    const verifyA = await request(app)
      .get('/api/saved-careers')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(verifyA.body.saved_careers.length).toBe(1);
    expect(verifyA.body.saved_careers[0].id).toBe(1);
  });

  it('User B cannot modify User A profile via injected user_id in request body', async () => {
    // User B attempts to overwrite User A profile by putting user_id: userAId
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        user_id: userAId, // malicious attempt to target User A
        name: 'Hacked User A Name',
        bio: 'Malicious Bio'
      });

    expect(res.status).toBe(200);

    // Verify User B profile updated, but User A profile remains completely untouched!
    const profileA = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(profileA.body.profile.name).toBe('User A');
    expect(profileA.body.profile.bio).not.toBe('Malicious Bio');

    const profileB = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(profileB.body.profile.name).toBe('Hacked User A Name');
    expect(profileB.body.profile.bio).toBe('Malicious Bio');
  });

  it('User B cannot see User A recommendation history', async () => {
    // User A submits an assessment
    await request(app)
      .post('/api/assessment')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        name: 'User A Assessment',
        education: 'TYCS Computer Science',
        skills: ['Python', 'SQL'],
        interest: 'Data Science'
      });

    // User A history contains 1 item
    const historyA = await request(app)
      .get('/api/assessment/history')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(historyA.body.count).toBe(1);

    // User B history is empty
    const historyB = await request(app)
      .get('/api/assessment/history')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(historyB.body.count).toBe(0);
  });

  it('Roadmap Progress Isolation: User A completes Stage 1, User B does not see it completed', async () => {
    // User A marks Stage 1 of Career 1 as completed
    const markResA = await request(app)
      .put('/api/roadmap/progress')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        career_id: 1,
        stage_order: 1,
        is_completed: true
      });
    expect(markResA.status).toBe(200);

    // User A views roadmap -> stage 1 is completed
    const resA = await request(app)
      .get('/api/roadmap/1')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(resA.status).toBe(200);
    expect(resA.body.stages[0].stage_order).toBe(1);
    expect(resA.body.stages[0].is_completed).toBe(true);

    // User B views roadmap -> stage 1 is NOT completed
    const resB = await request(app)
      .get('/api/roadmap/1')
      .set('Authorization', `Bearer ${userBToken}`);
    expect(resB.status).toBe(200);
    expect(resB.body.stages[0].stage_order).toBe(1);
    expect(resB.body.stages[0].is_completed).toBe(false);
  });

  it('Saved Careers Idempotency: Saving an already saved career does not create duplicate entries', async () => {
    // User A saves Career 1 again
    const dupRes = await request(app)
      .post('/api/saved-careers/1')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ notes: 'Updated note on second save' });
    expect(dupRes.status).toBe(200);

    // Check count for User A
    const listRes = await request(app)
      .get('/api/saved-careers')
      .set('Authorization', `Bearer ${userAToken}`);
    expect(listRes.body.count).toBe(1);
    expect(listRes.body.saved_careers[0].notes).toBe('Updated note on second save');
  });

  it('Gracefully handles unsaving a career that was never saved', async () => {
    // User B tries to unsave Career 99 (not saved)
    const res = await request(app)
      .delete('/api/saved-careers/99')
      .set('Authorization', `Bearer ${userBToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/not saved/i);
  });
});
