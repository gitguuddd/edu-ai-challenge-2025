import { describe, test, expect } from '@jest/globals';
import { Schema } from '../src';

describe('ArrayValidator', () => {
  const stringArrayValidator = Schema.array(Schema.string());

  test('validates valid arrays', () => {
    const validArrays = [
      [],
      ['hello'],
      ['hello', 'world'],
      ['a', 'b', 'c'],
    ];

    validArrays.forEach(array => {
      const result = stringArrayValidator.validate(array);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(array);
      }
    });
  });

  test('rejects invalid arrays', () => {
    const invalidValues = [
      'not an array',
      123,
      null,
      undefined,
      {},
      true,
    ];

    invalidValues.forEach(value => {
      const result = stringArrayValidator.validate(value);
      expect(result.success).toBe(false);
    });
  });

  test('validates array items', () => {
    const numberArrayValidator = Schema.array(Schema.number());

    // Valid: all numbers
    const validResult = numberArrayValidator.validate([1, 2, 3]);
    expect(validResult.success).toBe(true);

    // Invalid: contains non-number
    const invalidResult = numberArrayValidator.validate([1, 'two', 3]);
    expect(invalidResult.success).toBe(false);
  });

  test('validates min length constraint', () => {
    const validator = Schema.array(Schema.string()).minLength(2);

    // Valid: meets min length
    const validResult = validator.validate(['a', 'b']);
    expect(validResult.success).toBe(true);

    // Invalid: below min length
    const invalidResult = validator.validate(['a']);
    expect(invalidResult.success).toBe(false);
  });

  test('validates max length constraint', () => {
    const validator = Schema.array(Schema.string()).maxLength(2);

    // Valid: within max length
    const validResult = validator.validate(['a', 'b']);
    expect(validResult.success).toBe(true);

    // Invalid: exceeds max length
    const invalidResult = validator.validate(['a', 'b', 'c']);
    expect(invalidResult.success).toBe(false);
  });

  test('validates length range', () => {
    const validator = Schema.array(Schema.string()).length(2, 4);

    // Valid: within range
    const validResults = [
      validator.validate(['a', 'b']),
      validator.validate(['a', 'b', 'c']),
      validator.validate(['a', 'b', 'c', 'd']),
    ];
    validResults.forEach(result => expect(result.success).toBe(true));

    // Invalid: outside range
    const invalidResults = [
      validator.validate(['a']),
      validator.validate(['a', 'b', 'c', 'd', 'e']),
    ];
    invalidResults.forEach(result => expect(result.success).toBe(false));
  });

  test('validates exact length', () => {
    const validator = Schema.array(Schema.string()).exactLength(3);

    // Valid: exact length
    const validResult = validator.validate(['a', 'b', 'c']);
    expect(validResult.success).toBe(true);

    // Invalid: wrong length
    const invalidResults = [
      validator.validate(['a', 'b']),
      validator.validate(['a', 'b', 'c', 'd']),
    ];
    invalidResults.forEach(result => expect(result.success).toBe(false));
  });

  test('validates non-empty arrays', () => {
    const validator = Schema.array(Schema.string()).nonEmpty();

    // Valid: non-empty
    const validResult = validator.validate(['a']);
    expect(validResult.success).toBe(true);

    // Invalid: empty
    const invalidResult = validator.validate([]);
    expect(invalidResult.success).toBe(false);
  });

  test('handles nested arrays', () => {
    const nestedValidator = Schema.array(Schema.array(Schema.number()));

    // Valid: nested arrays
    const validResult = nestedValidator.validate([[1, 2], [3, 4]]);
    expect(validResult.success).toBe(true);

    // Invalid: incorrect nesting
    const invalidResult = nestedValidator.validate([1, 2, 3]);
    expect(invalidResult.success).toBe(false);
  });

  test('handles optional arrays', () => {
    const validator = Schema.array(Schema.string()).optional();

    // Valid: undefined
    const undefinedResult = validator.validate(undefined);
    expect(undefinedResult.success).toBe(true);

    // Valid: valid array
    const arrayResult = validator.validate(['hello']);
    expect(arrayResult.success).toBe(true);

    // Invalid: null should fail
    const nullResult = validator.validate(null);
    expect(nullResult.success).toBe(false);
  });
}); 