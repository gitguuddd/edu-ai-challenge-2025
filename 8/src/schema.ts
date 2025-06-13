import {
  StringValidator,
  NumberValidator,
  BooleanValidator,
  DateValidator,
  ArrayValidator,
  ObjectValidator
} from './validators';
import { Validator, SchemaDefinition, InferSchemaType } from './types';

/**
 * Main Schema class providing a fluent API for creating type-safe validators
 * 
 * @example
 * ```typescript
 * // Create validators for primitive types
 * const nameValidator = Schema.string().minLength(2).maxLength(50);
 * const ageValidator = Schema.number().min(0).max(120).integer();
 * const isActiveValidator = Schema.boolean();
 * const birthDateValidator = Schema.date().past();
 * 
 * // Create validators for complex types
 * const tagsValidator = Schema.array(Schema.string());
 * const userValidator = Schema.object({
 *   name: nameValidator,
 *   age: ageValidator.optional(),
 *   isActive: isActiveValidator,
 *   tags: tagsValidator
 * });
 * 
 * // Validate data
 * const result = userValidator.validate({
 *   name: "John Doe",
 *   isActive: true,
 *   tags: ["developer", "typescript"]
 * });
 * 
 * if (result.success) {
 *   console.log("Valid data:", result.data);
 * } else {
 *   console.log("Validation errors:", result.errors);
 * }
 * ```
 */
export class Schema {
  /**
   * Creates a string validator
   * 
   * @example
   * ```typescript
   * const emailValidator = Schema.string()
   *   .email()
   *   .withMessage('Please enter a valid email address');
   * 
   * const nameValidator = Schema.string()
   *   .minLength(2)
   *   .maxLength(50)
   *   .withMessage('Name must be between 2 and 50 characters');
   * ```
   */
  static string(): StringValidator {
    return new StringValidator();
  }

  /**
   * Creates a number validator
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
   *   .positive()
   *   .withMessage('Price must be positive');
   * ```
   */
  static number(): NumberValidator {
    return new NumberValidator();
  }

  /**
   * Creates a boolean validator
   * 
   * @example
   * ```typescript
   * const isActiveValidator = Schema.boolean()
   *   .withMessage('isActive must be a boolean value');
   * 
   * const acceptTermsValidator = Schema.boolean()
   *   .true()
   *   .withMessage('You must accept the terms and conditions');
   * ```
   */
  static boolean(): BooleanValidator {
    return new BooleanValidator();
  }

  /**
   * Creates a date validator
   * 
   * @example
   * ```typescript
   * const birthDateValidator = Schema.date()
   *   .past()
   *   .withMessage('Birth date must be in the past');
   * 
   * const appointmentValidator = Schema.date()
   *   .future()
   *   .withMessage('Appointment must be scheduled for the future');
   * ```
   */
  static date(): DateValidator {
    return new DateValidator();
  }

  /**
   * Creates an array validator with the specified item validator
   * 
   * @param itemValidator - The validator for array items
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
  static array<T>(itemValidator: Validator<T>): ArrayValidator<T> {
    return new ArrayValidator<T>(itemValidator);
  }

  /**
   * Creates an object validator with the specified schema
   * 
   * @param schema - The schema definition for object properties
   * 
   * @example
   * ```typescript
   * const addressSchema = Schema.object({
   *   street: Schema.string(),
   *   city: Schema.string(),
   *   postalCode: Schema.string().pattern(/^\d{5}$/),
   *   country: Schema.string()
   * });
   * 
   * const userSchema = Schema.object({
   *   id: Schema.string(),
   *   name: Schema.string().minLength(2).maxLength(50),
   *   email: Schema.string().email(),
   *   age: Schema.number().min(0).optional(),
   *   address: addressSchema.optional()
   * });
   * 
   * type User = InferSchemaType<typeof userSchema>;
   * ```
   */
  static object<T extends SchemaDefinition>(
    schema: T
  ): ObjectValidator<InferSchemaType<T>> {
    return new ObjectValidator<InferSchemaType<T>>(schema);
  }

  /**
   * Creates a literal validator that only accepts specific values
   * 
   * @param values - The allowed literal values
   * 
   * @example
   * ```typescript
   * const statusValidator = Schema.literal('active', 'inactive', 'pending');
   * const booleanValidator = Schema.literal(true, false);
   * ```
   */
  static literal<T extends readonly [any, ...any[]]>(...values: T): Validator<T[number]> {
    return {
      validate(value: unknown) {
        if (values.includes(value as any)) {
          return { success: true, data: value as T[number] };
        }
        return {
          success: false,
          errors: [{
            path: 'root',
            message: `Expected one of: ${values.join(', ')}, got ${JSON.stringify(value)}`,
            value
          }]
        };
      },
      optional() {
        return {
          validate(value: unknown) {
            if (value === undefined || value === null) {
              return { success: true, data: undefined };
            }
            return this.validate(value);
          },
          optional: () => this.optional(),
          withMessage: (message: string) => this.withMessage(message)
        } as Validator<T[number] | undefined>;
      },
      withMessage(message: string) {
        return {
          validate(value: unknown) {
            const result = this.validate(value);
            if (!result.success && result.errors) {
              result.errors = result.errors.map(error => ({ ...error, message }));
            }
            return result;
          },
          optional: () => this.optional(),
          withMessage: (msg: string) => this.withMessage(msg)
        } as Validator<T[number]>;
      }
    } as Validator<T[number]>;
  }

  /**
   * Creates a union validator that accepts any of the provided validators
   * 
   * @param validators - The validators to union
   * 
   * @example
   * ```typescript
   * const stringOrNumberValidator = Schema.union(
   *   Schema.string(),
   *   Schema.number()
   * );
   * 
   * const idValidator = Schema.union(
   *   Schema.string().uuid(),
   *   Schema.number().positive().integer()
   * );
   * ```
   */
  static union<T extends readonly [Validator<any>, ...Validator<any>[]]>(
    ...validators: T
  ): Validator<T[number] extends Validator<infer U> ? U : never> {
    return {
      validate(value: unknown) {
        const errors = [];
        
        for (const validator of validators) {
          const result = validator.validate(value);
          if (result.success) {
            return result;
          }
          if (result.errors) {
            errors.push(...result.errors);
          }
        }
        
        return {
          success: false,
          errors: [{
            path: 'root',
            message: `Value did not match any of the union types`,
            value
          }]
        };
      },
      optional() {
        return {
          validate(value: unknown) {
            if (value === undefined || value === null) {
              return { success: true, data: undefined };
            }
            return this.validate(value);
          },
          optional: () => this.optional(),
          withMessage: (message: string) => this.withMessage(message)
        } as Validator<(T[number] extends Validator<infer U> ? U : never) | undefined>;
      },
      withMessage(message: string) {
        return {
          validate(value: unknown) {
            const result = this.validate(value);
            if (!result.success && result.errors) {
              result.errors = [{ path: 'root', message, value }];
            }
            return result;
          },
          optional: () => this.optional(),
          withMessage: (msg: string) => this.withMessage(msg)
        } as Validator<T[number] extends Validator<infer U> ? U : never>;
      }
    } as Validator<T[number] extends Validator<infer U> ? U : never>;
  }
} 