/**
 * ValiLib - A Type-Safe Validation Library for TypeScript
 * 
 * A comprehensive validation library that provides type-safe validators for primitive
 * and complex data types with excellent TypeScript integration and developer experience.
 * 
 * @example
 * ```typescript
 * import { Schema } from 'vallib';
 * 
 * const userSchema = Schema.object({
 *   name: Schema.string().minLength(2).maxLength(50),
 *   email: Schema.string().email(),
 *   age: Schema.number().min(0).max(120).optional(),
 *   isActive: Schema.boolean(),
 *   tags: Schema.array(Schema.string()).minLength(1)
 * });
 * 
 * const result = userSchema.validate({
 *   name: "John Doe",
 *   email: "john@example.com",
 *   isActive: true,
 *   tags: ["developer", "typescript"]
 * });
 * 
 * if (result.success) {
 *   console.log("Valid user:", result.data);
 * } else {
 *   console.log("Validation errors:", result.errors);
 * }
 * ```
 */

// Export main Schema class
export { Schema } from './schema';

// Export all types
export type {
  ValidationResult,
  ValidationError,
  Validator,
  SchemaDefinition,
  InferSchemaType,
  ValidationContext
} from './types';

// Export all validators for advanced usage
export {
  BaseValidator,
  StringValidator,
  NumberValidator,
  BooleanValidator,
  DateValidator,
  ArrayValidator,
  ObjectValidator
} from './validators';

// Default export for convenience
export { Schema as default } from './schema'; 