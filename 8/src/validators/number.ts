import { BaseValidator } from './base';
import { ValidationResult, ValidationContext } from '../types';

/**
 * Number validator with support for range constraints and integer validation
 * 
 * @example
 * ```typescript
 * const ageValidator = Schema.number()
 *   .min(0)
 *   .max(120)
 *   .integer()
 *   .withMessage('Age must be a whole number between 0 and 120');
 * 
 * const priceValidator = Schema.number()
 *   .min(0)
 *   .withMessage('Price must be positive');
 * ```
 */
export class NumberValidator extends BaseValidator<number> {
  private _min?: number;
  private _max?: number;
  private _isInteger = false;
  private _isPositive = false;
  private _isNegative = false;

  protected _validate(value: unknown, context: ValidationContext): ValidationResult<number> {
    // Check if value is a number
    if (typeof value !== 'number' || isNaN(value)) {
      return this.createFailure([
        this.createError(`Expected number, got ${typeof value}`, value, context)
      ]);
    }

    const errors = [];

    // Check minimum value
    if (this._min !== undefined && value < this._min) {
      errors.push(
        this.createError(`Number must be at least ${this._min}`, value, context)
      );
    }

    // Check maximum value
    if (this._max !== undefined && value > this._max) {
      errors.push(
        this.createError(`Number must be at most ${this._max}`, value, context)
      );
    }

    // Check if integer
    if (this._isInteger && !Number.isInteger(value)) {
      errors.push(
        this.createError(`Number must be an integer`, value, context)
      );
    }

    // Check if positive
    if (this._isPositive && value <= 0) {
      errors.push(
        this.createError(`Number must be positive`, value, context)
      );
    }

    // Check if negative
    if (this._isNegative && value >= 0) {
      errors.push(
        this.createError(`Number must be negative`, value, context)
      );
    }

    if (errors.length > 0) {
      return this.createFailure(errors);
    }

    return this.createSuccess(value);
  }

  /**
   * Sets the minimum value constraint
   * @param value - The minimum value
   */
  min(value: number): NumberValidator {
    const clone = this._clone();
    clone._min = value;
    return clone;
  }

  /**
   * Sets the maximum value constraint
   * @param value - The maximum value
   */
  max(value: number): NumberValidator {
    const clone = this._clone();
    clone._max = value;
    return clone;
  }

  /**
   * Validates that the number is an integer
   */
  integer(): NumberValidator {
    const clone = this._clone();
    clone._isInteger = true;
    return clone;
  }

  /**
   * Validates that the number is positive (> 0)
   */
  positive(): NumberValidator {
    const clone = this._clone();
    clone._isPositive = true;
    return clone;
  }

  /**
   * Validates that the number is negative (< 0)
   */
  negative(): NumberValidator {
    const clone = this._clone();
    clone._isNegative = true;
    return clone;
  }

  /**
   * Validates that the number is non-negative (>= 0)
   */
  nonNegative(): NumberValidator {
    return this.min(0);
  }

  /**
   * Validates that the number is non-positive (<= 0)
   */
  nonPositive(): NumberValidator {
    return this.max(0);
  }

  /**
   * Validates that the number is within a specific range
   * @param min - The minimum value (inclusive)
   * @param max - The maximum value (inclusive)
   */
  range(min: number, max: number): NumberValidator {
    return this.min(min).max(max);
  }

  protected _clone(): NumberValidator {
    const clone = new NumberValidator();
    clone._isOptional = this._isOptional;
    clone._customMessage = this._customMessage;
    clone._min = this._min;
    clone._max = this._max;
    clone._isInteger = this._isInteger;
    clone._isPositive = this._isPositive;
    clone._isNegative = this._isNegative;
    return clone;
  }
} 