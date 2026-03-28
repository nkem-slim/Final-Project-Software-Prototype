# RIMIND - AI-Enabled Maternal & Child Health Support System

RIMIND is a full-stack maternal health platform providing mobile-first access for mothers, community health workers (CHWs), and administrators. It combines an AI virtual doctor, automated reminders, offline-first sync, and SMS/USSD (Coming soon) support for low-connectivity environments.

---

## Repository Structure

```
intro-to-software-engineering/
├── rimind-mobile/     # React Native (Expo) mobile app
└── rimind-backend/    # Node.js/Express REST API
```

---

## Features

| Feature           | Description                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| Multi-role auth   | MOTHER, HEALTH_WORKER, ADMIN — phone + password, JWT                    |
| AI Virtual Doctor | Ask health questions powered by Claude                                  |
| Pregnancy records | Track expected delivery date and trimester                              |
| Exercise plans    | AI-generated prenatal/postnatal routines                                |
| Reminders         | Push, (SMS, and USSD - to be implemented) notification channels         |
| CHW Dashboard     | Health workers view patients in their location                          |
| Admin panel       | User management and system reports                                      |
| Offline-first     | Caches data locally, queues failed requests for sync                    |
| SMS/USSD          | Africa's Talking integration for feature phone users (to be implemeted) |

---

## Tech Stack

### Mobile (`rimind-mobile`)

- **Expo** ~54 · **React Native** 0.81 · **TypeScript**
- **Zustand** — state management
- **Axios** — HTTP with offline queue
- **AsyncStorage** — local caching
- **React Navigation** — stack + bottom tabs

### Backend (`rimind-backend`)

- **Node.js 18+** · **Express.js** · **TypeScript**
- **Prisma** ORM · **PostgreSQL** database
- **JWT** (24 h access / 7 d refresh) · **bcrypt** (min 12 rounds)
- **Zod** — request validation
- **Anthropic SDK** — pluggable AI provider
- **Africa's Talking** — SMS/USSD (optional)
- **Docker** — containerised deployment

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Expo Go app (for mobile development)

---

### 1. Backend

```bash
cd rimind-backend
npm install
cp .env.example .env   # fill in the values below
npm run db:migrate     # apply database migrations
npm run dev            # start with hot reload (port 4000)
```

**Required environment variables** (`.env`):

```env
NODE_ENV=development
PORT=4000

# PostgreSQL
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE

# JWT (min 16 characters each)
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d
BCRYPT_ROUNDS=12

# AI provider — choose one
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key
AI_MODEL_ANTHROPIC=claude-haiku-4-5

# AI_PROVIDER=openai
# OPENAI_API_KEY=your_openai_api_key
# AI_MODEL_OPENAI=gpt-4o-mini

# SMS/USSD — optional (falls back to stub if omitted)
# AFRICAS_TALKING_API_KEY=
# AFRICAS_TALKING_USERNAME=sandbox
# AFRICAS_TALKING_BASE_URL=https://api.sandbox.africastalking.com
# SMS_SENDER_ID=
```

**Or with Docker:**

```bash
docker compose up --build
```

The database migration runs automatically on container startup.

---

### 2. Mobile

```bash
cd rimind-mobile
npm install
cp .env.example .env   # set EXPO_PUBLIC_API_URL
npx expo start
```

**Environment variable** (`.env`):

```env
# Android emulator
EXPO_PUBLIC_API_URL=http://rimind.medatta0.tech

# iOS simulator
# EXPO_PUBLIC_API_URL=http://rimind.medatta0.tech

# Physical device
# EXPO_PUBLIC_API_URL=http://rimind.medatta0.tech

# Hosted server
# EXPO_PUBLIC_API_URL=http://rimind.medatta0.tech
```

Scan the QR code in the terminal with the **Expo Go** app to run on a physical device.

---

## API Overview

| Method | Endpoint             | Description                        |
| ------ | -------------------- | ---------------------------------- |
| POST   | `/api/auth/register` | Register (MOTHER or HEALTH_WORKER) |
| POST   | `/api/auth/login`    | Login, returns JWT                 |
| GET    | `/api/auth/me`       | Current user profile               |
| GET    | `/api/pregnancy/me`  | Own pregnancy records              |
| POST   | `/api/pregnancy`     | Add pregnancy record               |
| GET    | `/api/reminders/me`  | Own reminders                      |
| POST   | `/api/reminders`     | Send a reminder (admin)            |
| POST   | `/api/ai/ask`        | Ask the AI virtual doctor          |
| GET    | `/api/ai/history/me` | AI consultation history            |
| GET    | `/api/chw/patients`  | Patients list (HEALTH_WORKER)      |
| GET    | `/api/admin/users`   | All users (ADMIN)                  |
| GET    | `/health`            | Server health check                |

Full API documentation available at `/api/docs` when the server is running.

---

## User Roles

| Role            | Access                                                           |
| --------------- | ---------------------------------------------------------------- |
| `MOTHER`        | Dashboard, pregnancy records, exercise plans, AI chat, reminders |
| `HEALTH_WORKER` | CHW dashboard, view patient records (read-only)                  |
| `ADMIN`         | Send reminders, user management, reports                         |

---

## Database Schema

Key models: **User**, **PregnancyRecord**, **Reminder**, **AIConsultation**, **ExercisePlan**, **SyncLog**.

Run `npm run db:studio` inside `rimind-backend` to open Prisma Studio and browse the database visually.

---

## Deployment

The backend is configured for deployment on any Linux server (tested on DigitalOcean). Key steps:

1. Set all environment variables on the server
2. Run `npm run db:migrate` to apply migrations
3. Start with `npm start` or use the provided `start-server-migrate-db.sh` script
4. For the mobile app, set `EXPO_PUBLIC_API_URL` to your server's public URL and rebuild with EAS

---

## Project Structure

```
rimind-mobile/src/
├── screens/       # Login, Register, Dashboard, AIChat, Reminders, etc.
├── store/         # Zustand stores (auth, pregnancy, reminders, AI, exercise)
├── components/    # Shared UI (Button, Card, StatusBanner, etc.)
├── services/      # Axios API client with offline queue
├── hooks/         # useConnectivity, useOfflineQueue
└── utils/         # Date formatting, storage helpers, constants

rimind-backend/src/
├── routes/        # Express routers (auth, pregnancy, reminders, ai, chw, admin, …)
├── controllers/   # Thin request handlers
├── services/      # Business logic
├── repositories/  # Prisma data access layer
├── middleware/    # requireAuth, requireRole, errorHandler, rateLimiter
└── config/        # Environment validation, database connection
```
