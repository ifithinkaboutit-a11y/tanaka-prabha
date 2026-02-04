import { jest } from '@jest/globals';

// Mock the database pool
export const mockQuery = jest.fn();

export const mockPool = {
  query: mockQuery,
  on: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
};

// Mock Supabase client
export const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
  auth: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
  },
  storage: {
    from: jest.fn(),
  },
};

// Export mocked db module
export default {
  pool: mockPool,
  query: mockQuery,
  supabase: mockSupabase,
};
