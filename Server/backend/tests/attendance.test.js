import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.unstable_mockModule('../src/config/db.js', () => ({
  pool: { query: jest.fn(), on: jest.fn() },
  query: jest.fn(),
  supabase: {},
}));

// jwt mock: sign returns predictable token; verify checks prefix
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn((payload, secret, options) => {
      return `signed.${JSON.stringify(payload)}.${options?.expiresIn ?? ''}`;
    }),
    verify: jest.fn((token, secret) => {
      if (token.startsWith('expired.')) {
        throw Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });
      }
      if (!token.startsWith('signed.')) {
        throw Object.assign(new Error('invalid signature'), { name: 'JsonWebTokenError' });
      }
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
    findAttendance: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/User.js', () => ({
  default: {
    findByMobile: jest.fn(),
    findById: jest.fn(),
  },
}));

// ── App setup ────────────────────────────────────────────────────────────────

const { markAttendance } = await import('../src/controllers/eventController.js');

const app = express();
app.use(express.json());

// Inject a fake authenticated user (farmer scanning QR)
app.use((req, _res, next) => {
  req.user = { userId: 'user-123', mobile_number: '9876543210', role: 'user' };
  next();
});

app.post('/events/:id/attendance', markAttendance);

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeToken(payload) {
  return `signed.${JSON.stringify(payload)}.24h`;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('POST /events/:id/attendance — QR token validation', () => {
  let EventParticipant;
  let User;

  beforeEach(async () => {
    EventParticipant = (await import('../src/models/EventParticipant.js')).default;
    User = (await import('../src/models/User.js')).default;
    const jwt = (await import('jsonwebtoken')).default;
    jest.clearAllMocks();
    process.env.QR_TOKEN_SECRET = 'test-qr-secret';

    // Restore mock implementations after clearAllMocks
    jwt.verify.mockImplementation((token, secret) => {
      if (token.startsWith('expired.')) {
        throw Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });
      }
      if (!token.startsWith('signed.')) {
        throw Object.assign(new Error('invalid signature'), { name: 'JsonWebTokenError' });
      }
      const parts = token.split('.');
      return JSON.parse(parts[1]);
    });
  });

  // ── 401 cases ──────────────────────────────────────────────────────────────

  test('returns 401 when token is expired', async () => {
    const res = await request(app)
      .post('/events/42/attendance')
      .send({ token: 'expired.payload.here' })
      .expect('Content-Type', /json/)
      .expect(401);

    expect(res.body.status).toBe('error');
    expect(res.body.message).toMatch(/expired/i);
  });

  test('returns 401 when token signature is invalid', async () => {
    const res = await request(app)
      .post('/events/42/attendance')
      .send({ token: 'tampered.bad.token' })
      .expect('Content-Type', /json/)
      .expect(401);

    expect(res.body.status).toBe('error');
    expect(res.body.message).toMatch(/invalid/i);
  });

  test('returns 401 when token eventId does not match route :id', async () => {
    const token = makeToken({ eventId: '99', purpose: 'attendance-qr' });

    const res = await request(app)
      .post('/events/42/attendance')
      .send({ token })
      .expect('Content-Type', /json/)
      .expect(401);

    expect(res.body.status).toBe('error');
    expect(res.body.message).toMatch(/invalid/i);
  });

  test('returns 401 when token purpose is not attendance-qr', async () => {
    const token = makeToken({ eventId: '42', purpose: 'something-else' });

    const res = await request(app)
      .post('/events/42/attendance')
      .send({ token })
      .expect('Content-Type', /json/)
      .expect(401);

    expect(res.body.status).toBe('error');
  });

  // ── 409 case ───────────────────────────────────────────────────────────────

  test('returns 409 when user has already attended', async () => {
    const token = makeToken({ eventId: '42', purpose: 'attendance-qr' });
    EventParticipant.findAttendance.mockResolvedValue({ status: 'attended', mobile_number: '9876543210' });

    const res = await request(app)
      .post('/events/42/attendance')
      .send({ token })
      .expect('Content-Type', /json/)
      .expect(409);

    expect(res.body.status).toBe('error');
    expect(res.body.message).toMatch(/already/i);
  });

  // ── 200 success case ───────────────────────────────────────────────────────

  test('returns 200 and marks attendance for a valid token', async () => {
    const token = makeToken({ eventId: '42', purpose: 'attendance-qr' });
    EventParticipant.findAttendance.mockResolvedValue(null); // not yet attended
    EventParticipant.register.mockResolvedValue({ id: 'p1' });
    EventParticipant.markAttendance.mockResolvedValue({
      id: 'p1',
      event_id: '42',
      mobile_number: '9876543210',
      status: 'attended',
    });
    User.findByMobile.mockResolvedValue(null);

    const res = await request(app)
      .post('/events/42/attendance')
      .send({ token })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.data.participant.status).toBe('attended');
    expect(EventParticipant.register).toHaveBeenCalled();
    expect(EventParticipant.markAttendance).toHaveBeenCalledWith('42', '9876543210');
  });

  test('enriches participant with user data when user is found by mobile', async () => {
    const token = makeToken({ eventId: '5', purpose: 'attendance-qr' });
    EventParticipant.findAttendance.mockResolvedValue(null);
    User.findByMobile.mockResolvedValue({ id: 'db-user-99', name: 'Ravi Kumar' });
    EventParticipant.register.mockResolvedValue({ id: 'p2' });
    EventParticipant.markAttendance.mockResolvedValue({ id: 'p2', status: 'attended' });

    const res = await request(app)
      .post('/events/5/attendance')
      .send({ token })
      .expect(200);

    // The controller uses req.user.userId when available (authenticated QR flow)
    expect(EventParticipant.register).toHaveBeenCalledWith(
      '5',
      'user-123',       // from req.user.userId
      '9876543210',
      undefined         // no name in body
    );
    expect(res.body.status).toBe('success');
  });

  // ── Backward-compatible admin flow (no token) ──────────────────────────────

  test('admin flow without token still marks attendance (backward compatible)', async () => {
    EventParticipant.markAttendance.mockResolvedValue({
      id: 'p3',
      event_id: '10',
      mobile_number: '1111111111',
      status: 'attended',
    });

    const res = await request(app)
      .post('/events/10/attendance')
      .send({ mobile_number: '1111111111', name: 'Admin User' })
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(EventParticipant.markAttendance).toHaveBeenCalledWith('10', '1111111111');
    // findAttendance should NOT be called in the admin flow
    expect(EventParticipant.findAttendance).not.toHaveBeenCalled();
  });

  test('admin flow registers participant when not found, then marks attended', async () => {
    EventParticipant.markAttendance
      .mockResolvedValueOnce(null) // first call: not found
      .mockResolvedValueOnce({ id: 'p4', status: 'attended' }); // second call: success
    EventParticipant.register.mockResolvedValue({ id: 'p4' });
    User.findByMobile.mockResolvedValue(null);

    const res = await request(app)
      .post('/events/10/attendance')
      .send({ mobile_number: '2222222222', name: 'New Farmer' })
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(EventParticipant.register).toHaveBeenCalled();
  });
});
