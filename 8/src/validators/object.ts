import { BaseValidator } from './base';
import { ValidationResult, ValidationContext, SchemaDefinition, InferSchemaType } from '../types';

/**
 * Object validator with support for schema-based validation
 * 
 * @example
 * ```typescript
 * const userSchema = Schema.object({
 *   name: Schema.string().minLength(2),
 *   email: Schema.string().email(),
 *   age: Schema.number().min(0).optional()
 * });
 * 
 * type User = InferSchemaType<typeof userSchema>;
 * // { name: string; email: string; age?: number }
 * ```
 */
export class ObjectValidator<T extends Record<string, any>> extends BaseValidator<T> {
  private _schema: SchemaDefinition;
  private _strict = false;

  constructor(schema: SchemaDefinition) {
    super();
    this._schema = schema;
  }

  protected _validate(value: unknown, context: ValidationContext): ValidationResult<T> {
    // Check if value is an object
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return this.createFailure([
        this.createError(`Expected object, got ${Array.isArray(value) ? 'array' : typeof value}`, value, context)
      ]);
    }

    const obj = value as Record<string, any>;
    const errors = [];
    const validatedObject: Record<string, any> = {};

    // Validate each property in the schema
    for (const [key, validator] of Object.entries(this._schema)) {
      const propertyContext: ValidationContext = {
        path: [...context.path, key],
        errors: []
      };

      const propertyValue = obj[key];
      const propertyResult = validator.validate(propertyValue, propertyContext.path.join('.'));

      if (!propertyResult.success) {
        errors.push(...(propertyResult.errors || []));
      } else {
        // Only include the property if it's not undefined or if it was explicitly provided
        if (propertyResult.data !== undefined || key in obj) {
          validatedObject[key] = propertyResult.data;
        }
      }
    }

    // Check for unknown properties in strict mode
    if (this._strict) {
      const schemaKeys = new Set(Object.keys(this._schema));
      const objectKeys = Object.keys(obj);
      
      for (const key of objectKeys) {
        if (!schemaKeys.has(key)) {
          errors.push(
            this.createError(`Unknown property '${key}'`, obj[key], {
              path: [...context.path, key],
              errors: []
            })
          );
        }
      }
    } else {
      // In non-strict mode, include unknown properties as-is
      for (const [key, value] of Object.entries(obj)) {
        if (!(key in this._schema)) {
          validatedObject[key] = value;
        }
      }
    }

    if (errors.length > 0) {
      return this.createFailure(errors);
    }

    return this.createSuccess(validatedObject as T);
  }

  /**
   * Enables strict mode - unknown properties will cause validation to fail
   */
  strict(): ObjectValidator<T> {
    const clone = this._clone();
    clone._strict = true;
    return clone;
  }

  /**
   * Adds additional properties to the schema
   * @param additionalSchema - Additional schema properties
   */
  extend<U extends SchemaDefinition>(
    additionalSchema: U
  ): ObjectValidator<T & InferSchemaType<U>> {
    const newSchema = { ...this._schema, ...additionalSchema };
    const clone = new ObjectValidator<T & InferSchemaType<U>>(newSchema);
    clone._isOptional = this._isOptional;
    clone._customMessage = this._customMessage;
    clone._strict = this._strict;
    return clone;
  }

  /**
   * Creates a partial version of this validator where all properties are optional
   */
  partial(): ObjectValidator<Partial<T>> {
    const partialSchema: SchemaDefinition = {};
    
    for (const [key, validator] of Object.entries(this._schema)) {
      partialSchema[key] = validator.optional();
    }

    const clone = new ObjectValidator<Partial<T>>(partialSchema);
    clone._isOptional = this._isOptional;
    clone._customMessage = this._customMessage;
    clone._strict = this._strict;
    return clone;
  }

  /**
   * Creates a version of this validator with only the specified keys
   * @param keys - The keys to pick from the schema
   */
  pick<K extends keyof T>(...keys: K[]): ObjectValidator<Pick<T, K>> {
    const pickedSchema: SchemaDefinition = {};
    
    for (const key of keys) {
      const stringKey = key as string;
      if (stringKey in this._schema) {
        pickedSchema[stringKey] = this._schema[stringKey];
      }
    }

    const clone = new ObjectValidator<Pick<T, K>>(pickedSchema);
    clone._isOptional = this._isOptional;
    clone._customMessage = this._customMessage;
    clone._strict = this._strict;
    return clone;
  }

  /**
   * Creates a version of this validator without the specified keys
   * @param keys - The keys to omit from the schema
   */
  omit<K extends keyof T>(...keys: K[]): ObjectValidator<Omit<T, K>> {
    const omittedSchema: SchemaDefinition = {};
    const keysToOmit = new Set(keys as string[]);
    
    for (const [key, validator] of Object.entries(this._schema)) {
      if (!keysToOmit.has(key)) {
        omittedSchema[key] = validator;
      }
    }

    const clone = new ObjectValidator<Omit<T, K>>(omittedSchema);
    clone._isOptional = this._isOptional;
    clone._customMessage = this._customMessage;
    clone._strict = this._strict;
    return clone;
  }

  protected _clone(): ObjectValidator<T> {
    const clone = new ObjectValidator<T>(this._schema);
    clone._isOptional = this._isOptional;
    clone._customMessage = this._customMessage;
    clone._strict = this._strict;
    return clone;
  }
} 