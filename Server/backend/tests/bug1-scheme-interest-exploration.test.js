/**
 * Bug 1 — Scheme Interest API: Route Not Found
 *
 * BUG CONDITION EXPLORATION TEST (now verifying fix)
 * ====================================================
 * After fix: POST /api/schemes/:id/interest → 200 with interestCount
 *
 * Validates: Requirements 1.1, 2.1
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock the database to avoid real DB connections
jest.unstable_mockModule('../src/config/db.js', () => ({
  pool: {
    query: jest.fn(),
    on: jest.fn(),
  },
  query: jest.fn(),
  supabase: {},
}));

// Mock jsonwebtoken so authMiddleware passes with a Bearer token
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: (payload, secret, options) => 'mock-jwt-token',
    verify: (token, secret) => {
      if (!token || token === 'invalid') throw new Error('Invalid token');
      return { userId: 'user-123', mobile_number: '919876543210' };
    },
  },
}));

// Mock the Scheme model so no real DB calls are made
jest.unstable_mockModule('../src/models/Scheme.js', () => ({
  default: {
    findById: jest.fn(),
    findAll: jest.fn(),
    findAllActive: jest.fn(),
    findByCategory: jest.fn(),
    search: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getCategories: jest.fn(),
  },
}));

// Import mocked modules so we can configure return values
const { default: Scheme } = await import('../src/models/Scheme.js');
const { query } = await import('../src/config/db.js');

// Import the real schemeRoutes (fixed — interest route is now registered)
const schemeRoutes = (await import('../src/routes/schemeRoutes.js')).default;

// Build a minimal Express app that mirrors how app.js mounts the routes
const app = express();
app.use(express.json());
app.use('/api/schemes', schemeRoutes);

// 404 fallback — mirrors app.js behaviour
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BUG CONDITION EXPLORATION — Property 1
// ─────────────────────────────────────────────────────────────────────────────

describe('Bug 1 — Scheme Interest Route: Bug Condition Exploration', () => {
  beforeEach(() => {
    // Configure mocks before each test (resetMocks: true clears implementations)
    Scheme.findById.mockResolvedValue({ id: 'test-id', title: 'Test Scheme', is_active: true });
    query.mockResolvedValue({ rows: [{ interest_count: 1 }] });
  });

  /**
   * Property 1: Expected Behavior — Scheme Interest Route Exists and Responds
   *
   * EXPECTED OUTCOME: This test PASSES on fixed code.
   * The route POST /:id/interest is now registered in schemeRoutes.js
   * and the expressInterest controller returns 200 with interestCount.
   *
   * Validates: Requirements 2.1
   */
  test(
    'POST /api/schemes/test-id/interest should return 200 with interest count',
    async () => {
      const response = await request(app)
        .post('/api/schemes/test-id/interest')
        .set('x-dashboard-api-key', 'tanak-prabha-dashboard-secret-key-2024')
        .send({});

      // The route is now registered and the controller returns 200 with interestCount.
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('interestCount');
    }
  );
});
