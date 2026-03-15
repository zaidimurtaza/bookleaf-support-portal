# BookLeaf API Documentation

Base URL: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

---

## Key Behaviors

- **Author reply** → Ticket status auto-reopens to `Open`, AI re-runs to generate new draft
- **Admin filters** → `GET /tickets?status=Open&priority=High&category=Royalty`
- **AI status** → `ai_status: "processing"` or `"completed"` (admin only)
- **Close ticket** → `PATCH /tickets/{id}?status=Closed`
- **Dashboard stats** → `GET /tickets/stats` (admin)

---

## Authentication

All endpoints except `/login` require a **Bearer token** in the header:

```
Authorization: Bearer <your_access_token>
```

---

## 1. Login

Get a JWT token to use for all other requests.

**Endpoint:** `POST /login`

**Auth required:** No

**Request body:**
```json
{
  "email": "priya.sharma@email.com",
  "password": "password123"
}
```

**Success response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "Priya Sharma",
    "role": "author"
  }
}
```

**Error response (401):**
```json
"Invalid credentials"
```

---

## 2. Get Books

List books. Authors see only their books; admins see all.

**Endpoint:** `GET /books`

**Auth required:** Yes (Bearer token)

**Success response (200):**
```json
[
  {
    "id": 1,
    "book_id": "BK001",
    "author_id": "AUTH001",
    "title": "My First Novel",
    "isbn": "978-1234567890",
    "genre": "Fiction",
    "status": "Published",
    "mrp": 299,
    "total_copies_sold": 1500,
    "royalty_paid": 45000,
    "royalty_pending": 15000
  }
]
```

---

## 3. Create Ticket

Create a support ticket. AI classifies category/priority and generates a draft in the background.

**Endpoint:** `POST /tickets`

**Auth required:** Yes (Author or Admin)

**Request body:**
```json
{
  "book_id": "BK001",
  "subject": "Royalty payment delay",
  "description": "I haven't received my royalty payment for the last 6 months. Please look into this."
}
```

| Field        | Type   | Required | Description                          |
|-------------|--------|----------|--------------------------------------|
| book_id     | string | No       | Related book ID (optional)           |
| subject     | string | Yes      | Ticket subject                       |
| description | string | Yes      | Detailed description                 |

**Success response (200):**
```json
{
  "ticket_id": "TKT1A2B3C4D",
  "status": "Open",
  "message": "Ticket created. AI processing in background."
}
```

**Note:** The response returns immediately. AI updates category, priority, and draft in the background (3–5 seconds).

---

## 4. List Tickets

Get tickets. Authors see only their own; admins see all. **Admins can filter.**

**Endpoint:** `GET /tickets`

**Auth required:** Yes

**Query params (Admin only):**
| Param    | Type   | Description                    |
|----------|--------|--------------------------------|
| status   | string | Open, In Progress, Resolved, Closed |
| priority | string | Critical, High, Medium, Low   |
| category | string | Royalty & Payments, etc.      |

**Examples:**
```
GET /tickets?status=Open
GET /tickets?priority=High&category=Royalty
```

**Success response (200):**
```json
[
  {
    "id": 1,
    "ticket_id": "TKT1A2B3C4D",
    "author_id": "AUTH001",
    "book_id": "BK001",
    "subject": "Royalty payment delay",
    "description": "I haven't received...",
    "status": "Open",
    "category": "Royalty & Payments",
    "priority": "High",
    "ai_draft": null,
    "ai_status": "processing",
    "created_at": "2025-03-14T10:30:00"
  }
]
```

**Note:** Authors do NOT see: `ai_draft`, `priority`, `category`, `ai_status`.

---

## 5. Get Ticket Details

Get a single ticket with its responses.

**Endpoint:** `GET /tickets/{ticket_id}`

**Auth required:** Yes

**Path parameters:**
| Parameter  | Type   | Description   |
|-----------|--------|---------------|
| ticket_id | string | Ticket ID (e.g. TKT1A2B3C4D) |

**Success response (200):**
```json
{
  "id": 1,
  "ticket_id": "TKT1A2B3C4D",
  "author_id": "AUTH001",
  "book_id": "BK001",
  "subject": "Royalty payment delay",
  "description": "I haven't received...",
  "status": "Open",
  "category": "Royalty & Payments",
  "priority": "High",
  "ai_draft": "Dear Author, Thank you for reaching out...",
  "created_at": "2025-03-14T10:30:00",
  "responses": [
    {
      "id": 1,
      "ticket_id": "TKT1A2B3C4D",
      "responder_id": 1,
      "message": "We have looked into your query...",
      "is_internal": false,
      "created_at": "2025-03-14T11:00:00"
    }
  ]
}
```

**Note:** Authors do not see internal notes (`is_internal: true`).

**Error response (404):** `{"error": "Not found"}`

---

## 6. Get AI Draft (Admin only)

Get the AI-generated draft for a ticket. On demand and for refresh

**Endpoint:** `GET /tickets/{ticket_id}/ai-draft`

**Auth required:** Yes (Admin only)

**Path parameters:**
| Parameter  | Type   | Description   |
|-----------|--------|---------------|
| ticket_id | string | Ticket ID     |

**Success response (200):**
```json
{
  "draft": "Dear Author,\n\nThank you for reaching out regarding your royalty payment. We understand your concern and have escalated this to our finance team. We will get back to you within 3 business days.\n\nBest regards,\nBookLeaf Support"
}
```

**Error response (404):** `{"error": "Not found"}`

---

## 7. Update Ticket (Admin only)

Update ticket status, category, or priority.

**Endpoint:** `PATCH /tickets/{ticket_id}`

**Auth required:** Yes (Admin only)

**Path parameters:**
| Parameter  | Type   | Description   |
|-----------|--------|---------------|
| ticket_id | string | Ticket ID     |

**Query parameters:**
| Parameter | Type   | Required | Description                                      |
|----------|--------|----------|--------------------------------------------------|
| status   | string | No       | Open, In Progress, Resolved, Closed             |
| category | string | No       | e.g. Royalty & Payments, General Inquiry        |
| priority | string | No       | Critical, High, Medium, Low                      |

**Success response (200):**
```json
{
  "message": "Updated"
}
```

---

## 8. Get Ticket Stats (Admin only)

Dashboard summary for admin.

**Endpoint:** `GET /tickets/stats`

**Auth required:** Yes (Admin only)

**Success response (200):**
```json
{
  "open": 12,
  "in_progress": 8,
  "resolved": 20,
  "closed": 5,
  "high_priority": 5
}
```

---

## 9. Add Response

Add a reply to a ticket. Authors add public replies; admins can add public replies or internal notes.

**When author replies:** Ticket status auto-reopens to `Open`, AI re-runs to generate new draft for admins.

**Endpoint:** `POST /tickets/{ticket_id}/responses`

**Auth required:** Yes

**Path parameters:**
| Parameter  | Type   | Description   |
|-----------|--------|---------------|
| ticket_id | string | Ticket ID     |

**Request body:**
```json
{
  "message": "Thank you for your patience. We have processed your payment.",
  "is_internal": false
}
```

| Field       | Type   | Required | Description                    |
|-------------|--------|----------|--------------------------------|
| message     | string | Yes      | Response text                  |
| is_internal | bool   | No       | Admin only. Internal note (hidden from author) |

**Success response (200):**
```json
{
  "message": "Response added"
}
```

---

## Quick Reference

| Method | Endpoint                      | Auth   | Description                    |
|--------|-------------------------------|--------|--------------------------------|
| POST   | `/login`                      | No     | Get JWT token                  |
| GET    | `/books`                      | Yes    | List books                     |
| POST   | `/tickets`                    | Yes    | Create ticket                  |
| GET    | `/tickets`                    | Yes    | List tickets                   |
| GET    | `/tickets/{id}`               | Yes    | Get ticket details             |
| GET    | `/tickets/stats`              | Admin  | Dashboard stats                |
| GET    | `/tickets/{id}/ai-draft`      | Admin  | Get AI draft                   |
| PATCH  | `/tickets/{id}`               | Admin  | Update ticket (e.g. status=Closed) |
| POST   | `/tickets/{id}/responses`     | Yes    | Add response                   |

---

## Test Credentials

| Role   | Email                  | Password   |
|--------|------------------------|------------|
| Author | priya.sharma@email.com | password123|
| Admin  | admin@bookleaf.com     | admin123   |

---

## Error Codes

| Code | Meaning                    |
|------|----------------------------|
| 401  | Invalid or missing token   |
| 403  | Admin access required      |
| 404  | Resource not found         |
| 422  | Validation error (bad body)|
