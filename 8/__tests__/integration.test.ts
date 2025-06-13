import { describe, test, expect } from '@jest/globals';
import { Schema } from '../src';

describe('Integration Tests', () => {
  describe('Real-world schemas', () => {
    test('should validate user registration form', () => {
      const userRegistrationSchema = Schema.object({
        username: Schema.string()
          .minLength(3)
          .maxLength(20)
          .pattern(/^[a-zA-Z0-9_]+$/)
          .withMessage('Username must be 3-20 characters, alphanumeric and underscore only'),
        email: Schema.string()
          .email()
          .withMessage('Please provide a valid email address'),
        password: Schema.string()
          .minLength(8)
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
          .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
        confirmPassword: Schema.string(),
        age: Schema.number()
          .integer()
          .min(13)
          .max(120)
          .withMessage('Age must be between 13 and 120'),
        terms: Schema.boolean()
          .true()
          .withMessage('You must accept the terms and conditions'),
        newsletter: Schema.boolean().optional(),
        referralCode: Schema.string().optional()
      });

      const validRegistration = {
        username: 'john_doe123',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        age: 25,
        terms: true,
        newsletter: false
      };

      expect(userRegistrationSchema.validate(validRegistration).success).toBe(true);

      // Test various invalid scenarios
      expect(userRegistrationSchema.validate({
        ...validRegistration,
        username: 'jo' // too short
      }).success).toBe(false);

      expect(userRegistrationSchema.validate({
        ...validRegistration,
        email: 'invalid-email'
      }).success).toBe(false);

      expect(userRegistrationSchema.validate({
        ...validRegistration,
        password: 'weak' // doesn't meet complexity requirements
      }).success).toBe(false);

      expect(userRegistrationSchema.validate({
        ...validRegistration,
        age: 12 // too young
      }).success).toBe(false);

      // Test boolean true() method directly
      const boolTrueValidator = Schema.boolean().true();
      
      // Test boolean true() with withMessage
      const boolTrueWithMessage = Schema.boolean().true().withMessage('You must accept the terms and conditions');

      expect(userRegistrationSchema.validate({
        ...validRegistration,
        terms: false // must accept terms
      }).success).toBe(false);
    });

    test('should validate e-commerce product schema', () => {
      const productSchema = Schema.object({
        id: Schema.string().pattern(/^[A-Z]{2}\d{6}$/),
        name: Schema.string().minLength(1).maxLength(100),
        description: Schema.string().maxLength(1000).optional(),
        price: Schema.number().positive(),
        currency: Schema.literal('USD', 'EUR', 'GBP', 'JPY'),
        category: Schema.object({
          id: Schema.string(),
          name: Schema.string(),
          parent: Schema.string().optional()
        }),
        tags: Schema.array(Schema.string()).maxLength(10),
        inStock: Schema.boolean(),
        stockQuantity: Schema.number().integer().nonNegative(),
        dimensions: Schema.object({
          length: Schema.number().positive(),
          width: Schema.number().positive(),
          height: Schema.number().positive(),
          unit: Schema.literal('cm', 'in')
        }).optional(),
        images: Schema.array(Schema.string().url()).minLength(1).maxLength(5),
        createdAt: Schema.date().past(),
        updatedAt: Schema.date()
      });

      const validProduct = {
        id: 'AB123456',
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        currency: 'USD' as const,
        category: {
          id: 'electronics',
          name: 'Electronics',
          parent: 'tech'
        },
        tags: ['wireless', 'audio', 'headphones'],
        inStock: true,
        stockQuantity: 50,
        dimensions: {
          length: 20,
          width: 15,
          height: 8,
          unit: 'cm' as const
        },
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg'
        ],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-06-01')
      };

      expect(productSchema.validate(validProduct).success).toBe(true);

      // Test invalid scenarios
      expect(productSchema.validate({
        ...validProduct,
        id: 'invalid-id' // wrong format
      }).success).toBe(false);

      expect(productSchema.validate({
        ...validProduct,
        price: -10 // negative price
      }).success).toBe(false);

      expect(productSchema.validate({
        ...validProduct,
        currency: 'INVALID' // not in literal union
      }).success).toBe(false);

      expect(productSchema.validate({
        ...validProduct,
        images: [] // too few images
      }).success).toBe(false);
    });

    test('should validate API response schema', () => {
      const apiResponseSchema = Schema.object({
        success: Schema.boolean(),
        data: Schema.union(
          Schema.object({
            users: Schema.array(Schema.object({
              id: Schema.string(),
              name: Schema.string(),
              email: Schema.string().email(),
              role: Schema.literal('admin', 'user', 'moderator'),
              lastLogin: Schema.date().optional(),
              preferences: Schema.object({
                theme: Schema.literal('light', 'dark'),
                notifications: Schema.boolean(),
                language: Schema.string().pattern(/^[a-z]{2}$/)
              }).optional()
            })),
            pagination: Schema.object({
              page: Schema.number().integer().positive(),
              limit: Schema.number().integer().positive(),
              total: Schema.number().integer().nonNegative(),
              hasNext: Schema.boolean(),
              hasPrev: Schema.boolean()
            })
          }),
          Schema.object({
            message: Schema.string()
          })
        ),
        errors: Schema.array(Schema.object({
          code: Schema.string(),
          message: Schema.string(),
          field: Schema.string().optional()
        })).optional(),
        meta: Schema.object({
          timestamp: Schema.date(),
          version: Schema.string(),
          requestId: Schema.string()
        })
      });

      const validSuccessResponse = {
        success: true,
        data: {
          users: [
            {
              id: '1',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'admin' as const,
              lastLogin: new Date('2023-06-01'),
              preferences: {
                theme: 'dark' as const,
                notifications: true,
                language: 'en'
              }
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            hasNext: false,
            hasPrev: false
          }
        },
        meta: {
          timestamp: new Date(),
          version: '1.0.0',
          requestId: 'req-123'
        }
      };

      const validErrorResponse = {
        success: false,
        data: {
          message: 'User not found'
        },
        errors: [
          {
            code: 'USER_NOT_FOUND',
            message: 'The requested user does not exist',
            field: 'userId'
          }
        ],
        meta: {
          timestamp: new Date(),
          version: '1.0.0',
          requestId: 'req-456'
        }
      };

      expect(apiResponseSchema.validate(validSuccessResponse).success).toBe(true);
      expect(apiResponseSchema.validate(validErrorResponse).success).toBe(true);
    });
  });

  describe('Complex validation scenarios', () => {
    test('should handle deeply nested optional fields', () => {
      const schema = Schema.object({
        level1: Schema.object({
          level2: Schema.object({
            level3: Schema.object({
              value: Schema.string()
            }).optional()
          }).optional()
        }).optional()
      });

      expect(schema.validate({}).success).toBe(true);
      expect(schema.validate({ level1: {} }).success).toBe(true);
      expect(schema.validate({ level1: { level2: {} } }).success).toBe(true);
      expect(schema.validate({ 
        level1: { 
          level2: { 
            level3: { 
              value: 'test' 
            } 
          } 
        } 
      }).success).toBe(true);
    });

    test('should validate arrays of unions with complex types', () => {
      const schema = Schema.array(
        Schema.union(
          Schema.object({
            type: Schema.literal('text'),
            content: Schema.string()
          }),
          Schema.object({
            type: Schema.literal('image'),
            url: Schema.string().url(),
            alt: Schema.string().optional()
          }),
          Schema.object({
            type: Schema.literal('video'),
            url: Schema.string().url(),
            duration: Schema.number().positive()
          })
        )
      );

      const validContent = [
        { type: 'text', content: 'Hello world' },
        { type: 'image', url: 'https://example.com/image.jpg', alt: 'Example' },
        { type: 'video', url: 'https://example.com/video.mp4', duration: 120 }
      ];

      expect(schema.validate(validContent).success).toBe(true);
      
      // Invalid type
      expect(schema.validate([
        { type: 'audio', content: 'invalid' }
      ]).success).toBe(false);
    });

    test('should validate recursive-like structures', () => {
      const commentSchema = Schema.object({
        id: Schema.string(),
        content: Schema.string(),
        author: Schema.string(),
        replies: Schema.array(Schema.object({
          id: Schema.string(),
          content: Schema.string(),
          author: Schema.string(),
          replies: Schema.array(Schema.object({
            id: Schema.string(),
            content: Schema.string(),
            author: Schema.string()
          })).optional()
        })).optional()
      });

      const validComment = {
        id: '1',
        content: 'Main comment',
        author: 'John',
        replies: [
          {
            id: '2',
            content: 'Reply 1',
            author: 'Jane',
            replies: [
              {
                id: '3',
                content: 'Nested reply',
                author: 'Bob'
              }
            ]
          }
        ]
      };

      expect(commentSchema.validate(validComment).success).toBe(true);
    });
  });

  describe('Performance and edge cases', () => {
    test('should handle large objects efficiently', () => {
      const largeObjectSchema = Schema.object(
        Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [
            `field${i}`,
            Schema.string().optional()
          ])
        )
      );

      const largeObject = Object.fromEntries(
        Array.from({ length: 50 }, (_, i) => [
          `field${i}`,
          `value${i}`
        ])
      );

      expect(largeObjectSchema.validate(largeObject).success).toBe(true);
    });

    test('should handle arrays with many items', () => {
      const schema = Schema.array(Schema.number().positive());
      const largeArray = Array.from({ length: 1000 }, (_, i) => i + 1);
      
      expect(schema.validate(largeArray).success).toBe(true);
    });

    test('should provide detailed error paths for nested failures', () => {
      const schema = Schema.object({
        user: Schema.object({
          profile: Schema.object({
            name: Schema.string().minLength(2),
            contacts: Schema.array(Schema.object({
              type: Schema.literal('email', 'phone'),
              value: Schema.string()
            }))
          })
        })
      });

      const invalidData = {
        user: {
          profile: {
            name: 'J', // too short
            contacts: [
              { type: 'email', value: 'test@example.com' },
              { type: 'invalid', value: 'test' } // invalid type
            ]
          }
        }
      };

      const result = schema.validate(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors!.length).toBeGreaterThan(0);
        // Should have errors for both the name and the invalid contact type
        expect(result.errors!.some(e => e.path.includes('name'))).toBe(true);
        expect(result.errors!.some(e => e.message.includes('Expected one of'))).toBe(true);
      }
    });
  });

  test('validates complex nested objects', () => {
    const userSchema = Schema.object({
      id: Schema.number().integer().positive(),
      name: Schema.string().minLength(2).maxLength(50),
      email: Schema.string().email(),
      age: Schema.number().integer().min(0).max(120).optional(),
      address: Schema.object({
        street: Schema.string().minLength(1),
        city: Schema.string().minLength(1),
        zipCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/),
        country: Schema.string().minLength(2)
      }).optional(),
      tags: Schema.array(Schema.string()).minLength(0).maxLength(10),
      isActive: Schema.boolean(),
      metadata: Schema.object({
        createdAt: Schema.date(),
        updatedAt: Schema.date().optional(),
        version: Schema.number().integer().positive()
      })
    });

    const validUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      address: {
        street: '123 Main St',
        city: 'Anytown',
        zipCode: '12345',
        country: 'US'
      },
      tags: ['user', 'premium'],
      isActive: true,
      metadata: {
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-06-01'),
        version: 1
      }
    };

    const result = userSchema.validate(validUser);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validUser);
    }
  });

  test('validates arrays of complex objects', () => {
    const productSchema = Schema.object({
      id: Schema.number().integer().positive(),
      name: Schema.string().minLength(1),
      price: Schema.number().positive(),
      categories: Schema.array(Schema.string()).minLength(1),
      inStock: Schema.boolean()
    });

    const productsSchema = Schema.array(productSchema).minLength(1).maxLength(100);

    const validProducts = [
      {
        id: 1,
        name: 'Laptop',
        price: 999.99,
        categories: ['electronics', 'computers'],
        inStock: true
      },
      {
        id: 2,
        name: 'Book',
        price: 19.99,
        categories: ['books'],
        inStock: false
      }
    ];

    const result = productsSchema.validate(validProducts);
    expect(result.success).toBe(true);
  });

  test('handles validation errors in nested structures', () => {
    const schema = Schema.object({
      user: Schema.object({
        name: Schema.string().minLength(2),
        age: Schema.number().integer().min(0)
      }),
      items: Schema.array(Schema.object({
        id: Schema.number().integer().positive(),
        quantity: Schema.number().integer().positive()
      }))
    });

    const invalidData = {
      user: {
        name: 'A', // too short
        age: -5 // negative
      },
      items: [
        { id: 1, quantity: 0 }, // quantity not positive
        { id: -1, quantity: 5 } // id not positive
      ]
    };

    const result = schema.validate(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors!.length).toBeGreaterThan(0);
    }
  });

  test('validates union types', () => {
    const stringOrNumberSchema = Schema.union(
      Schema.string().minLength(1),
      Schema.number().positive()
    );

    // Valid string
    expect(stringOrNumberSchema.validate('hello').success).toBe(true);
    
    // Valid number
    expect(stringOrNumberSchema.validate(42).success).toBe(true);
    
    // Invalid: empty string
    expect(stringOrNumberSchema.validate('').success).toBe(false);
    
    // Invalid: negative number
    expect(stringOrNumberSchema.validate(-1).success).toBe(false);
    
    // Invalid: wrong type
    expect(stringOrNumberSchema.validate(true).success).toBe(false);
  });

  test('validates literal types', () => {
    const statusSchema = Schema.literal('active', 'inactive', 'pending');

    // Valid literals
    expect(statusSchema.validate('active').success).toBe(true);
    expect(statusSchema.validate('inactive').success).toBe(true);
    expect(statusSchema.validate('pending').success).toBe(true);

    // Invalid literals
    expect(statusSchema.validate('unknown').success).toBe(false);
    expect(statusSchema.validate('').success).toBe(false);
    expect(statusSchema.validate(null).success).toBe(false);
  });

  test('validates optional fields correctly', () => {
    const schema = Schema.object({
      required: Schema.string(),
      optional: Schema.string().optional()
    });

    // Valid: with optional field
    expect(schema.validate({ required: 'test', optional: 'value' }).success).toBe(true);
    
    // Valid: without optional field
    expect(schema.validate({ required: 'test' }).success).toBe(true);
    
    // Valid: with undefined optional field
    expect(schema.validate({ required: 'test', optional: undefined }).success).toBe(true);
    
    // Invalid: missing required field
    expect(schema.validate({ optional: 'value' }).success).toBe(false);
    
    // Invalid: null optional field
    expect(schema.validate({ required: 'test', optional: null }).success).toBe(false);
  });

  test('validates with custom error messages', () => {
    const schema = Schema.object({
      name: Schema.string().minLength(2).withMessage('Name must be at least 2 characters'),
      age: Schema.number().min(0).withMessage('Age must be non-negative')
    });

    const result = schema.validate({ name: 'A', age: -1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.errors!.map(e => e.message);
      expect(messages).toContain('Name must be at least 2 characters');
      expect(messages).toContain('Age must be non-negative');
    }
  });

  test('validates deeply nested structures', () => {
    const deepSchema = Schema.object({
      level1: Schema.object({
        level2: Schema.object({
          level3: Schema.object({
            value: Schema.string().minLength(1)
          })
        })
      })
    });

    const validData = {
      level1: {
        level2: {
          level3: {
            value: 'deep'
          }
        }
      }
    };

    expect(deepSchema.validate(validData).success).toBe(true);

    const invalidData = {
      level1: {
        level2: {
          level3: {
            value: '' // empty string
          }
        }
      }
    };

    expect(deepSchema.validate(invalidData).success).toBe(false);
  });
}); 