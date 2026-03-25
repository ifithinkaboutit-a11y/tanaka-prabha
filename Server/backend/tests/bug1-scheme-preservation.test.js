/**
 * Bug 1 — Scheme Interest API: Route Not Found
 *
 * PRESERVATION PROPERTY TESTS
 * ============================
 * These tests MUST PASS on both unfixed AND fixed code.
 * They establish the baseline CRUD behavior that must be preserved after the fix.
 *
 * Property 6: Preservation — Non-Buggy Scheme API Routes Unchanged
 * For any request to scheme routes other than POST /:id/interest
 * (GET all, GET by ID, POST create, PUT update, PATCH toggle, DELETE),
 * the fixed schemeRoutes.js SHALL produce the same response as the original.
 *
 * Validates: Requirements 3.7, 3.12
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
const mockScheme = {
  id: 'scheme-abc',
  title: 'PM Kisan Samman Nidhi',
  category: 'Agriculture',
  description: 'Direct income support to farmers',
  is_active: true,
};

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

// Import the real schemeRoutes (unfixed — no interest route registered)
const { default: SchemeModel } = await import('../src/models/Scheme.js');
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
// PRESERVATION TESTS — Property 6
// ─────────────────────────────────────────────────────────────────────────────

describe('Bug 1 — Scheme CRUD Routes: Preservation Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Observation: GET /api/schemes returns 200 with scheme list on unfixed code
   *
   * Validates: Requirements 3.7
   */
  test('GET /api/schemes should return 200 with scheme list', async () => {
    SchemeModel.findAll.mockResolvedValue([mockScheme]);

    const response = await request(app).get('/api/schemes');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('schemes');
    expect(Array.isArray(response.body.data.schemes)).toBe(true);
    expect(response.body.data.schemes.length).toBeGreaterThanOrEqual(0);
  });

  /**
   * Observation: GET /api/schemes/:id returns 200 for valid ID on unfixed code
   *
   * Validates: Requirements 3.12
   */
  test('GET /api/schemes/:id should return 200 for a valid scheme ID', async () => {
    SchemeModel.findById.mockResolvedValue(mockScheme);

    const response = await request(app).get('/api/schemes/scheme-abc');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('scheme');
    expect(response.body.data.scheme.id).toBe('scheme-abc');
  });

  /**
   * Observation: GET /api/schemes/:id returns 404 for non-existent ID on unfixed code
   * (this is correct behavior — must be preserved)
   */
  test('GET /api/schemes/:id should return 404 for a non-existent scheme ID', async () => {
    SchemeModel.findById.mockResolvedValue(null);

    const response = await request(app).get('/api/schemes/nonexistent-id');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('error');
  });

  /**
   * Observation: POST /api/schemes (create) returns 201 on unfixed code
   *
   * Validates: Requirements 3.7
   */
  test('POST /api/schemes should return 201 when creating a new scheme', async () => {
    const newScheme = { ...mockScheme, id: 'scheme-new' };
    SchemeModel.create.mockResolvedValue(newScheme);

    const response = await request(app)
      .post('/api/schemes')
      .set('Authorization', 'Bearer mock-jwt-token')
      .send({ title: 'PM Kisan Samman Nidhi', category: 'Agriculture' });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('scheme');
  });

  /**
   * Observation: PUT /api/schemes/:id returns 200 on unfixed code
   *
   * Validates: Requirements 3.7
   */
  test('PUT /api/schemes/:id should return 200 when updating a scheme', async () => {
    const updatedScheme = { ...mockScheme, title: 'Updated Title' };
    SchemeModel.findById.mockResolvedValue(mockScheme);
    SchemeModel.update.mockResolvedValue(updatedScheme);

    const response = await request(app)
      .put('/api/schemes/scheme-abc')
      .set('Authorization', 'Bearer mock-jwt-token')
      .send({ title: 'Updated Title' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('scheme');
  });

  /**
   * Observation: DELETE /api/schemes/:id returns 200 on unfixed code
   *
   * Validates: Requirements 3.7
   */
  test('DELETE /api/schemes/:id should return 200 when deleting a scheme', async () => {
    SchemeModel.findById.mockResolvedValue(mockScheme);
    SchemeModel.delete.mockResolvedValue(undefined);

    const response = await request(app)
      .delete('/api/schemes/scheme-abc')
      .set('Authorization', 'Bearer mock-jwt-token');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });

  /**
   * Observation: PATCH /api/schemes/:id/toggle returns 200 on unfixed code
   *
   * Validates: Requirements 3.7
   */
  test('PATCH /api/schemes/:id/toggle should return 200 when toggling scheme status', async () => {
    const toggledScheme = { ...mockScheme, is_active: false };
    SchemeModel.findById.mockResolvedValue(mockScheme);
    SchemeModel.update.mockResolvedValue(toggledScheme);

    const response = await request(app)
      .patch('/api/schemes/scheme-abc/toggle')
      .set('Authorization', 'Bearer mock-jwt-token');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('scheme');
  });

  /**
   * Observation: GET /api/schemes/categories returns 200 on unfixed code
   *
   * Validates: Requirements 3.7
   */
  test('GET /api/schemes/categories should return 200 with categories list', async () => {
    SchemeModel.getCategories.mockResolvedValue(['Agriculture', 'Health', 'Education']);

    const response = await request(app).get('/api/schemes/categories');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('categories');
    expect(Array.isArray(response.body.data.categories)).toBe(true);
  });

  /**
   * Property-based preservation: for multiple scheme IDs, GET always returns
   * 200 with the scheme data (simulating many inputs).
   *
   * Validates: Requirements 3.12
   */
  test('GET /api/schemes/:id should consistently return 200 for any valid scheme ID', async () => {
    const schemeIds = ['id-001', 'id-002', 'id-003', 'id-004', 'id-005'];

    for (const id of schemeIds) {
      const scheme = { ...mockScheme, id };
      SchemeModel.findById.mockResolvedValue(scheme);

      const response = await request(app).get(`/api/schemes/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.scheme.id).toBe(id);
    }
  });

  /**
   * Property-based preservation: POST /api/schemes/:id/interest is NOT a CRUD
   * route and should return 404 on unfixed code (confirms the bug condition
   * does not affect CRUD routes).
   *
   * This is the boundary test — the interest route is the ONLY route that
   * should be missing; all other routes must work.
   *
   * Validates: Requirements 3.7, 3.12
   */
  test('POST /api/schemes/:id/interest returns 404 on unfixed code (bug boundary)', async () => {
    const response = await request(app)
      .post('/api/schemes/scheme-abc/interest')
      .set('Authorization', 'Bearer mock-jwt-token')
      .send({});

    // On unfixed code, this route is NOT registered → 404
    // This confirms the bug is isolated to the interest route only,
    // and all other CRUD routes are unaffected.
    expect(response.status).toBe(404);
  });
});
