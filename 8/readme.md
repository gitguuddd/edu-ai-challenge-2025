# ValiLib

A type-safe validation library for TypeScript with excellent developer experience and comprehensive validation capabilities.

## Features

- **Type-safe**: Full TypeScript support with automatic type inference
- **Comprehensive validators**: String, number, boolean, date, array, object validation
- **Schema composition**: Extend, pick, omit, and partial schemas
- **Custom error messages**: Detailed validation error reporting
- **Zero dependencies**: Lightweight and self-contained
- **Fluent API**: Chainable validation methods

## Installation & Usage

```bash
npm install
npm start  # Run demo examples
```

## Quick Example

```typescript
import { Schema } from './src';

const userSchema = Schema.object({
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().email(),
  age: Schema.number().min(0).optional(),
  isActive: Schema.boolean()
});

const result = userSchema.validate({
  name: "John Doe",
  email: "john@example.com",
  isActive: true
});

if (result.success) {
  console.log("Valid:", result.data);
} else {
  console.log("Errors:", result.errors);
}
```

## Advanced Examples

### Type Inference
```typescript
const productSchema = Schema.object({
  id: Schema.string(),
  name: Schema.string().minLength(1),
  price: Schema.number().min(0),
  tags: Schema.array(Schema.string()),
  metadata: Schema.object({
    category: Schema.string(),
    featured: Schema.boolean().optional()
  }).optional()
});

// TypeScript automatically infers the type:
type Product = {
  id: string;
  name: string;
  price: number;
  tags: string[];
  metadata?: {
    category: string;
    featured?: boolean;
  };
}
```

### Schema Composition
```typescript
const baseUserSchema = Schema.object({
  name: Schema.string(),
  email: Schema.string().email()
});

// Extend schema
const adminSchema = baseUserSchema.extend({
  role: Schema.literal('admin'),
  permissions: Schema.array(Schema.string())
});

// Pick specific fields
const publicUserSchema = baseUserSchema.pick(['name']);

// Make all fields optional
const userUpdateSchema = baseUserSchema.partial();
```

### Complex Nested Validation
```typescript
const orderSchema = Schema.object({
  id: Schema.string(),
  customer: Schema.object({
    name: Schema.string(),
    address: Schema.object({
      street: Schema.string(),
      city: Schema.string(),
      postalCode: Schema.string().pattern(/^\d{5}$/)
    })
  }),
  items: Schema.array(Schema.object({
    productId: Schema.string(),
    quantity: Schema.number().min(1),
    price: Schema.number().min(0)
  })).minLength(1),
  status: Schema.literal('pending').or(Schema.literal('completed')),
  createdAt: Schema.date().past()
});
```

### Union Types & Literals
```typescript
const eventSchema = Schema.object({
  type: Schema.literal('click').or(Schema.literal('view')).or(Schema.literal('purchase')),
  data: Schema.object({
    userId: Schema.string(),
    timestamp: Schema.date(),
    value: Schema.number().optional()
  })
});

// Strict mode for exact object matching
const apiResponseSchema = Schema.object({
  success: Schema.boolean(),
  data: Schema.object({}).optional(),
  error: Schema.string().optional()
}).strict();
```

## Testing

```bash
npm test  # Run all tests with coverage
```

- 113 tests across 7 test suites
- 87%+ overall coverage
- Comprehensive validation scenarios

## File Structure

```
src/
├── index.ts          # Main exports
├── schema.ts         # Schema factory class
├── types/            # TypeScript type definitions
└── validators/       # Individual validator implementations
    ├── string.ts     # String validation
    ├── number.ts     # Number validation
    ├── boolean.ts    # Boolean validation
    ├── date.ts       # Date validation
    ├── array.ts      # Array validation
    └── object.ts     # Object validation

__tests__/            # Test suites
index.ts              # Demo examples
```

## Validators

- **String**: length, pattern, email, URL validation
- **Number**: min/max, integer, positive/negative constraints
- **Boolean**: strict boolean validation
- **Date**: range, future/past validation
- **Array**: length constraints, item validation
- **Object**: schema validation, strict mode, composition methods 