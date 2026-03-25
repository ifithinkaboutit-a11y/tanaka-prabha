import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.unstable_mockModule('../src/config/db.js', () => ({
  pool: { query: jest.fn(), on: jest.fn() },
  query: jest.fn(),
  supabase: {},
}));

// Minimal jwt mock: sign returns a predictable token; verify checks expiry flag
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn((payload, secret, options) => {
      return `signed.${JSON.stringify(payload)}.${options?.expiresIn ?? ''}`;
    }),
    verify: jest.fn((token, secret) => {
      if (token.startsWith('expired.')) throw Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });
      if (!token.startsWith('signed.')) throw Object.assign(new Error('invalid'), { name: 'JsonWebTokenError' });
      const parts = token.split('.');
      return JSON.parse(parts[1]);
    }),
  },
}));

jest.unstable_mockModule('../src/models/Event.js', () => ({
  default: {
    findById: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/EventParticipant.js', () => ({
  default: {
    register: jest.fn(),
    findByEventId: jest.fn(),
    markAttendance: jest.fn(),
    findByUserId: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/User.js', () => ({
  default: {
    findByMobile: jest.fn(),
    findById: jest.fn(),
  },
}));

// ── App setup ────────────────────────────────────────────────────────────────

const { generateQrToken } = await import('../src/controllers/eventController.js');

const app = express();
app.use(express.json());

// Inject a fake auth user so authMiddleware is bypassed in unit tests
app.use((req, _res, next) => {
  req.user = { id: 'dashboard-admin', role: 'admin', source: 'dashboard' };
  next();
});

app.post('/events/:id/qr-token', generateQrToken);

// ── Tests ────────────────────────────────────────────────────────────────────

describe('POST /events/:id/qr-token', () => {
  let Event;
  let jwt;

  beforeEach(async () => {
    Event = (await import('../src/models/Event.js')).default;
    jwt = (await import('jsonwebtoken')).default;
    jest.clearAllMocks();
    // Restore jwt.sign mock implementation after clearAllMocks
    jwt.sign.mockImplementation((payload, secret, options) => {
      return `signed.${JSON.stringify(payload)}.${options?.expiresIn ?? ''}`;
    });
    // Restore default QR_TOKEN_SECRET
    process.env.QR_TOKEN_SECRET = 'test-qr-secret';
  });

  test('returns 200 with token and deepLink for a valid event', async () => {
    Event.findById.mockResolvedValue({ id: '42', title: 'Farmer Workshop' });

    const res = await request(app)
      .post('/events/42/qr-token')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('deepLink');
    expect(res.body.data.deepLink).toBe(
      `tanakprabha://attendance?eventId=42&token=${res.body.data.token}`
    );
  });

  test('token is signed with 24h expiry', async () => {
    Event.findById.mockResolvedValue({ id: '7', title: 'Soil Health Day' });

    await request(app).post('/events/7/qr-token').expect(200);

    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: '7', purpose: 'attendance-qr' }),
      expect.any(String),
      expect.objectContaining({ expiresIn: '24h' })
    );
  });

  test('token is signed with QR_TOKEN_SECRET (not exposed to client)', async () => {
    process.env.QR_TOKEN_SECRET = 'super-secret-qr-key';
    Event.findById.mockResolvedValue({ id: '5', title: 'Crop Demo' });

    await request(app).post('/events/5/qr-token').expect(200);

    expect(jwt.sign).toHaveBeenCalledWith(
      expect.anything(),
      'super-secret-qr-key',
      expect.anything()
    );
  });

  test('falls back to JWT_SECRET when QR_TOKEN_SECRET is absent', async () => {
    delete process.env.QR_TOKEN_SECRET;
    process.env.JWT_SECRET = 'fallback-jwt-secret';
    Event.findById.mockResolvedValue({ id: '3', title: 'Irrigation Talk' });

    await request(app).post('/events/3/qr-token').expect(200);

    expect(jwt.sign).toHaveBeenCalledWith(
      expect.anything(),
      'fallback-jwt-secret',
      expect.anything()
    );
  });

  test('returns 404 when event does not exist', async () => {
    Event.findById.mockResolvedValue(null);

    const res = await request(app)
      .post('/events/999/qr-token')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Event not found');
  });

  test('returns 500 when no secret is configured', async () => {
    delete process.env.QR_TOKEN_SECRET;
    delete process.env.JWT_SECRET;
    Event.findById.mockResolvedValue({ id: '1', title: 'Test Event' });

    const res = await request(app)
      .post('/events/1/qr-token')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(res.body.status).toBe('error');
  });

  test('deepLink contains correct eventId in URL', async () => {
    Event.findById.mockResolvedValue({ id: 'abc-123', title: 'GPS Workshop' });

    const res = await request(app).post('/events/abc-123/qr-token').expect(200);

    expect(res.body.data.deepLink).toContain('eventId=abc-123');
  });
});
