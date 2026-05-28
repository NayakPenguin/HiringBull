# HiringBull Backend Structure

This document outlines the folder structure and architectural patterns for the backend.

## Architecture Pattern
**Routes → Middleware → Controllers (Logic) → Database**

We have simplified the architecture by removing the Service layer. Controllers are responsible for both handling HTTP requests and executing business logic.

## Directory Structure
```
server/
├── prisma/             # Database schema (schema.prisma)
├── src/
│   ├── types/          # TypeScript type definitions
│   ├── controllers/    # Request handlers + Business Logic (.ts)
│   ├── middlewares/    # Request interceptors (.ts)
│   │   ├── auth.ts         # JWT authentication
│   │   ├── rateLimiter.ts  # Rate limiting
│   │   ├── validate.ts     # Joi schema validation
│   │   └── errorHandlers.ts # Global error handling
│   ├── routes/         # API Endpoint definitions (.ts)
│   ├── validations/    # Joi schemas for request validation (.ts)
│   ├── utils/          # Helper functions (.ts)
│   └── config/         # Configuration files (.ts)
├── dist/               # Compiled JavaScript output
└── package.json
```

## Module Responsibilities

### 1. Routes (`src/routes`)
- Define endpoints (e.g., `POST /users`).
- Apply middlewares (validation, auth).
- Call controllers.

### 2. Controllers (`src/controllers`)
- **Primary Logic Layer**.
- Handle input/output.
- Validate business rules (e.g., "Email exists?").
- Call Prisma methods (`prisma.user.create`).
- Send responses.

### 3. Middlewares (`src/middlewares`)
- `auth.js`: Clerk authentication + API key protection.
- `rateLimiter.js`: Rate limiting for API protection.
- `validate.js`: Validates request against Joi schemas.
- `errorHandlers.js`: Global error handling.

### 4. Validations (`src/validations`)
- Define the shape of expected request data (body/params/query).

## API Endpoints

### User Management
- `POST /api/users` - Create a new user (public, for Clerk webhook sync)
- `GET /api/users` - Get all users (requires auth)
- `GET /api/users/:id` - Get user by ID (requires auth)
- `PUT /api/users/:id` - Update user (requires auth)
- `DELETE /api/users/:id` - Delete user (requires auth)

### Device Management
- `POST /api/users/devices` - Register a device token (requires auth)
- `GET /api/users/devices` - Get all devices for current user (requires auth)
- `DELETE /api/users/devices/:token` - Remove a device token (requires auth)

### Company Management
- `GET /api/companies` - Get all companies (public)
- `POST /api/companies` - Create company (requires API key)
- `POST /api/companies/bulk` - Bulk create companies (requires API key)

### Job Management
- `GET /api/jobs` - Get all jobs with filtering/pagination (public)
- `POST /api/jobs` - Create job (requires API key)
- `POST /api/jobs/bulk` - Bulk create jobs (requires API key)

### Social Posts
- `GET /api/social-posts` - Get all social posts with filtering (public)
- `GET /api/social-posts/:id` - Get single post (public)
- `POST /api/social-posts` - Create post (requires API key)
- `PUT /api/social-posts/:id` - Update post (requires API key)
- `DELETE /api/social-posts/:id` - Delete post (requires API key)
- `POST /api/social-posts/:id/comments` - Add comment (requires auth)

### Payments
- `POST /api/payment/create-order` - Create Razorpay order (requires auth)
- `POST /api/payment/verify` - Verify payment signature (requires auth)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | No | Clerk authentication secret |
| `RAZORPAY_KEY_ID` | No | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | No | Razorpay API secret |
| `INTERNAL_API_KEY` | No | API key for internal/bulk operations |
| `PORT` | No | Server port (default: 4000) |
