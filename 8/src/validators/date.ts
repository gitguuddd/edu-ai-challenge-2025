import { BaseValidator } from './base';
import { ValidationResult, ValidationContext } from '../types';

/**
 * Date validator with support for date range constraints
 * 
 * @example
 * ```typescript
 * const birthDateValidator = Schema.date()
 *   .min(new Date('1900-01-01'))
 *   .max(new Date())
 *   .withMessage('Birth date must be between 1900 and today');
 * 
 * const futureValidator = Schema.date()
 *   .future()
 *   .withMessage('Date must be in the future');
 * ```
 */
export class DateValidator extends BaseValidator<Date> {
  private _min?: Date;
  private _max?: Date;
  private _isPast = false;
  private _isFuture = false;

  protected _validate(value: unknown, context: ValidationContext): ValidationResult<Date> {
    let date: Date;

    // Handle different input types
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else {
      return this.createFailure([
        this.createError(`Expected Date, string, or number, got ${typeof value}`, value, context)
      ]);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return this.createFailure([
        this.createError('Invalid date', value, context)
      ]);
    }

    const errors = [];
    const now = new Date();

    // Check minimum date
    if (this._min && date < this._min) {
      errors.push(
        this.createError(`Date must be after ${this._min.toISOString()}`, value, context)
      );
    }

    // Check maximum date
    if (this._max && date > this._max) {
      errors.push(
        this.createError(`Date must be before ${this._max.toISOString()}`, value, context)
      );
    }

    // Check if past
    if (this._isPast && date >= now) {
      errors.push(
        this.createError('Date must be in the past', value, context)
      );
    }

    // Check if future
    if (this._isFuture && date <= now) {
      errors.push(
        this.createError('Date must be in the future', value, context)
      );
    }

    if (errors.length > 0) {
      return this.createFailure(errors);
    }

    return this.createSuccess(date);
  }

  /**
   * Sets the minimum date constraint
   * @param date - The minimum date
   */
  min(date: Date): DateValidator {
    const clone = this._clone();
    clone._min = date;
    return clone;
  }

  /**
   * Sets the maximum date constraint
   * @param date - The maximum date
   */
  max(date: Date): DateValidator {
    const clone = this._clone();
    clone._max = date;
    return clone;
  }

  /**
   * Validates that the date is in the past
   */
  past(): DateValidator {
    const clone = this._clone();
    clone._isPast = true;
    return clone;
  }

  /**
   * Validates that the date is in the future
   */
  future(): DateValidator {
    const clone = this._clone();
    clone._isFuture = true;
    return clone;
  }

  /**
   * Validates that the date is within a specific range
   * @param min - The minimum date (inclusive)
   * @param max - The maximum date (inclusive)
   */
  range(min: Date, max: Date): DateValidator {
    return this.min(min).max(max);
  }

  /**
   * Validates that the date is today
   */
  today(): DateValidator {
    const clone = this._clone();
    const originalValidate = clone._validate.bind(clone);
    
    clone._validate = (value: unknown, context: ValidationContext): ValidationResult<Date> => {
      const result = originalValidate(value, context);
      if (!result.success) return result;
      
      const today = new Date();
      const dateToCheck = result.data!;
      
      if (
        dateToCheck.getFullYear() !== today.getFullYear() ||
        dateToCheck.getMonth() !== today.getMonth() ||
        dateToCheck.getDate() !== today.getDate()
      ) {
        return this.createFailure([
          this.createError('Date must be today', value, context)
        ]);
      }
      
      return result;
    };
    
    return clone;
  }

  protected _clone(): DateValidator {
    const clone = new DateValidator();
    clone._isOptional = this._isOptional;
    clone._customMessage = this._customMessage;
    clone._min = this._min;
    clone._max = this._max;
    clone._isPast = this._isPast;
    clone._isFuture = this._isFuture;
    return clone;
  }
} 