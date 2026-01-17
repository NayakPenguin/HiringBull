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

## � API Reference

### Base URL
`https://api.hiringbull.org/`

---

### 1. User Management
Manage user profiles and onboarding.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users/me` | Bearer | Get current user profile |
| `PUT` | `/users/me` | Bearer | Update current user profile |
| `GET` | `/users` | Bearer | [Admin] List all users |
| `GET` | `/users/:id`| Bearer | [Admin] Get user by ID |
| `DELETE`| `/users/:id`| Bearer | Delete user profile |

<!-- slide -->
```json
// GET /users/me (Response)
{
  "id": "uuid-123",
  "name": "John Doe",
  "email": "john@gmail.com",
  "onboarding_completed": true,
  "followedCompanies": []
}
```
<!-- slide -->
```json
// PUT /users/me (Request)
{
  "name": "John Updated",
  "is_experienced": true,
  "company_name": "Google",
  "experience_level": "ONE_TO_THREE_YEARS",
  "resume_link": "https://drive.google.com/..."
}
```
<!-- slide -->
```json
// DELETE /users/:id (Response)
{
  "status": "success",
  "message": "User deleted"
}
```

---

### 2. Company Management
Browse and manage recruiting companies.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/companies` | Bearer + Paid | List companies (filterable by category) |
| `POST` | `/companies` | API Key | Create a single company |
| `POST` | `/companies/bulk`| API Key | Bulk creation of companies |

```json
// GET /companies?category=global_mnc (Response)
[
  {
    "id": "uuid-cmp-1",
    "name": "Google",
    "category": "global_mnc",
    "logo": "https://..."
  }
]
```
<!-- slide -->
```json
// POST /companies (Request)
{
  "name": "Stripe",
  "description": "Payment processor",
  "category": "global_startup",
  "logo": "https://..."
}
```
<!-- slide -->
```json
// POST /companies/bulk (Request)
[
  { "name": "Apple", "category": "global_mnc" },
  { "name": "Netflix", "category": "global_mnc" }
]
```

---

### 3. Job Management
Access job listings across segments.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/jobs` | Bearer + Paid | List jobs (filtering & pagination) |
| `GET` | `/jobs/:id` | Bearer + Paid | Detailed job view |
| `POST` | `/jobs/bulk` | API Key | Ingest jobs in bulk |

```json
// GET /jobs?segment=software_engineering&page=1 (Response)
{
  "data": [
    {
      "id": "uuid-job-1",
      "title": "SDE-1",
      "companyRel": { "name": "Uber" }
    }
  ],
  "pagination": { "total": 100, "page": 1, "limit": 20 }
}
```
<!-- slide -->
```json
// POST /jobs/bulk (Request)
[
  {
    "title": "Backend Dev",
    "company": "Swiggy",
    "segment": "software_engineering",
    "careerpage_link": "https://..."
  }
]
```

---

### 4. Social Posts
Referral posts and social updates.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/social-posts` | Bearer | List social posts |
| `GET` | `/social-posts/:id`| Bearer | Get post details and comments |
| `POST` | `/social-posts/bulk`| API Key | Bulk upload social posts |

```json
// GET /social-posts/:id (Response)
{
  "id": "uuid-post-1",
  "name": "Google Referral",
  "comments": [
    { "text": "Interested!", "user": { "name": "Alice" } }
  ]
}
```
<!-- slide -->
```json
// POST /social-posts/bulk (Request)
[
  {
    "name": "Meta SDE Referral",
    "description": "Looking to refer...",
    "source": "linkedin",
    "source_link": "https://..."
  }
]
```

---

### 5. Payments (IAP)
Subscription and verification logic.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/payment/order` | Bearer | Initialize IAP intent |
| `POST` | `/payment/verify`| Bearer | Verify receipt data |

```json
// POST /payment/verify (Request)
{
  "receipt": "base64_data",
  "platform": "ios",
  "productId": "premium_tier_1"
}
```
<!-- slide -->
```json
// POST /payment/order (Request)
{
  "userId": "your-uuid",
  "amount": 999
}
```

---

### 6. Notifications & Devices
Push notification registration.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/users/devices` | Bearer | Register current user device |
| `POST` | `/users/devices/public`| None | Register guest device |
| `GET` | `/users/devices`| Bearer | Get user devices |
| `POST` | `/public/send-notification`| None | [Testing] Trigger push |

```json
// POST /users/devices (Request)
{
  "token": "ExponentPushToken[...]",
  "type": "android"
}
```
<!-- slide -->
```json
// POST /public/send-notification (Request)
{
  "title": "Hello",
  "body": "This is a test notification",
  "data": { "jobId": "123" }
}
```

---

### 7. Webhooks
External event sync.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/webhooks/clerk` | Svix Signature | Sync user data from Clerk |

```json
// POST /webhooks/clerk (Example Payload)
{
  "type": "user.created",
  "data": {
    "id": "user_2Y...",
    "email_addresses": [{ "email_address": "test@test.com" }],
    "first_name": "Test",
    "last_name": "User"
  }
}
```

---

## ⚠️ Common Responses

| Status | Meaning |
|--------|---------|
| `200` | OK - Request successful |
| `201` | Created - Resource created |
| `400` | Bad Request - Validation error |
| `401` | Unauthorized - Authentication failed |
| `402` | Payment Required - Active subscription missing |
| `404` | Not Found - Resource does not exist |
| `500` | Internal Server Error |

---

## 📂 Project Structure

```bash
server/
├── prisma/             # Database schema
└── src/
    ├── controllers/    # Business logic
    ├── middlewares/    # Interceptors (Auth, Payment)
    ├── routes/         # API Paths
    ├── validations/    # Request schemas (Joi)
    └── index.js        # Entry point
```
