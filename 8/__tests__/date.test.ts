import { describe, test, expect } from '@jest/globals';
import { Schema } from '../src';

describe('Date Validator', () => {
  describe('Basic validation', () => {
    test('should validate Date objects', () => {
      const validator = Schema.date();
      expect(validator.validate(new Date('2023-01-01')).success).toBe(true);
      expect(validator.validate(new Date(0)).success).toBe(true);
      expect(validator.validate('2023-01-01').success).toBe(true);
      expect(validator.validate(1672531200000).success).toBe(true);
      expect(validator.validate(null).success).toBe(false);
      expect(validator.validate(undefined).success).toBe(false);
      expect(validator.validate('invalid-date').success).toBe(false);
      expect(validator.validate({}).success).toBe(false);
    });

    test('should reject invalid Date objects', () => {
      const validator = Schema.date();
      expect(validator.validate(new Date('invalid')).success).toBe(false);
      expect(validator.validate(new Date(NaN)).success).toBe(false);
    });

    test('should return correct data on success', () => {
      const validator = Schema.date();
      const date = new Date('2023-01-01');
      const result = validator.validate(date);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(date);
        expect(result.data instanceof Date).toBe(true);
      }
    });

    test('should return errors on failure', () => {
      const validator = Schema.date();
      const result = validator.validate('not a date');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
        expect(result.errors![0].message).toContain('date');
      }
    });
  });

  describe('Range validation', () => {
    test('should validate minimum date', () => {
      const minDate = new Date('2023-01-01');
      const validator = Schema.date().min(minDate);
      
      expect(validator.validate(new Date('2023-01-01')).success).toBe(true);
      expect(validator.validate(new Date('2023-06-01')).success).toBe(true);
      expect(validator.validate(new Date('2024-01-01')).success).toBe(true);
      expect(validator.validate(new Date('2022-12-31')).success).toBe(false);
      expect(validator.validate(new Date('2022-01-01')).success).toBe(false);
    });

    test('should validate maximum date', () => {
      const maxDate = new Date('2023-12-31');
      const validator = Schema.date().max(maxDate);
      
      expect(validator.validate(new Date('2023-12-31')).success).toBe(true);
      expect(validator.validate(new Date('2023-06-01')).success).toBe(true);
      expect(validator.validate(new Date('2022-01-01')).success).toBe(true);
      expect(validator.validate(new Date('2024-01-01')).success).toBe(false);
      expect(validator.validate(new Date('2024-06-01')).success).toBe(false);
    });

    test('should combine min and max dates', () => {
      const minDate = new Date('2023-01-01');
      const maxDate = new Date('2023-12-31');
      const validator = Schema.date().min(minDate).max(maxDate);
      
      expect(validator.validate(new Date('2023-01-01')).success).toBe(true);
      expect(validator.validate(new Date('2023-06-01')).success).toBe(true);
      expect(validator.validate(new Date('2023-12-31')).success).toBe(true);
      expect(validator.validate(new Date('2022-12-31')).success).toBe(false);
      expect(validator.validate(new Date('2024-01-01')).success).toBe(false);
    });
  });

  describe('Future/Past validation', () => {
    test('should validate future dates', () => {
      const validator = Schema.date().future();
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      const pastDate = new Date(Date.now() - 86400000); // Yesterday
      
      expect(validator.validate(futureDate).success).toBe(true);
      expect(validator.validate(pastDate).success).toBe(false);
    });

    test('should validate past dates', () => {
      const validator = Schema.date().past();
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // yesterday
      
      expect(validator.validate(pastDate).success).toBe(true);
      expect(validator.validate(futureDate).success).toBe(false);
      expect(validator.validate(new Date()).success).toBe(false); // now is not past
    });
  });

  describe('Optional validation', () => {
    test('should make date optional', () => {
      const validator = Schema.date().optional();
      expect(validator.validate(new Date()).success).toBe(true);
      expect(validator.validate(undefined).success).toBe(true);
      expect(validator.validate(null).success).toBe(false);
      expect(validator.validate('2023-01-01').success).toBe(true);
    });

    test('should combine optional with other validations', () => {
      const minDate = new Date('2023-01-01');
      const validator = Schema.date().min(minDate).optional();
      expect(validator.validate(undefined).success).toBe(true);
      expect(validator.validate(new Date('2022-01-01')).success).toBe(false);
      expect(validator.validate('2023-01-01').success).toBe(true);
    });
  });

  describe('Custom messages', () => {
    test('should use custom error messages', () => {
      const validator = Schema.date().withMessage('Custom date error');
      const result = validator.validate('not a date');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors![0].message).toBe('Custom date error');
      }
    });

    test('should use custom messages for range validation', () => {
      const minDate = new Date('2023-01-01');
      const validator = Schema.date()
        .min(minDate)
        .future()
        .withMessage('Date must be in future');
      
      const result1 = validator.validate(new Date('2022-01-01'));
      expect(result1.success).toBe(false);
      if (!result1.success) {
        expect(result1.errors![0].message).toBe('Date must be in future');
      }
    });
  });

  describe('Edge cases', () => {
    test('should handle epoch date', () => {
      const validator = Schema.date();
      expect(validator.validate(new Date(0)).success).toBe(true);
    });

    test('should handle very old and future dates', () => {
      const validator = Schema.date();
      expect(validator.validate(new Date('1900-01-01')).success).toBe(true);
      expect(validator.validate(new Date('2100-01-01')).success).toBe(true);
    });

    test('should handle leap year dates', () => {
      const validator = Schema.date();
      expect(validator.validate(new Date('2020-02-29')).success).toBe(true); // leap year
      expect(validator.validate(new Date('2021-02-29')).success).toBe(true); // becomes March 1st
    });

    test('should handle timezone differences', () => {
      const validator = Schema.date();
      const utcDate = new Date('2023-01-01T00:00:00.000Z');
      const localDate = new Date('2023-01-01T00:00:00');
      
      expect(validator.validate(utcDate).success).toBe(true);
      expect(validator.validate(localDate).success).toBe(true);
    });

    test('should handle Date objects with different time precision', () => {
      const validator = Schema.date();
      expect(validator.validate(new Date('2023-01-01')).success).toBe(true);
      expect(validator.validate(new Date('2023-01-01T12:00:00')).success).toBe(true);
      expect(validator.validate(new Date('2023-01-01T12:00:00.123')).success).toBe(true);
    });

    test('should handle maximum and minimum possible dates', () => {
      const validator = Schema.date();
      expect(validator.validate(new Date(8640000000000000)).success).toBe(true); // max date
      expect(validator.validate(new Date(-8640000000000000)).success).toBe(true); // min date
      expect(validator.validate(new Date(8640000000000001)).success).toBe(false); // beyond max
      expect(validator.validate(new Date(-8640000000000001)).success).toBe(false); // beyond min
    });
  });
}); 