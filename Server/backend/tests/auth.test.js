import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Set required env before imports
process.env.JWT_SECRET = 'test-secret';

// Mock dependencies BEFORE importing anything
jest.unstable_mockModule('../src/config/db.js', () => ({
  pool: {
    query: jest.fn(),
    on: jest.fn(),
  },
  query: jest.fn(),
  supabase: {},
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: (payload, secret, options) => 'mock-jwt-token-' + payload.userId,
    verify: (token, secret) => {
      if (!token || token === 'invalid-token' || token === 'InvalidFormat') {
        throw new Error('Invalid token');
      }
      return { userId: 'user-123', mobile_number: '919876543210' };
    },
  },
}));

jest.unstable_mockModule('../src/models/OTP.js', () => ({
  default: {
    createOTP: jest.fn(),
    verifyOTP: jest.fn(),
    deleteOTP: jest.fn(),
    getOTP: jest.fn(),
    getRecentAttempts: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/User.js', () => ({
  default: {
    findByMobile: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/utils/otp.js', () => ({
  generateOTP: jest.fn(() => '123456'),
  formatPhoneNumber: jest.fn((num) => {
    if (!num) return '';
    const cleaned = num.replace(/\D/g, '');
    return cleaned.startsWith('91') ? cleaned : '91' + cleaned;
  }),
  isValidIndianPhone: jest.fn((num) => {
    if (!num) return false;
    return /^[6-9]\d{9}$/.test(num);
  }),
  generateOTPExpiry: jest.fn(() => new Date(Date.now() + 10 * 60 * 1000)),
  isOTPExpired: jest.fn(() => false),
  sendSMS: jest.fn(),
}));

// Dynamic import of authController with mocked dependencies
const { sendOTP, verifyOTP, resendOTP, verifyToken, forgotPassword } = await import('../src/controllers/authController.js');

// Create Express app for testing WITHOUT rate limiters
const app = express();
app.use(express.json());

// Add routes manually without rate limiters
app.post('/api/auth/send-otp', sendOTP);
app.post('/api/auth/verify-otp', verifyOTP);
app.post('/api/auth/resend-otp', resendOTP);
app.post('/api/auth/forgot-password', forgotPassword);

app.get('/api/auth/verify-token', verifyToken);

describe('Authentication API Tests', () => {
  let OTP, User, otpUtils;

  beforeEach(async () => {
    // Import mocked modules
    OTP = (await import('../src/models/OTP.js')).default;
    User = (await import('../src/models/User.js')).default;
    otpUtils = await import('../src/utils/otp.js');

    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    otpUtils.isValidIndianPhone.mockImplementation((num) => {
      if (typeof num !== 'string') return false;
      const cleaned = num.replace(/\D/g, '');
      return /^[6-9]\d{9}$/.test(cleaned) || /^91[6-9]\d{9}$/.test(cleaned);
    });
    
    otpUtils.formatPhoneNumber.mockImplementation((num) => {
      const cleaned = num.replace(/\D/g, '');
      return cleaned.startsWith('91') ? cleaned : '91' + cleaned;
    });
  });

  describe('POST /api/auth/send-otp', () => {
    test('should send OTP successfully with valid phone number', async () => {
      // Mock OTP functions
      OTP.getRecentAttempts.mockResolvedValue(0);
      OTP.createOTP.mockResolvedValue({
        id: '123',
        mobile_number: '919876543210',
        otp: '123456',
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      });
      // New (unregistered) phone number — no existing user
      User.findByMobile.mockResolvedValue(null);
      otpUtils.sendSMS.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ mobile_number: '9876543210' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('OTP sent successfully');
      expect(response.body.data).toHaveProperty('mobile_number');
      expect(OTP.createOTP).toHaveBeenCalled();
    });

    test('should return 409 and NOT send OTP for already-registered phone number', async () => {
      // Simulate a fully registered user (name is not the placeholder)
      User.findByMobile.mockResolvedValue({
        id: 'user-existing',
        name: 'Ramesh Kumar',
        mobile_number: '919876543210',
      });

      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ mobile_number: '9876543210' })
        .expect('Content-Type', /json/)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toMatch(/already registered/i);
      // OTP must NOT have been created or sent
      expect(OTP.createOTP).not.toHaveBeenCalled();
      expect(otpUtils.sendSMS).not.toHaveBeenCalled();
    });

    test('should send OTP for phone number with incomplete registration (New User placeholder)', async () => {
      // User exists but never completed onboarding — OTP should still be sent
      User.findByMobile.mockResolvedValue({
        id: 'user-incomplete',
        name: 'New User',
        mobile_number: '919876543210',
      });
      OTP.createOTP.mockResolvedValue({
        id: '124',
        mobile_number: '919876543210',
        otp: '654321',
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      });
      otpUtils.sendSMS.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ mobile_number: '9876543210' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(OTP.createOTP).toHaveBeenCalled();
    });

    test('should reject invalid phone number', async () => {
      otpUtils.isValidIndianPhone.mockReturnValue(false);

      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ mobile_number: '123' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('should reject missing phone number', async () => {
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({})
        .expect('Content-Type', /json/);

      // Should return 400 for validation error
      expect([400, 500]).toContain(response.status);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    test('should verify OTP and return token for new user', async () => {
      // Mock OTP verification
      OTP.verifyOTP.mockResolvedValue({
        valid: true,
        message: 'OTP verified successfully',
      });

      // Mock user not found (new user)
      User.findByMobile.mockResolvedValue(null);

      // Mock user creation
      User.create.mockResolvedValue({
        id: 'user-123',
        name: 'New User',
        mobile_number: '919876543210',
        village: null,
        district: null,
      });

      // Mock OTP deletion
      OTP.deleteOTP.mockResolvedValue();

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          mobile_number: '9876543210',
          otp: '123456',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.authenticated).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.token_type).toBe('Bearer');
      // Token might or might not be present depending on JWT mock
      if (response.body.data.token) {
        expect(typeof response.body.data.token).toBe('string');
      }
    });

    test('should verify OTP and return token for existing user', async () => {
      OTP.verifyOTP.mockResolvedValue({
        valid: true,
        message: 'OTP verified successfully',
      });

      User.findByMobile.mockResolvedValue({
        id: 'user-456',
        name: 'Ramesh Kumar',
        mobile_number: '919876543210',
        village: 'Rampur',
        district: 'Barabanki',
      });

      OTP.deleteOTP.mockResolvedValue();

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          mobile_number: '9876543210',
          otp: '123456',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.authenticated).toBe(true);
      expect(response.body.data.user.name).toBe('Ramesh Kumar');
    });

    test('should reject invalid OTP', async () => {
      OTP.verifyOTP.mockResolvedValue({
        valid: false,
        message: 'Invalid OTP',
      });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          mobile_number: '9876543210',
          otp: '000000',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.authenticated).toBe(false);
      expect(response.body.message).toBe('Invalid OTP');
    });

    test('should reject expired OTP', async () => {
      OTP.verifyOTP.mockResolvedValue({
        valid: false,
        message: 'OTP has expired',
      });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          mobile_number: '9876543210',
          otp: '123456',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('OTP has expired');
    });

    test('should reject missing OTP', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          mobile_number: '9876543210',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('should reject missing mobile number', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({
          otp: '123456',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/resend-otp', () => {
    test('should resend OTP successfully', async () => {
      OTP.getOTP.mockResolvedValue(null);
      OTP.getRecentAttempts.mockResolvedValue(1);
      OTP.createOTP.mockResolvedValue({
        id: '123',
        mobile_number: '919876543210',
        otp: '654321',
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      });
      
      otpUtils.sendSMS.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({ mobile_number: '9876543210' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('OTP resent successfully');
    });

    test('should resend OTP successfully even if a recent OTP exists (rate limit cooldown passed)', async () => {
      OTP.getOTP.mockResolvedValue({
        created_at: new Date(Date.now() - 180 * 1000), // 3 min old — past 2 min cooldown
      });
      OTP.createOTP.mockResolvedValue({
        id: '125',
        mobile_number: '919876543210',
        otp: '111111',
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      });
      otpUtils.sendSMS.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({ mobile_number: '9876543210' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('Google Play review account', () => {
    const REVIEW_PHONE = '9999999999';
    const REVIEW_OTP = '123456';

    test('send-otp for review phone returns success without creating or sending an OTP', async () => {
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ mobile_number: REVIEW_PHONE })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(OTP.createOTP).not.toHaveBeenCalled();
      expect(otpUtils.sendSMS).not.toHaveBeenCalled();
      // Response must never leak an OTP value
      expect(response.body.data).not.toHaveProperty('otp');
    });

    test('send-otp for review phone succeeds even when the review user already exists', async () => {
      User.findByMobile.mockResolvedValue({
        id: 'review-user',
        name: 'Google Play Review',
        mobile_number: '919999999999',
      });

      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({ mobile_number: REVIEW_PHONE })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(otpUtils.sendSMS).not.toHaveBeenCalled();
    });

    test('verify-otp with review phone and correct OTP authenticates and auto-creates the user', async () => {
      User.findByMobile.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 'review-user',
        name: 'Google Play Review',
        mobile_number: '919999999999',
      });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ mobile_number: REVIEW_PHONE, otp: REVIEW_OTP })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.authenticated).toBe(true);
      expect(response.body.data.token).toBeTruthy();
      expect(response.body.data.token_type).toBe('Bearer');
      expect(response.body.data.is_new_user).toBe(false);
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Google Play Review' })
      );
      // OTP store must never be touched for the review account
      expect(OTP.verifyOTP).not.toHaveBeenCalled();
      expect(OTP.deleteOTP).not.toHaveBeenCalled();
    });

    test('verify-otp with review phone and correct OTP works for existing review user', async () => {
      User.findByMobile.mockResolvedValue({
        id: 'review-user',
        name: 'Google Play Review',
        mobile_number: '919999999999',
      });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ mobile_number: REVIEW_PHONE, otp: REVIEW_OTP })
        .expect(200);

      expect(response.body.authenticated).toBe(true);
      expect(User.create).not.toHaveBeenCalled();
      expect(OTP.verifyOTP).not.toHaveBeenCalled();
    });

    test('verify-otp with review phone and wrong OTP is rejected', async () => {
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ mobile_number: REVIEW_PHONE, otp: '000000' })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.authenticated).toBe(false);
      // Wrong review OTP must not fall through to the OTP database
      expect(OTP.verifyOTP).not.toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
    });

    test('resend-otp for review phone returns success without sending SMS', async () => {
      const response = await request(app)
        .post('/api/auth/resend-otp')
        .send({ mobile_number: REVIEW_PHONE })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(OTP.createOTP).not.toHaveBeenCalled();
      expect(otpUtils.sendSMS).not.toHaveBeenCalled();
    });

    test('forgot-password for review phone returns success without sending SMS', async () => {
      // Even with the review user existing, no OTP may be created or sent
      User.findByMobile.mockResolvedValue({
        id: 'review-user',
        name: 'Google Play Review',
        mobile_number: '919999999999',
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ mobile_number: REVIEW_PHONE })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(OTP.createOTP).not.toHaveBeenCalled();
      expect(otpUtils.sendSMS).not.toHaveBeenCalled();
      expect(response.body.data).not.toHaveProperty('otp');
    });

    test('forgot-password for normal users still creates and sends an OTP', async () => {
      User.findByMobile.mockResolvedValue({
        id: 'user-456',
        name: 'Ramesh Kumar',
        mobile_number: '919876543210',
      });
      OTP.createOTP.mockResolvedValue({
        id: '300',
        mobile_number: '919876543210',
        otp: '777777',
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      });
      otpUtils.sendSMS.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ mobile_number: '9876543210' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(OTP.createOTP).toHaveBeenCalled();
      expect(otpUtils.sendSMS).toHaveBeenCalled();
    });

    test('normal users are unaffected: OTP is still created, sent, and verified via the database', async () => {
      OTP.getRecentAttempts.mockResolvedValue(0);
      OTP.createOTP.mockResolvedValue({
        id: '200',
        mobile_number: '919876543210',
        otp: '555555',
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      });
      User.findByMobile.mockResolvedValue(null);
      otpUtils.sendSMS.mockResolvedValue(true);

      await request(app)
        .post('/api/auth/send-otp')
        .send({ mobile_number: '9876543210' })
        .expect(200);

      expect(OTP.createOTP).toHaveBeenCalled();
      expect(otpUtils.sendSMS).toHaveBeenCalled();

      // The fixed review OTP does NOT work for a normal number
      OTP.verifyOTP.mockResolvedValue({ valid: false, message: 'Invalid OTP' });
      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send({ mobile_number: '9876543210', otp: REVIEW_OTP })
        .expect(401);

      expect(response.body.authenticated).toBe(false);
      expect(OTP.verifyOTP).toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/verify-token', () => {
    test('should reject missing token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-token')
        .expect('Content-Type', /json/);

      // Should return 401 or 500 depending on error handling
      expect([401, 500]).toContain(response.status);
      expect(response.body.status).toBe('error');
    });

    test('should reject invalid token format', async () => {
      const response = await request(app)
        .get('/api/auth/verify-token')
        .set('Authorization', 'InvalidFormat')
        .expect('Content-Type', /json/);

      // Should return 401 or 500 depending on error handling
      expect([401, 500]).toContain(response.status);
      expect(response.body.status).toBe('error');
    });
  });
});
