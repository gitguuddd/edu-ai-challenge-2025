import { BaseValidator } from './base';
import { ValidationResult, ValidationContext, Validator } from '../types';

/**
 * Array validator with support for length constraints and item validation
 * 
 * @example
 * ```typescript
 * const tagsValidator = Schema.array(Schema.string())
 *   .minLength(1)
 *   .maxLength(10)
 *   .withMessage('Tags must be an array of 1-10 strings');
 * 
 * const numbersValidator = Schema.array(Schema.number().positive())
 *   .nonEmpty()
 *   .withMessage('Must be a non-empty array of positive numbers');
 * ```
 */
export class ArrayValidator<T> extends BaseValidator<T[]> {
  private _minLength?: number;
  private _maxLength?: number;
  private _itemValidator: Validator<T>;

  constructor(itemValidator: Validator<T>) {
    super();
    this._itemValidator = itemValidator;
  }

  protected _validate(value: unknown, context: ValidationContext): ValidationResult<T[]> {
    // Check if value is an array
    if (!Array.isArray(value)) {
      return this.createFailure([
        this.createError(`Expected array, got ${typeof value}`, value, context)
      ]);
    }

    const errors = [];

    // Check minimum length
    if (this._minLength !== undefined && value.length < this._minLength) {
      errors.push(
        this.createError(`Array must have at least ${this._minLength} items`, value, context)
      );
    }

    // Check maximum length
    if (this._maxLength !== undefined && value.length > this._maxLength) {
      errors.push(
        this.createError(`Array must have at most ${this._maxLength} items`, value, context)
      );
    }

    // Validate each item
    const validatedItems: T[] = [];
    for (let i = 0; i < value.length; i++) {
      const itemContext: ValidationContext = {
        path: [...context.path, i.toString()],
        errors: []
      };

      const itemResult = this._itemValidator.validate(value[i], itemContext.path.join('.'));
      
      if (!itemResult.success) {
        errors.push(...(itemResult.errors || []));
      } else {
        validatedItems.push(itemResult.data!);
      }
    }

    if (errors.length > 0) {
      return this.createFailure(errors);
    }

    return this.createSuccess(validatedItems);
  }

  /**
   * Sets the minimum length constraint
   * @param length - The minimum length
   */
  minLength(length: number): ArrayValidator<T> {
    const clone = this._clone();
    clone._minLength = length;
    return clone;
  }

  /**
   * Sets the maximum length constraint
   * @param length - The maximum length
   */
  maxLength(length: number): ArrayValidator<T> {
    const clone = this._clone();
    clone._maxLength = length;
    return clone;
  }

  /**
   * Validates that the array is not empty
   */
  nonEmpty(): ArrayValidator<T> {
    return this.minLength(1);
  }

  /**
   * Sets both minimum and maximum length constraints
   * @param min - The minimum length
   * @param max - The maximum length
   */
  length(min: number, max?: number): ArrayValidator<T> {
    let clone = this.minLength(min);
    if (max !== undefined) {
      clone = clone.maxLength(max);
    }
    return clone;
  }

  /**
   * Validates that the array has exactly the specified length
   * @param length - The exact length required
   */
  exactLength(length: number): ArrayValidator<T> {
    return this.length(length, length);
  }

  protected _clone(): ArrayValidator<T> {
    const clone = new ArrayValidator<T>(this._itemValidator);
    clone._isOptional = this._isOptional;
    clone._customMessage = this._customMessage;
    clone._minLength = this._minLength;
    clone._maxLength = this._maxLength;
    return clone;
  }
} 