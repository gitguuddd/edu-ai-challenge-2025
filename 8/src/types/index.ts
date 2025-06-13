/**
 * Core types and interfaces for the validation library
 */

/**
 * Represents the result of a validation operation
 */
export interface ValidationResult<T = any> {
  /** Whether the validation was successful */
  success: boolean;
  /** The validated data if successful */
  data?: T;
  /** Array of validation errors if unsuccessful */
  errors?: ValidationError[];
}

/**
 * Represents a validation error
 */
export interface ValidationError {
  /** The path to the field that failed validation */
  path: string;
  /** The error message */
  message: string;
  /** The value that failed validation */
  value?: any;
}

/**
 * Base interface for all validators
 */
export interface Validator<T = any> {
  /** Validates the given value */
  validate(value: unknown, path?: string): ValidationResult<T>;
  /** Marks the validator as optional */
  optional(): Validator<T | undefined>;
  /** Sets a custom error message */
  withMessage(message: string): Validator<T>;
}

/**
 * Schema definition for object validation
 */
export type SchemaDefinition = Record<string, Validator<any>>;

/**
 * Infers the TypeScript type from a schema definition
 */
export type InferSchemaType<T extends SchemaDefinition> = {
  [K in keyof T]: T[K] extends Validator<infer U> ? U : never;
};

/**
 * Validation context for tracking validation path
 */
export interface ValidationContext {
  path: string[];
  errors: ValidationError[];
} 