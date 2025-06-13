import { Validator, ValidationResult, ValidationError, ValidationContext } from '../types';

/**
 * Abstract base class for all validators
 * Provides common functionality like optional validation and custom error messages
 */
export abstract class BaseValidator<T> implements Validator<T> {
  protected _isOptional = false;
  protected _customMessage?: string;

  /**
   * Abstract method that must be implemented by concrete validators
   * @param value - The value to validate
   * @param context - The validation context for error tracking
   */
  protected abstract _validate(value: unknown, context: ValidationContext): ValidationResult<T>;

  /**
   * Validates a value and returns the validation result
   * @param value - The value to validate
   * @param path - The path for error reporting (defaults to empty string)
   */
  validate(value: unknown, path = ''): ValidationResult<T> {
    const context: ValidationContext = {
      path: path ? path.split('.') : [],
      errors: []
    };

    // Handle optional values
    if (this._isOptional && value === undefined) {
      return { success: true, data: undefined as T };
    }

    return this._validate(value, context);
  }

  /**
   * Marks this validator as optional
   * Optional validators will pass validation for undefined/null values
   */
  optional(): Validator<T | undefined> {
    const clone = this._clone();
    clone._isOptional = true;
    return clone as Validator<T | undefined>;
  }

  /**
   * Sets a custom error message for this validator
   * @param message - The custom error message
   */
  withMessage(message: string): Validator<T> {
    const clone = this._clone();
    clone._customMessage = message;
    return clone;
  }

  /**
   * Creates a clone of this validator
   * Must be implemented by concrete validators
   */
  protected abstract _clone(): BaseValidator<T>;

  /**
   * Creates a validation error with the current context
   * @param message - The error message
   * @param value - The value that failed validation
   * @param context - The validation context
   */
  protected createError(message: string, value: unknown, context: ValidationContext): ValidationError {
    return {
      path: context.path.join('.') || 'root',
      message: this._customMessage || message,
      value
    };
  }

  /**
   * Creates a successful validation result
   * @param data - The validated data
   */
  protected createSuccess(data: T): ValidationResult<T> {
    return { success: true, data };
  }

  /**
   * Creates a failed validation result
   * @param errors - The validation errors
   */
  protected createFailure(errors: ValidationError[]): ValidationResult<T> {
    return { success: false, errors };
  }
} 