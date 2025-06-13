import { describe, test, expect } from '@jest/globals';
import { Schema } from '../src';

describe('Boolean Validator', () => {
  describe('Basic validation', () => {
    test('should validate boolean types', () => {
      const validator = Schema.boolean();
      expect(validator.validate(true).success).toBe(true);
      expect(validator.validate(false).success).toBe(true);
      expect(validator.validate('true').success).toBe(false);
      expect(validator.validate('false').success).toBe(false);
      expect(validator.validate(1).success).toBe(false);
      expect(validator.validate(0).success).toBe(false);
      expect(validator.validate(null).success).toBe(false);
      expect(validator.validate(undefined).success).toBe(false);
      expect(validator.validate({}).success).toBe(false);
      expect(validator.validate([]).success).toBe(false);
    });

    test('should return correct data on success', () => {
      const validator = Schema.boolean();
      
      const trueResult = validator.validate(true);
      expect(trueResult.success).toBe(true);
      if (trueResult.success) {
        expect(trueResult.data).toBe(true);
      }

      const falseResult = validator.validate(false);
      expect(falseResult.success).toBe(true);
      if (falseResult.success) {
        expect(falseResult.data).toBe(false);
      }
    });

    test('should return errors on failure', () => {
      const validator = Schema.boolean();
      const result = validator.validate('not a boolean');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
        expect(result.errors![0].message).toContain('boolean');
      }
    });
  });

  describe('Optional validation', () => {
    test('should make boolean optional', () => {
      const validator = Schema.boolean().optional();
      expect(validator.validate(true).success).toBe(true);
      expect(validator.validate(false).success).toBe(true);
      expect(validator.validate(undefined).success).toBe(true);
      expect(validator.validate(null).success).toBe(false);
      expect(validator.validate('true').success).toBe(false);
      expect(validator.validate(1).success).toBe(false);
    });

    test('handles optional booleans', () => {
      const validator = Schema.boolean().optional();

      // Valid: undefined
      const undefinedResult = validator.validate(undefined);
      expect(undefinedResult.success).toBe(true);

      // Valid: valid boolean
      const booleanResult = validator.validate(true);
      expect(booleanResult.success).toBe(true);

      // Invalid: null should fail
      const nullResult = validator.validate(null);
      expect(nullResult.success).toBe(false);
    });
  });

  describe('Custom messages', () => {
    test('should use custom error messages', () => {
      const validator = Schema.boolean().withMessage('Custom boolean error');
      const result = validator.validate('not a boolean');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors![0].message).toBe('Custom boolean error');
      }
    });
  });

  describe('Edge cases', () => {
    test('should handle Boolean objects', () => {
      const validator = Schema.boolean();
      expect(validator.validate(new Boolean(true)).success).toBe(false);
      expect(validator.validate(new Boolean(false)).success).toBe(false);
    });

    test('should not accept truthy/falsy values', () => {
      const validator = Schema.boolean();
      expect(validator.validate(1).success).toBe(false);
      expect(validator.validate(0).success).toBe(false);
      expect(validator.validate('').success).toBe(false);
      expect(validator.validate('true').success).toBe(false);
      expect(validator.validate('false').success).toBe(false);
      expect(validator.validate(null).success).toBe(false);
      expect(validator.validate(undefined).success).toBe(false);
      expect(validator.validate(NaN).success).toBe(false);
    });
  });
}); 