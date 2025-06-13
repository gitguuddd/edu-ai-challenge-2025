import { describe, test, expect } from '@jest/globals';
import { Schema } from '../src';
import { ObjectValidator } from '../src/validators/object';

describe('Object Validator', () => {
  describe('Basic validation', () => {
    test('should validate object types', () => {
      const validator = Schema.object({});
      expect(validator.validate({}).success).toBe(true);
      expect(validator.validate({ a: 1 }).success).toBe(true);
      expect(validator.validate(null).success).toBe(false);
      expect(validator.validate(undefined).success).toBe(false);
      expect(validator.validate('object').success).toBe(false);
      expect(validator.validate(123).success).toBe(false);
      expect(validator.validate([]).success).toBe(false);
      expect(validator.validate(true).success).toBe(false);
    });

    test('should validate simple object schema', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number()
      });

      expect(validator.validate({ name: 'John', age: 30 }).success).toBe(true);
      expect(validator.validate({ name: 'John' }).success).toBe(false);
      expect(validator.validate({ age: 30 }).success).toBe(false);
      expect(validator.validate({ name: 123, age: 30 }).success).toBe(false);
      expect(validator.validate({ name: 'John', age: 'thirty' }).success).toBe(false);
    });

    test('should return correct data on success', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number()
      });
      const data = { name: 'John', age: 30 };
      const result = validator.validate(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    test('should return errors on failure', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number()
      });
      const result = validator.validate({ name: 123, age: 'thirty' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
        expect(result.errors!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Optional fields', () => {
    test('should handle optional fields', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number().optional(),
        email: Schema.string().optional()
      });

      expect(validator.validate({ name: 'John' }).success).toBe(true);
      expect(validator.validate({ name: 'John', age: 30 }).success).toBe(true);
      expect(validator.validate({ name: 'John', email: 'john@example.com' }).success).toBe(true);
      expect(validator.validate({ name: 'John', age: 30, email: 'john@example.com' }).success).toBe(true);
      expect(validator.validate({ age: 30 }).success).toBe(false); // missing required name
    });

    test('should validate optional field types when present', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number().optional()
      });

      expect(validator.validate({ name: 'John', age: 30 }).success).toBe(true);
      expect(validator.validate({ name: 'John', age: undefined }).success).toBe(true);
      expect(validator.validate({ name: 'John', age: 'thirty' }).success).toBe(false);
    });

    test('handles optional objects', () => {
      const validator = Schema.object({ name: Schema.string() }).optional();

      // Valid: undefined
      const undefinedResult = validator.validate(undefined);
      expect(undefinedResult.success).toBe(true);

      // Valid: valid object
      const objectResult = validator.validate({ name: 'test' });
      expect(objectResult.success).toBe(true);

      // Invalid: null should fail
      const nullResult = validator.validate(null);
      expect(nullResult.success).toBe(false);
    });
  });

  describe('Strict mode', () => {
    test('should allow unknown properties by default', () => {
      const validator = Schema.object({
        name: Schema.string()
      });

      const result = validator.validate({ name: 'John', extra: 'field' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'John', extra: 'field' });
      }
    });

    test('should reject unknown properties in strict mode', () => {
      const validator = Schema.object({
        name: Schema.string()
      }).strict();

      const result = validator.validate({ name: 'John', extra: 'field' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors!.some(e => e.message.includes("Unknown property 'extra'"))).toBe(true);
      }
    });

    test('should validate known properties in strict mode', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number().optional()
      }).strict();

      expect(validator.validate({ name: 'John' }).success).toBe(true);
      expect(validator.validate({ name: 'John', age: 30 }).success).toBe(true);
    });

    test('should handle multiple unknown properties in strict mode', () => {
      const validator = Schema.object({
        name: Schema.string()
      }).strict();

      const result = validator.validate({ name: 'John', extra1: 'field1', extra2: 'field2' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors!.length).toBe(2);
        expect(result.errors!.some(e => e.message.includes("Unknown property 'extra1'"))).toBe(true);
        expect(result.errors!.some(e => e.message.includes("Unknown property 'extra2'"))).toBe(true);
      }
    });
  });

  describe('Schema extension', () => {
    test('should extend schema with additional properties', () => {
      const baseValidator = Schema.object({
        name: Schema.string()
      }) as ObjectValidator<{ name: string }>;

      const extendedValidator = baseValidator.extend({
        age: Schema.number(),
        email: Schema.string().email()
      });

      const validData = { name: 'John', age: 30, email: 'john@example.com' };
      expect(extendedValidator.validate(validData).success).toBe(true);

      // Should fail if missing extended properties
      expect(extendedValidator.validate({ name: 'John' }).success).toBe(false);
    });

    test('should override properties when extending', () => {
      const baseValidator = Schema.object({
        name: Schema.string(),
        age: Schema.string() // Originally string
      }) as ObjectValidator<{ name: string; age: string }>;

      const extendedValidator = baseValidator.extend({
        age: Schema.number() // Override to number
      });

      expect(extendedValidator.validate({ name: 'John', age: 30 }).success).toBe(true);
      expect(extendedValidator.validate({ name: 'John', age: 'thirty' }).success).toBe(false);
    });

    test('should preserve validator options when extending', () => {
      const baseValidator = Schema.object({
        name: Schema.string()
      }).strict().withMessage('Custom error') as ObjectValidator<{ name: string }>;

      const extendedValidator = baseValidator.extend({
        age: Schema.number()
      });

      // Should still be strict
      const result = extendedValidator.validate({ name: 'John', age: 30, extra: 'field' });
      expect(result.success).toBe(false);
    });
  });

  describe('Partial schemas', () => {
    test('should make all properties optional', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number(),
        email: Schema.string().email()
      }) as ObjectValidator<{ name: string; age: number; email: string }>;

      const partialValidator = validator.partial();

      // All combinations should be valid
      expect(partialValidator.validate({}).success).toBe(true);
      expect(partialValidator.validate({ name: 'John' }).success).toBe(true);
      expect(partialValidator.validate({ age: 30 }).success).toBe(true);
      expect(partialValidator.validate({ name: 'John', age: 30 }).success).toBe(true);
      expect(partialValidator.validate({ name: 'John', age: 30, email: 'john@example.com' }).success).toBe(true);
    });

    test('should still validate types in partial schema', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number()
      }) as ObjectValidator<{ name: string; age: number }>;

      const partialValidator = validator.partial();

      expect(partialValidator.validate({ name: 123 }).success).toBe(false);
      expect(partialValidator.validate({ age: 'thirty' }).success).toBe(false);
    });

    test('should preserve validator options in partial schema', () => {
      const validator = Schema.object({
        name: Schema.string()
      }).strict() as ObjectValidator<{ name: string }>;

      const partialValidator = validator.partial();

      // Should still be strict
      const result = partialValidator.validate({ extra: 'field' });
      expect(result.success).toBe(false);
    });
  });

  describe('Pick functionality', () => {
    test('should pick specified properties', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number(),
        email: Schema.string().email(),
        phone: Schema.string()
      }) as ObjectValidator<{ name: string; age: number; email: string; phone: string }>;

      const pickedValidator = validator.pick('name', 'email');

      expect(pickedValidator.validate({ name: 'John', email: 'john@example.com' }).success).toBe(true);
      expect(pickedValidator.validate({ name: 'John' }).success).toBe(false); // missing email
      expect(pickedValidator.validate({ name: 'John', email: 'john@example.com', age: 30 }).success).toBe(true); // extra props allowed by default
    });

    test('should handle picking non-existent properties', () => {
      const validator = Schema.object({
        name: Schema.string()
      }) as ObjectValidator<{ name: string }>;

      const pickedValidator = validator.pick('name', 'nonexistent' as any);

      expect(pickedValidator.validate({ name: 'John' }).success).toBe(true);
    });

    test('should preserve validator options when picking', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number()
      }).strict() as ObjectValidator<{ name: string; age: number }>;

      const pickedValidator = validator.pick('name');

      // Should still be strict
      const result = pickedValidator.validate({ name: 'John', extra: 'field' });
      expect(result.success).toBe(false);
    });
  });

  describe('Omit functionality', () => {
    test('should omit specified properties', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number(),
        email: Schema.string().email(),
        phone: Schema.string()
      }) as ObjectValidator<{ name: string; age: number; email: string; phone: string }>;

      const omittedValidator = validator.omit('age', 'phone');

      expect(omittedValidator.validate({ name: 'John', email: 'john@example.com' }).success).toBe(true);
      expect(omittedValidator.validate({ name: 'John' }).success).toBe(false); // missing email
      expect(omittedValidator.validate({ name: 'John', email: 'john@example.com', extra: 'field' }).success).toBe(true); // extra props allowed by default
    });

    test('should handle omitting non-existent properties', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number()
      }) as ObjectValidator<{ name: string; age: number }>;

      const omittedValidator = validator.omit('nonexistent' as any);

      expect(omittedValidator.validate({ name: 'John', age: 30 }).success).toBe(true);
    });

    test('should preserve validator options when omitting', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number()
      }).strict() as ObjectValidator<{ name: string; age: number }>;

      const omittedValidator = validator.omit('age');

      // Should still be strict
      const result = omittedValidator.validate({ name: 'John', extra: 'field' });
      expect(result.success).toBe(false);
    });
  });

  describe('Nested objects', () => {
    test('should validate nested objects', () => {
      const addressValidator = Schema.object({
        street: Schema.string(),
        city: Schema.string(),
        zipCode: Schema.string()
      });

      const userValidator = Schema.object({
        name: Schema.string(),
        address: addressValidator
      });

      const validUser = {
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          zipCode: '12345'
        }
      };

      expect(userValidator.validate(validUser).success).toBe(true);
      expect(userValidator.validate({ name: 'John', address: {} }).success).toBe(false);
      expect(userValidator.validate({ name: 'John', address: 'not an object' }).success).toBe(false);
    });

    test('should validate deeply nested objects', () => {
      const validator = Schema.object({
        level1: Schema.object({
          level2: Schema.object({
            level3: Schema.object({
              value: Schema.string()
            })
          })
        })
      });

      const validData = {
        level1: {
          level2: {
            level3: {
              value: 'deep'
            }
          }
        }
      };

      expect(validator.validate(validData).success).toBe(true);
      expect(validator.validate({ level1: { level2: { level3: {} } } }).success).toBe(false);
    });
  });

  describe('Complex schemas', () => {
    test('should validate complex user schema', () => {
      const validator = Schema.object({
        id: Schema.string(),
        name: Schema.string().minLength(2).maxLength(50),
        email: Schema.string().email(),
        age: Schema.number().min(0).max(120).optional(),
        isActive: Schema.boolean(),
        tags: Schema.array(Schema.string()),
        address: Schema.object({
          street: Schema.string(),
          city: Schema.string(),
          postalCode: Schema.string().pattern(/^\d{5}$/),
          country: Schema.string()
        }).optional(),
        metadata: Schema.object({}).optional()
      });

      const validUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        isActive: true,
        tags: ['developer', 'designer'],
        address: {
          street: '123 Main St',
          city: 'Anytown',
          postalCode: '12345',
          country: 'USA'
        },
        metadata: {}
      };

      expect(validator.validate(validUser).success).toBe(true);

      // Test without optional fields
      const minimalUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        isActive: true,
        tags: ['developer']
      };
      expect(validator.validate(minimalUser).success).toBe(true);

      // Test with invalid data
      expect(validator.validate({ ...validUser, email: 'invalid-email' }).success).toBe(false);
      expect(validator.validate({ ...validUser, age: -5 }).success).toBe(false);
      expect(validator.validate({ ...validUser, tags: 'not-array' }).success).toBe(false);
    });
  });

  describe('Array of objects', () => {
    test('should validate array of objects', () => {
      const userValidator = Schema.object({
        name: Schema.string(),
        age: Schema.number()
      });

      const usersValidator = Schema.array(userValidator);

      const validUsers = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ];

      expect(usersValidator.validate(validUsers).success).toBe(true);
      expect(usersValidator.validate([]).success).toBe(true);
      expect(usersValidator.validate([{ name: 'John' }]).success).toBe(false);
      expect(usersValidator.validate([{ name: 'John', age: 'thirty' }]).success).toBe(false);
    });
  });

  describe('Optional validation', () => {
    test('should make object optional', () => {
      const validator = Schema.object({
        name: Schema.string()
      }).optional();

      expect(validator.validate({ name: 'John' }).success).toBe(true);
      expect(validator.validate(undefined).success).toBe(true);
      expect(validator.validate(null).success).toBe(false);
      expect(validator.validate('not object').success).toBe(false);
    });
  });

  describe('Custom messages', () => {
    test('should use custom error messages', () => {
      const validator = Schema.object({
        name: Schema.string()
      }).withMessage('Custom object error');

      const result = validator.validate('not an object');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors![0].message).toBe('Custom object error');
      }
    });

    test('should propagate field-specific error messages', () => {
      const validator = Schema.object({
        name: Schema.string().withMessage('Name must be a string'),
        age: Schema.number().withMessage('Age must be a number')
      });

      const result = validator.validate({ name: 123, age: 'thirty' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors!.some(e => e.message === 'Name must be a string')).toBe(true);
        expect(result.errors!.some(e => e.message === 'Age must be a number')).toBe(true);
      }
    });
  });

  describe('Edge cases', () => {
    test('should handle empty objects', () => {
      const validator = Schema.object({});
      expect(validator.validate({}).success).toBe(true);
      expect(validator.validate({ extra: 'field' }).success).toBe(true);
    });

    test('should handle objects with extra properties', () => {
      const validator = Schema.object({
        name: Schema.string()
      });

      expect(validator.validate({ name: 'John', extra: 'field' }).success).toBe(true);
    });

    test('should handle null prototype objects', () => {
      const validator = Schema.object({
        name: Schema.string()
      });

      const nullProtoObj = Object.create(null);
      nullProtoObj.name = 'John';
      expect(validator.validate(nullProtoObj).success).toBe(true);
    });

    test('should handle objects with symbol keys', () => {
      const validator = Schema.object({
        name: Schema.string()
      });

      const sym = Symbol('test');
      const obj = { name: 'John', [sym]: 'value' };
      expect(validator.validate(obj).success).toBe(true);
    });

    test('should handle circular references gracefully', () => {
      const validator = Schema.object({
        name: Schema.string(),
        self: Schema.object({}).optional()
      });

      const obj: any = { name: 'John' };
      obj.self = obj; // circular reference

      // Should not throw an error, but validation behavior may vary
      expect(() => validator.validate(obj)).not.toThrow();
    });

    test('should handle undefined properties correctly', () => {
      const validator = Schema.object({
        name: Schema.string(),
        age: Schema.number().optional()
      });

      // Explicitly undefined should be treated as optional
      const result = validator.validate({ name: 'John', age: undefined });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'John', age: undefined });
      }
    });

    test('should handle properties with falsy values', () => {
      const validator = Schema.object({
        name: Schema.string(),
        count: Schema.number(),
        active: Schema.boolean(),
        description: Schema.string().optional()
      });

      const data = {
        name: '',
        count: 0,
        active: false,
        description: ''
      };

      const result = validator.validate(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });
  });
}); 