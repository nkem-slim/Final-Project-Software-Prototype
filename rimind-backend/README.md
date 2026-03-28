# RIMIND Backend

AI-enabled maternal and child health support system API. Aligned with SRS v1.0.

## Tech stack

- **Runtime:** Node.js + TypeScript  
- **Framework:** Express.js  
- **ORM:** Prisma  
- **Database:** PostgreSQL (AWS RDS in production)  
- **Auth:** JWT (24h access, 7d refresh); bcrypt (min 12 rounds)  
- **Validation:** Zod  

## Local setup

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ (or use Docker for DB only)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET (min 16 chars each)
```

### 3. Database

```bash
npm run db:generate
npm run db:push
npm run db:seed   # optional: creates example admin
```

### 4. Run

```bash
npm run dev
```

API base: `http://localhost:4000`

### With Docker

```bash
docker compose up --build
```

API: `http://localhost:4000`  
PostgreSQL: `localhost:5432` (user `rimind`, password `rimind_secret`, db `rimind`)

## API endpoints

### Sprint 1

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/auth/register` | No | Register (name, phoneNumber, password, role) |
| POST | `/api/auth/login` | No | Login (phoneNumber, password) → JWT |
| GET | `/api/auth/me` | Yes | Current user profile |
| GET | `/api/exercise/:stage` | No | Offline content — PRENATAL \| POSTNATAL |

### Sprint 2 — Reminder engine

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/pregnancy` | MOTHER | Create pregnancy record (auto-generates reminders) |
| GET | `/api/pregnancy/me` | MOTHER | Get own pregnancy records |
| GET | `/api/pregnancy/:userId` | HEALTH_WORKER, ADMIN | Get records for user |
| PUT | `/api/pregnancy/:id` | HEALTH_WORKER | Update healthNotes only |
| POST | `/api/reminders/generate` | ADMIN | Generate reminders for a pregnancy record |
| GET | `/api/reminders/me` | MOTHER | Get own reminders |
| GET | `/api/reminders/:userId` | HEALTH_WORKER, ADMIN | Get reminders for user |
| PATCH | `/api/reminders/:id/status` | ADMIN | Set status SENT \| FAILED |
| POST | `/api/sms/send` | ADMIN | Internal — trigger SMS dispatch for a reminder |
| POST / GET | `/api/ussd` | No | USSD callback (Africa's Talking) — menu: Pregnancy Info, Danger Signs, Exercise Tips, Nearest Clinic, Exit |

### Sprint 3 — SMS/USSD (Africa's Talking)

- **SMS:** Set `AFRICAS_TALKING_API_KEY` and `AFRICAS_TALKING_USERNAME` in `.env` to send real SMS; otherwise reminders are marked SENT without sending.
- **USSD:** Configure your Africa's Talking USSD service callback URL to `https://your-domain/api/ussd`. Menu: 1 Pregnancy Info, 2 Danger Signs, 3 Exercise Tips, 4 Nearest Clinic, 5 Exit.

### Sprint 4 — AI Virtual Doctor

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/ai/ask` | No (rate-limited) | Body: `{ question, context? }` — returns `{ response, disclaimer }` |
| GET | `/api/ai/history/me` | MOTHER | List own consultation history |

- **Provider:** Set `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` (from [Anthropic Console](https://console.anthropic.com)) for Claude. Or `AI_PROVIDER=openai` and `OPENAI_API_KEY` for OpenAI.
- **Rate limit:** 10 requests per IP per minute on `/api/ai/ask`.
- **Fallback:** If the AI service is unavailable or not configured, a curated static message is returned (no raw error).
- **Safety:** Responses are sanitised for diagnostic/prescription language; every response includes the medical disclaimer.

### Sprint 5 — Admin, CHW, Exercise create, Sync

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/users` | ADMIN | List all users |
| GET | `/api/admin/reports` | ADMIN | System report (users by role, reminder counts, recent sync logs) |
| DELETE | `/api/admin/users/:id` | ADMIN | Delete user (cannot delete self) |
| GET | `/api/chw/patients` | HEALTH_WORKER | List mothers (patient list for CHW dashboard) |
| POST | `/api/exercise` | ADMIN, HEALTH_WORKER | Create exercise plan (stage, title, description, duration, source?) |
| POST | `/api/sync` | Yes | Record sync (body: deviceId, recordCount, status) |
| GET | `/api/sync/status/:deviceId` | Yes | Sync history for device |

## Project structure

```
rimind-backend/
├── src/
│   ├── config/       # env, database
│   ├── controllers/ # thin route handlers
│   ├── services/     # business logic
│   ├── repositories/ # Prisma data access
│   ├── routes/       # Express routes + Zod validation
│   ├── middleware/   # auth, RBAC, error, logger
│   ├── utils/        # response formatter, logger
│   ├── app.ts        # Express app factory
│   └── server.ts     # entry
├── prisma/           # schema.prisma, seed.ts
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## License

For ALU / Intro to Software Engineering use.
