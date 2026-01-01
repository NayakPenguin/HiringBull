# HiringBull API Documentation

Backend APIs for HiringBull – a comprehensive platform for onboarding users, managing jobs, companies, payments (IAP), referrals, and notifications.

---

## 🚀 Tech Stack

- **Runtime**: Node.js (>= 18)
- **Framework**: Express.js
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: Clerk (JWT & Webhooks)
- **Validation**: Joi
- **Payments**: In-App Purchases (Google Console / Apple Store)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js installed on your machine.
- A running PostgreSQL database.

### Installation
1. Clone the repository and navigate to the server directory.
2. Install dependencies:
   ```bash
   npm install
   ```

### Database Setup
1. Configure your `DATABASE_URL` in the `.env` file.
2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
3. Push the schema to your database:
   ```bash
   npx prisma db push
   ```

### Running the App
- **Development mode**:
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```

---

## 🔑 Environment Variables

Create a `.env` file in the root of the `server/` directory:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `CLERK_PUBLISHABLE_KEY` | No | Clerk publishable key |
| `CLERK_SECRET_KEY` | No | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | No | Secret for verifying Clerk webhooks |
| `INTERNAL_API_KEY` | No | Key for internal/bulk admin operations |
| `PORT` | No | Server port (default: 4000) |

---

## 📂 Project Structure

```bash
server/
├── prisma/             # Prisma schema and migrations
└── src/
    ├── controllers/    # Business logic & request handlers
    ├── middlewares/    # Auth, validation, & error handling
    ├── routes/         # API route definitions
    ├── validations/    # Joi request validation schemas
    ├── utils/          # Helper functions (pagination, env validation)
    ├── index.js        # Server entry point
    └── prismaClient.js # Prisma client singleton
```

---

## 📡 API Endpoints

### Base URL
`https://hiringbull-api.scale8ai.com/api/`

### Authentication & Authorization
| Type | Usage | Header |
|------|-------|--------|
| **Bearer** | Logged-in Users | `Authorization: Bearer <CLERK_JWT>` |
| **API Key** | Admin / Bulk | `x-api-key: <INTERNAL_API_KEY>` |
| **None** | Public Access | — |

> [!IMPORTANT]
> Some routes require an active subscription (`requirePayment`). If the user hasn't paid, these routes will return a `402 Payment Required` status.

---

### 1. User Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/users` | Bearer | Create/Sync user after Clerk signup |
| `GET` | `/users/me` | Bearer | Get current user profile |
| `PUT` | `/users/me`| Bearer | Update current user profile |
| `GET` | `/users` | Bearer | [Admin] List all users |

#### Sample Request (`PUT /api/users/me`)
```json
{
  "name": "John Doe",
  "is_experienced": true,
  "company_name": "Google",
  "years_of_experience": 5,
  "experience_level": "ONE_TO_THREE_YEARS"
}
```

---

### 2. Payment (In-App Purchases)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/payment/order` | Bearer | Initialize a payment/order intent |
| `POST` | `/payment/verify`| Bearer | Verify IAP receipt from Play/App Store |

#### Sample Request (`POST /api/payment/verify`)
```json
{
  "receipt": "base64_encoded_receipt_data",
  "platform": "android",
  "productId": "premium_monthly"
}
```

---

### 3. Company Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/companies` | Bearer + Paid | List all companies |
| `POST` | `/companies` | API Key | Create a single company |
| `POST` | `/companies/bulk`| API Key | Bulk create companies |

---

### 4. Job Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/jobs` | Bearer + Paid | List jobs (supports filtering/pagination)|
| `GET` | `/jobs/:id` | Bearer + Paid | Get job details |
| `POST` | `/jobs/bulk` | API Key | Bulk upload job listings |

---

### 5. Social & Referrals

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/social-posts` | Bearer | Get all referral/social posts |
| `GET` | `/social-posts/:id` | Bearer | Get single social post |
| `POST` | `/social-posts/bulk`| API Key | Bulk create social posts |

---

### 6. Device & Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/users/devices` | Bearer | Register token for current user |
| `GET` | `/users/devices` | Bearer | List current user devices |
| `DELETE`| `/users/devices/:token`| Bearer | Unregister a device token |
| `POST` | `/users/devices/public`| None | Register token (public/guest) |

---

### 7. Webhooks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/webhooks/clerk` | Clerk/Svix | Sync user data from Clerk events |

---

### 8. Testing & Public Hub (Development Only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/public/testing` | None | Health check endpoint |
| `GET` | `/public/auth-test`| Bearer | Verify JWT authentication |
| `GET` | `/public/all-devices`| None | Debug: List all registered devices |

---

## ⚠️ Responses

### Success Response
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response
| Status | Meaning |
|--------|---------|
| `400` | Validation Error |
| `401` | Unauthorized (Invalid token/key) |
| `402` | Payment Required (Subscription expired/missing) |
| `404` | Resource Not Found |
| `500` | Internal Server Error |

```json
{
  "message": "Detailed error message here"
}
```
