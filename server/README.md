# HiringBull API Documentation

Backend APIs for HiringBull – onboarding users, jobs, companies, payments, referrals, and notifications.

---

## Base URL
https://hiringbull-api.scale8ai.com/api/


---

## Authentication

| Type | Usage |
|----|------|
| Bearer (Clerk JWT) | Logged-in user APIs |
| API Key | Internal / Admin / Bulk APIs |
| None | Public APIs |

### Headers

```http
Authorization: Bearer <CLERK_JWT_TOKEN>
x-api-key: <INTERNAL_API_KEY>
Content-Type: application/json
```

## 1. Onboarding (User Management)

| Method | API | Auth | Sample Body |
|------|-----|------|------------|
| POST | `/users` | Bearer | `{ "name": "John Doe", "email": "john@gmail.com", "segment": "software_engineering" }` |
| GET | `/users/me` | Bearer | — |
| GET | `/users` | Bearer (Admin) | — |
| GET | `/users/:id` | Bearer | — |
| PUT | `/users/:id` | Bearer | `{ "company_name": "Google", "years_of_experience": 5 }` |
| DELETE | `/users/:id` | Bearer | — |

---

## 2. Payment

| Method | API | Auth | Sample Body |
|------|-----|------|------------|
| POST | `/payment/order` | Bearer | `{ "amount": 999, "userId": "user-uuid" }` |
| POST | `/payment/verify` | Bearer | `{ "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "...", "userId": "user-uuid" }` |

**Notes**
- Amount in INR (converted to paise internally)
- On success: `isPaid = true`, `planExpiry` updated

---

## 3. Add Companies

| Method | API | Auth | Sample Body |
|------|-----|------|------------|
| GET | `/companies` | None | — |
| POST | `/companies` | API Key | `{ "name": "Stripe", "category": "global_startup" }` |
| POST | `/companies/bulk` | API Key | `[ { "name": "Uber" }, { "name": "Airbnb" } ]` |

---

## 4. Add Job

| Method | API | Auth | Sample Body |
|------|-----|------|------------|
| GET | `/jobs` | None | — |
| GET | `/jobs/:id` | None | — |
| POST | `/jobs/bulk` | API Key | `[ { "title": "SDE", "companyId": "company-uuid", "segment": "software_engineering" } ]` |

---

## 5. Job Notification

| Method | API | Auth | Sample Body |
|------|-----|------|------------|
| POST | `/users/devices` | Bearer | `{ "token": "fcm_token_123", "type": "android" }` |
| POST | `/users/devices/public` | None | `{ "token": "fcm_token_public", "type": "ios" }` |

---

## 6. Add Social Post

| Method | API | Auth | Sample Body |
|------|-----|------|------------|
| GET | `/social-posts` | None | — |
| GET | `/social-posts/:id` | None | — |
| POST | `/social-posts/bulk` | API Key | `[ { "name": "Google Referral", "source": "linkedin" } ]` |

---

## 7. Company Outreach Form

| Method | API | Auth | Sample Body |
|------|-----|------|------------|
| POST | `/outreach` | Bearer | `{ "companyId": "uuid", "message": "Interested in referral" }` |
| GET | `/outreach` | Bearer (Admin) | — |

---

## 8. Referral

| Method | API | Auth | Sample Body |
|------|-----|------|------------|
| POST | `/referrals` | Bearer | `{ "companyId": "uuid", "resumeLink": "https://..." }` |
| GET | `/referrals` | Bearer | — |

---

## Error Responses

| Status | Meaning |
|------|--------|
| 400 | Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

```json
{
  "message": "Error message here"
}
