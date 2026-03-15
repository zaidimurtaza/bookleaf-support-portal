# BookLeaf Support Portal

**Live:** [https://bookleaf-support-portal.vercel.app/](https://bookleaf-support-portal.vercel.app/)

Author support portal with AI-powered ticket management. Built per [BookLeaf_Technical_Assignment_Instructions.pdf](./BookLeaf_Technical_Assignment_Instructions.pdf).

**Stack:** FastAPI + PostgreSQL + React + **Google Gemini API** (chosen for its generous free-tier limits).

---

## Architecture notes

- **REST + polling:** The assignment requires a REST API. For "real-time without refreshing," the frontend polls ticket data every 10 seconds when the tab is visible. This keeps the API RESTful while giving authors near real-time updates without manual refresh, and avoids unnecessary requests when the user has switched tabs.
- **AI cost awareness:** Conversation history sent to Gemini is pruned to the first message + last 4 responses. This cuts token usage and keeps the model focused on recent context.

---

## Folder structure

```
bookleaf-support-portal/
├── backend_support_portal/     # FastAPI + PostgreSQL + Gemini AI
│   ├── app/
│   ├── main.py
│   ├── requirements.txt
│   ├── schema.sql
│   ├── seed.py
│   └── .env.example
├── ui_support_portal/          # React + Vite + Tailwind
│   ├── src/
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## How to run

### 1. Clone

```bash
git clone https://github.com/zaidimurtaza/bookleaf-support-portal
cd bookleaf-support-portal
```

### 2. Backend (port 8000)

```bash
cd backend_support_portal
cp .env.example .env
# Edit .env with your PostgreSQL credentials and GEMINI_API_KEY

pip install -r requirements.txt

# Create bookleaf schema and seed (first time only)
createdb -U postgres bookleaf_db
psql -U postgres -d bookleaf_db -f schema.sql
python seed.py

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API: http://localhost:8000 | Docs: http://localhost:8000/docs

### 3. Frontend (port 8001)

Open a new terminal:

```bash
cd ui_support_portal
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000 for local dev

npm install
npm run dev
```

App: http://localhost:8001

---

## Test credentials

| Role   | Email                  | Password   |
|--------|------------------------|------------|
| Admin  | admin@bookleaf.com     | admin123   |
| Author | priya.sharma@email.com | password123 |

---

## API docs

Full API reference: [backend_support_portal/API_DOCS.md](./backend_support_portal/API_DOCS.md)
