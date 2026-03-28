# Rimind Mobile

React Native (Expo) app for RIMIND — maternal and child health support. SRS-aligned.

## Stack

- **Expo** ~54, **TypeScript**
- **React Navigation** (native-stack, bottom-tabs)
- **Zustand** (auth, pregnancy, reminders, aiChat, sync)
- **Axios** + offline queue (AsyncStorage)
- **AsyncStorage** for cache and queue
- **@react-native-community/netinfo** for connectivity

## Setup

1. Install dependencies: `npm install`
2. Set API URL: create `.env` with `EXPO_PUBLIC_API_URL=http://YOUR_BACKEND_URL` (default `http://localhost:4000`)
3. Start backend (see rimind-backend README)
4. Run app: `npx expo start` then press `a` (Android) or `i` (iOS)

## Screens

- **Login** / **Register** — phone + password; role selection on register
- **Dashboard** — role-aware quick actions; status banner
- **Health info** — exercise plans (PRENATAL / POSTNATAL) from API
- **Virtual Doctor (AI Chat)** — disclaimer banner; ask question; history
- **Pregnancy record** — create/view; cached offline
- **Reminders** — list with date and status
- **CHW Dashboard** — patient list (HEALTH_WORKER)
- **Admin reports** — users, reminders, sync logs (ADMIN)
- **Profile** — user info; sign out; links to CHW/Admin

## Offline

- Requests when offline are queued and flushed on reconnect (`useSync`).
- Cached data (pregnancy, reminders, AI history) is read from AsyncStorage when API fails.

## Navigation

- **Auth stack**: Login → Register (no user)
- **Main tabs**: Home | Health | Virtual Doctor | Reminders | Profile (authenticated)
- **Stack**: Pregnancy record, CHW, Admin (pushed from tabs)
