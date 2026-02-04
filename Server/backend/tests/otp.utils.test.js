import { describe, test, expect } from '@jest/globals';
import { 
  generateOTP, 
  generateOTPExpiry, 
  isOTPExpired,
  formatPhoneNumber,
  isValidIndianPhone 
} from '../src/utils/otp.js';

describe('OTP Utility Functions', () => {
  describe('generateOTP', () => {
    test('should generate 6-digit OTP', () => {
      const otp = generateOTP();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    test('should generate different OTPs', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      // High probability they're different
      expect(otp1).not.toBe(otp2);
    });

    test('should generate OTP within valid range', () => {
      const otp = generateOTP();
      const otpNum = parseInt(otp);
      expect(otpNum).toBeGreaterThanOrEqual(100000);
      expect(otpNum).toBeLessThan(1000000);
    });
  });

  describe('generateOTPExpiry', () => {
    test('should generate expiry 10 minutes in future by default', () => {
      const expiry = generateOTPExpiry();
      const now = new Date();
      const diff = (expiry - now) / 1000 / 60; // difference in minutes
      expect(diff).toBeGreaterThan(9);
      expect(diff).toBeLessThanOrEqual(10);
    });

    test('should generate expiry with custom minutes', () => {
      const expiry = generateOTPExpiry(5);
      const now = new Date();
      const diff = (expiry - now) / 1000 / 60;
      expect(diff).toBeGreaterThan(4);
      expect(diff).toBeLessThanOrEqual(5);
    });
  });

  describe('isOTPExpired', () => {
    test('should return false for future time', () => {
      const futureTime = new Date(Date.now() + 5 * 60 * 1000);
      expect(isOTPExpired(futureTime)).toBe(false);
    });

    test('should return true for past time', () => {
      const pastTime = new Date(Date.now() - 5 * 60 * 1000);
      expect(isOTPExpired(pastTime)).toBe(true);
    });

    test('should return false for current time (not expired yet)', () => {
      const now = new Date();
      expect(isOTPExpired(now)).toBe(false);
    });
  });

  describe('formatPhoneNumber', () => {
    test('should add country code to 10-digit number', () => {
      expect(formatPhoneNumber('9876543210')).toBe('919876543210');
    });

    test('should keep country code if already present', () => {
      expect(formatPhoneNumber('919876543210')).toBe('919876543210');
    });

    test('should remove non-digit characters', () => {
      expect(formatPhoneNumber('987-654-3210')).toBe('919876543210');
      expect(formatPhoneNumber('(987) 654-3210')).toBe('919876543210');
    });

    test('should handle spaces', () => {
      expect(formatPhoneNumber('98 76 54 32 10')).toBe('919876543210');
    });
  });

  describe('isValidIndianPhone', () => {
    test('should accept valid 10-digit numbers starting with 6-9', () => {
      expect(isValidIndianPhone('9876543210')).toBe(true);
      expect(isValidIndianPhone('8765432109')).toBe(true);
      expect(isValidIndianPhone('7654321098')).toBe(true);
      expect(isValidIndianPhone('6543210987')).toBe(true);
    });

    test('should reject numbers starting with 0-5', () => {
      expect(isValidIndianPhone('0123456789')).toBe(false);
      expect(isValidIndianPhone('1234567890')).toBe(false);
      expect(isValidIndianPhone('5432109876')).toBe(false);
    });

    test('should reject numbers with wrong length', () => {
      expect(isValidIndianPhone('987654321')).toBe(false); // 9 digits
      expect(isValidIndianPhone('98765432100')).toBe(false); // 11 digits
    });

    test('should accept 12-digit number with country code', () => {
      expect(isValidIndianPhone('919876543210')).toBe(true);
    });

    test('should reject 12-digit number with wrong country code', () => {
      expect(isValidIndianPhone('889876543210')).toBe(false);
    });

    test('should handle formatted numbers', () => {
      expect(isValidIndianPhone('987-654-3210')).toBe(true);
      expect(isValidIndianPhone('+91 9876543210')).toBe(true);
    });
  });
});
