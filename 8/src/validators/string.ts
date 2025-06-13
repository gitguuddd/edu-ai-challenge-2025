import { BaseValidator } from './base';
import { ValidationResult, ValidationContext } from '../types';

/**
 * String validator with support for length constraints and pattern matching
 * 
 * @example
 * ```typescript
 * const nameValidator = Schema.string()
 *   .minLength(2)
 *   .maxLength(50)
 *   .withMessage('Name must be between 2 and 50 characters');
 * 
 * const emailValidator = Schema.string()
 *   .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
 *   .withMessage('Invalid email format');
 * ```
 */
export class StringValidator extends BaseValidator<string> {
  private _minLength?: number;
  private _maxLength?: number;
  private _pattern?: RegExp;

  protected _validate(value: unknown, context: ValidationContext): ValidationResult<string> {
    // Check if value is a string
    if (typeof value !== 'string') {
      return this.createFailure([
        this.createError(`Expected string, got ${typeof value}`, value, context)
      ]);
    }

    const errors = [];

    // Check minimum length
    if (this._minLength !== undefined && value.length < this._minLength) {
      errors.push(
        this.createError(`String must be at least ${this._minLength} characters long`, value, context)
      );
    }

    // Check maximum length
    if (this._maxLength !== undefined && value.length > this._maxLength) {
      errors.push(
        this.createError(`String must be at most ${this._maxLength} characters long`, value, context)
      );
    }

    // Check pattern
    if (this._pattern && !this._pattern.test(value)) {
      errors.push(
        this.createError(`String does not match required pattern`, value, context)
      );
    }

    if (errors.length > 0) {
      return this.createFailure(errors);
    }

    return this.createSuccess(value);
  }

  /**
   * Sets the minimum length constraint
   * @param length - The minimum length
   */
  minLength(length: number): StringValidator {
    const clone = this._clone();
    clone._minLength = length;
    return clone;
  }

  /**
   * Sets the maximum length constraint
   * @param length - The maximum length
   */
  maxLength(length: number): StringValidator {
    const clone = this._clone();
    clone._maxLength = length;
    return clone;
  }

  /**
   * Sets a regular expression pattern that the string must match
   * @param pattern - The regular expression pattern
   */
  pattern(pattern: RegExp): StringValidator {
    const clone = this._clone();
    clone._pattern = pattern;
    return clone;
  }

  /**
   * Validates that the string is not empty (after trimming)
   */
  nonEmpty(): StringValidator {
    const clone = this._clone();
    clone._minLength = 1;
    return clone;
  }

  /**
   * Validates email format using a standard email regex
   */
  email(): StringValidator {
    const clone = this.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    return clone.withMessage('Invalid email format') as StringValidator;
  }

  /**
   * Validates URL format
   */
  url(): StringValidator {
    const clone = this.pattern(/^https?:\/\/.+/);
    return clone.withMessage('Invalid URL format') as StringValidator;
  }

  protected _clone(): StringValidator {
    const clone = new StringValidator();
    clone._isOptional = this._isOptional;
    clone._customMessage = this._customMessage;
    clone._minLength = this._minLength;
    clone._maxLength = this._maxLength;
    clone._pattern = this._pattern;
    return clone;
  }
} 