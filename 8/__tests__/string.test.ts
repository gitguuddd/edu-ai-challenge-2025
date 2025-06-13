import { describe, test, expect } from '@jest/globals';
import { Schema } from '../src';

describe('StringValidator', () => {
  const stringValidator = Schema.string();

  test('validates valid strings', () => {
    const validStrings = [
      '',
      'hello',
      'Hello World',
      '123',
      'special chars: !@#$%^&*()',
      'unicode: 🚀 ñ ü',
    ];

    validStrings.forEach(str => {
      const result = stringValidator.validate(str);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(str);
      }
    });
  });

  test('rejects invalid strings', () => {
    const invalidValues = [
      123,
      null,
      undefined,
      {},
      [],
      true,
      false,
    ];

    invalidValues.forEach(value => {
      const result = stringValidator.validate(value);
      expect(result.success).toBe(false);
    });
  });

  test('validates min length constraint', () => {
    const validator = Schema.string().minLength(3);

    // Valid: meets min length
    const validResults = [
      validator.validate('abc'),
      validator.validate('hello'),
      validator.validate('123'),
    ];
    validResults.forEach(result => expect(result.success).toBe(true));

    // Invalid: below min length
    const invalidResults = [
      validator.validate(''),
      validator.validate('a'),
      validator.validate('ab'),
    ];
    invalidResults.forEach(result => expect(result.success).toBe(false));
  });

  test('validates max length constraint', () => {
    const validator = Schema.string().maxLength(5);

    // Valid: within max length
    const validResults = [
      validator.validate(''),
      validator.validate('a'),
      validator.validate('hello'),
    ];
    validResults.forEach(result => expect(result.success).toBe(true));

    // Invalid: exceeds max length
    const invalidResults = [
      validator.validate('hello world'),
      validator.validate('123456'),
    ];
    invalidResults.forEach(result => expect(result.success).toBe(false));
  });

  test('validates pattern constraint', () => {
    const validator = Schema.string().pattern(/^[A-Z][a-z]+$/);

    // Valid: matches pattern
    const validResults = [
      validator.validate('Hello'),
      validator.validate('World'),
      validator.validate('Test'),
    ];
    validResults.forEach(result => expect(result.success).toBe(true));

    // Invalid: doesn't match pattern
    const invalidResults = [
      validator.validate('hello'), // lowercase first letter
      validator.validate('HELLO'), // all uppercase
      validator.validate('Hello123'), // contains numbers
      validator.validate(''), // empty string
    ];
    invalidResults.forEach(result => expect(result.success).toBe(false));
  });

  test('validates non-empty constraint', () => {
    const validator = Schema.string().nonEmpty();

    // Valid: non-empty strings
    const validResults = [
      validator.validate('a'),
      validator.validate(' '), // space is not empty
      validator.validate('hello'),
    ];
    validResults.forEach(result => expect(result.success).toBe(true));

    // Invalid: empty string
    const invalidResult = validator.validate('');
    expect(invalidResult.success).toBe(false);
  });

  test('validates email format', () => {
    const validator = Schema.string().email();

    // Valid: proper email format
    const validResults = [
      validator.validate('test@example.com'),
      validator.validate('user.name@domain.co.uk'),
      validator.validate('simple@test.org'),
    ];
    validResults.forEach(result => expect(result.success).toBe(true));

    // Invalid: improper email format
    const invalidResults = [
      validator.validate('not-an-email'),
      validator.validate('@example.com'),
      validator.validate('test@'),
      validator.validate('test.example.com'),
      validator.validate(''),
    ];
    invalidResults.forEach(result => expect(result.success).toBe(false));
  });

  test('validates URL format', () => {
    const validator = Schema.string().url();

    // Valid: proper URL format
    const validResults = [
      validator.validate('https://example.com'),
      validator.validate('http://test.org'),
      validator.validate('https://www.google.com/search?q=test'),
    ];
    validResults.forEach(result => expect(result.success).toBe(true));

    // Invalid: improper URL format
    const invalidResults = [
      validator.validate('not-a-url'),
      validator.validate('example.com'),
      validator.validate('ftp://example.com'), // only http/https supported
      validator.validate(''),
    ];
    invalidResults.forEach(result => expect(result.success).toBe(false));
  });

  test('combines multiple constraints', () => {
    const validator = Schema.string()
      .minLength(3)
      .maxLength(20)
      .pattern(/^[A-Za-z]+$/);

    // Valid: meets all constraints
    const validResults = [
      validator.validate('Hello'),
      validator.validate('World'),
      validator.validate('Test'),
    ];
    validResults.forEach(result => expect(result.success).toBe(true));

    // Invalid: violates constraints
    const invalidResults = [
      validator.validate('Hi'), // too short
      validator.validate('ThisIsAVeryLongStringThatExceedsTheLimit'), // too long
      validator.validate('Hello123'), // contains numbers
    ];
    invalidResults.forEach(result => expect(result.success).toBe(false));
  });

  test('handles optional strings', () => {
    const validator = Schema.string().optional();

    // Valid: undefined
    const undefinedResult = validator.validate(undefined);
    expect(undefinedResult.success).toBe(true);

    // Valid: valid string
    const stringResult = validator.validate('hello');
    expect(stringResult.success).toBe(true);

    // Invalid: null should fail
    const nullResult = validator.validate(null);
    expect(nullResult.success).toBe(false);
  });
}); 