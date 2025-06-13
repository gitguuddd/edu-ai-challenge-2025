import { BaseValidator } from './base';
import { ValidationResult, ValidationContext } from '../types';

/**
 * Boolean validator for validating boolean values
 * 
 * @example
 * ```typescript
 * const isActiveValidator = Schema.boolean()
 *   .withMessage('isActive must be a boolean value');
 * 
 * const result = isActiveValidator.validate(true);
 * // { success: true, data: true }
 * ```
 */
export class BooleanValidator extends BaseValidator<boolean> {
  private _mustBeTrue = false;
  private _mustBeFalse = false;

  protected _validate(value: unknown, context: ValidationContext): ValidationResult<boolean> {
    // Check if value is a boolean
    if (typeof value !== 'boolean') {
      return this.createFailure([
        this.createError(`Expected boolean, got ${typeof value}`, value, context)
      ]);
    }

    // Check if must be true
    if (this._mustBeTrue && value !== true) {
      return this.createFailure([
        this.createError('Value must be true', value, context)
      ]);
    }

    // Check if must be false
    if (this._mustBeFalse && value !== false) {
      return this.createFailure([
        this.createError('Value must be false', value, context)
      ]);
    }

    return this.createSuccess(value);
  }

  /**
   * Validates that the boolean value is true
   */
  true(): BooleanValidator {
    const clone = this._clone();
    clone._mustBeTrue = true;
    return clone;
  }

  /**
   * Validates that the boolean value is false
   */
  false(): BooleanValidator {
    const clone = this._clone();
    clone._mustBeFalse = true;
    return clone;
  }

  protected _clone(): BooleanValidator {
    const clone = new BooleanValidator();
    clone._isOptional = this._isOptional;
    clone._customMessage = this._customMessage;
    clone._mustBeTrue = this._mustBeTrue;
    clone._mustBeFalse = this._mustBeFalse;
    return clone;
  }
} 