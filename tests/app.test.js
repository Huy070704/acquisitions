/* eslint-env jest */
import request from 'supertest';
import app from '#src/app.js';

describe('API endpoints', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body).toHaveProperty('status', 'ok'); // "ok" viết thường
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
  });

  it('should return api message', async () => {
    const res = await request(app).get('/api').expect(200);
    expect(res.body).toHaveProperty('message', 'acquisitions API is running');
  });

  it('should return 404 for nonexistent endpoint', async () => {
    const res = await request(app).get('/nonexistent').expect(404);
    expect(res.body).toHaveProperty('error', 'route not found');
  });
});
