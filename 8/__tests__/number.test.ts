import { describe, test, expect } from '@jest/globals';
import { Schema } from '../src';

describe('NumberValidator', () => {
  const numberValidator = Schema.number();

  test('validates valid numbers', () => {
    const validNumbers = [
      0,
      1,
      -1,
      3.14,
      -3.14,
      Number.MAX_VALUE,
      Number.MIN_VALUE,
      Infinity,
      -Infinity,
    ];

    validNumbers.forEach(num => {
      const result = numberValidator.validate(num);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(num);
      }
    });
  });

  test('rejects invalid numbers', () => {
    const invalidValues = [
      'not a number',
      '123',
      null,
      undefined,
      {},
      [],
      true,
      false,
      NaN,
    ];

    invalidValues.forEach(value => {
      const result = numberValidator.validate(value);
      expect(result.success).toBe(false);
    });
  });

  test('validates min constraint', () => {
    const validator = Schema.number().min(5);

    // Valid: above min
    const validResult = validator.validate(10);
    expect(validResult.success).toBe(true);

    // Valid: equal to min
    const equalResult = validator.validate(5);
    expect(equalResult.success).toBe(true);

    // Invalid: below min
    const invalidResult = validator.validate(3);
    expect(invalidResult.success).toBe(false);
  });

  test('validates max constraint', () => {
    const validator = Schema.number().max(10);

    // Valid: below max
    const validResult = validator.validate(5);
    expect(validResult.success).toBe(true);

    // Valid: equal to max
    const equalResult = validator.validate(10);
    expect(equalResult.success).toBe(true);

    // Invalid: above max
    const invalidResult = validator.validate(15);
    expect(invalidResult.success).toBe(false);
  });

  test('validates range constraint', () => {
    const validator = Schema.number().range(5, 10);

    // Valid: within range
    const validResults = [
      validator.validate(5),
      validator.validate(7.5),
      validator.validate(10),
    ];
    validResults.forEach(result => expect(result.success).toBe(true));

    // Invalid: outside range
    const invalidResults = [
      validator.validate(4),
      validator.validate(11),
    ];
    invalidResults.forEach(result => expect(result.success).toBe(false));
  });

  test('validates integer constraint', () => {
    const validator = Schema.number().integer();

    // Valid: integers
    const validResults = [
      validator.validate(0),
      validator.validate(1),
      validator.validate(-1),
      validator.validate(100),
    ];
    validResults.forEach(result => expect(result.success).toBe(true));

    // Invalid: non-integers
    const invalidResults = [
      validator.validate(3.14),
      validator.validate(-2.5),
      validator.validate(0.1),
    ];
    invalidResults.forEach(result => expect(result.success).toBe(false));
  });

  test('validates positive constraint', () => {
    const validator = Schema.number().positive();

    // Valid: positive numbers
    const validResults = [
      validator.validate(1),
      validator.validate(0.1),
      validator.validate(100),
    ];
    validResults.forEach(result => expect(result.success).toBe(true));

    // Invalid: non-positive numbers
    const invalidResults = [
      validator.validate(0),
      validator.validate(-1),
      validator.validate(-0.1),
    ];
    invalidResults.forEach(result => expect(result.success).toBe(false));
  });

  test('validates negative constraint', () => {
    const validator = Schema.number().negative();

    // Valid: negative numbers
    const validResults = [
      validator.validate(-1),
      validator.validate(-0.1),
      validator.validate(-100),
    ];
    validResults.forEach(result => expect(result.success).toBe(true));

    // Invalid: non-negative numbers
    const invalidResults = [
      validator.validate(0),
      validator.validate(1),
      validator.validate(0.1),
    ];
    invalidResults.forEach(result => expect(result.success).toBe(false));
  });

  test('validates non-negative constraint', () => {
    const validator = Schema.number().nonNegative();

    // Valid: non-negative numbers
    const validResults = [
      validator.validate(0),
      validator.validate(1),
      validator.validate(0.1),
      validator.validate(100),
    ];
    validResults.forEach(result => expect(result.success).toBe(true));

    // Invalid: negative numbers
    const invalidResults = [
      validator.validate(-1),
      validator.validate(-0.1),
      validator.validate(-100),
    ];
    invalidResults.forEach(result => expect(result.success).toBe(false));
  });

  test('validates non-positive constraint', () => {
    const validator = Schema.number().nonPositive();

    // Valid: non-positive numbers
    const validResults = [
      validator.validate(0),
      validator.validate(-1),
      validator.validate(-0.1),
      validator.validate(-100),
    ];
    validResults.forEach(result => expect(result.success).toBe(true));

    // Invalid: positive numbers
    const invalidResults = [
      validator.validate(1),
      validator.validate(0.1),
      validator.validate(100),
    ];
    invalidResults.forEach(result => expect(result.success).toBe(false));
  });

  test('combines multiple constraints', () => {
    const validator = Schema.number().min(0).max(100).integer();

    // Valid: meets all constraints
    const validResults = [
      validator.validate(0),
      validator.validate(50),
      validator.validate(100),
    ];
    validResults.forEach(result => expect(result.success).toBe(true));

    // Invalid: violates constraints
    const invalidResults = [
      validator.validate(-1), // below min
      validator.validate(101), // above max
      validator.validate(50.5), // not integer
    ];
    invalidResults.forEach(result => expect(result.success).toBe(false));
  });

  test('handles optional numbers', () => {
    const validator = Schema.number().optional();

    // Valid: undefined
    const undefinedResult = validator.validate(undefined);
    expect(undefinedResult.success).toBe(true);

    // Valid: valid number
    const numberResult = validator.validate(42);
    expect(numberResult.success).toBe(true);

    // Invalid: null should fail
    const nullResult = validator.validate(null);
    expect(nullResult.success).toBe(false);
  });
}); 