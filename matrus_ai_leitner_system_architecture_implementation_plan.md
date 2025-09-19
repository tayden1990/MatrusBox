# Matrus — AI-powered Leitner System

**Document purpose:** a detailed, developer-friendly architecture and implementation plan so you can build a modular, production-ready Leitner spaced-repetition app (web + mobile + Windows + Telegram bot & mini-app). Backend runs in Docker. Modern UI, professional, scalable.

---

## 1. High-level overview

Goal: a multilingual flashcard app based on the Leitner system where each user can study vocabulary/phrases. AI assists with scheduling adjustments, contextual sentence generation, pronunciation checks, and suggestions. Users can sign up via **email** or **Telegram** and use the system inside Telegram (bot + Telegram Web App / mini-app). App deployable as **web**, **Android**, **iOS**, and **Windows**.

Key design principles:
- **Modular architecture** (clear separation of concerns; microservices or modular monolith).
- **Single codebase / monorepo** for shared components (UI, libs, types).
- **Docker-first backend** with optional Kubernetes later.
- **API-first** design (well-versioned REST + WebSocket for realtime study sessions).
- **Extensible AI layer** abstracted behind interfaces to swap providers.

---

## 2. Recommended tech stack (opinionated)

- **Monorepo tool:** Turborepo or pnpm workspaces (Turborepo recommended for build speed).
- **Backend:** Node.js (>= 16) + TypeScript + NestJS (modular, DI, scalable) or Fastify + TypeScript. *Recommendation:* **NestJS**.
- **Database:** PostgreSQL (primary relational storage).
- **Cache & real-time pub/sub:** Redis.
- **Search / fuzzy matching:** Postgres full-text or ElasticSearch (optional later).
- **Queue & background jobs:** BullMQ (Redis-backed) or Bee-Queue.
- **Auth:** JWT (access + refresh), email verification, OAuth-like Telegram login & link.
- **Telegram Bot:** Telegraf (Node.js) + serverless webhook or persistent bot service.
- **Frontend (web):** Next.js + React + TypeScript.
- **Frontend (mobile):** React Native (Expo) + React Native Web for code sharing.
- **Desktop (Windows) wrapper:** Tauri or Electron. *Recommendation:* **Tauri** (smaller bundle) if using Rust is okay; otherwise Electron for maturity.
- **UI Library / Design system:** Tailwind CSS + Headless UI or Chakra UI. Use Tailwind for modern look and easy theming.
- **AI integration:** OpenAI (or any LLM provider) via an abstracted AI service module. Use streaming for real-time suggestions where needed.
- **Containerization & orchestration:** Docker + Docker Compose for local/dev; Kubernetes (EKS/GKE) for production (optional).
- **CI/CD:** GitHub Actions.
- **Monitoring & Errors:** Sentry + Prometheus + Grafana (optional).

---

## 3. Monorepo layout (suggested)

```
/matrus-monorepo
├─ apps/
│  ├─ web/              # Next.js website (also host Telegram Web App pages)
│  ├─ mobile/           # Expo (React Native) app
│  └─ desktop/          # Tauri/Electron wrapper or packaged web app
├─ packages/
│  ├─ api/              # shared API types / OpenAPI client
│  ├─ ui/               # shared React UI components & design tokens
│  ├─ db/               # database migrations & prisma or typeorm models
│  ├─ services/         # shared services (ai, auth client helpers)
│  ├─ common-types/     # TS types used across projects
│  └─ integrations/     # Telegram bot code, 3rd party connectors
├─ infra/
│  ├─ docker/           # docker-compose, Dockerfiles
│  └─ k8s/              # k8s manifests (optional)
└─ packages.json / turbo.json / pnpm-workspace.yaml
```

---

## 4. Backend modular structure (NestJS modules)

- **AuthModule**
  - Email/password signup
  - Email verification flow
  - Password reset
  - JWT access & refresh tokens
  - Telegram login linking (login widget & account linking)
- **UserModule**
  - Profiles, preferences, settings
- **CardModule**
  - Card model (front, back, metadata, tags, media links)
- **LeitnerModule**
  - Boxes (1..N), scheduling logic
  - StudySession entity (active session, progress)
- **AIServiceModule**
  - Abstraction layer for LLM calls (generate sentence, suggest synonyms, grade pronunciation)
- **TelegramBotModule**
  - Bot command handlers, webhook endpoint or polling service
- **WebsocketModule**
  - Real-time study sessions, live sync across devices
- **WorkerModule**
  - Background processors: scheduling jobs, email, analytics, AI batch tasks
- **AdminModule**
  - Management dashboards, logs, user support tools

### Database entities (simplified)

- **User**: id, email, telegramId, name, hashedPassword, locale, createdAt
- **Card**: id, userId, front, back, exampleSentences, media, tags, createdAt
- **LeitnerCard**: id, cardId, boxLevel, lastReviewedAt, nextReviewAt, easeFactor, interval
- **StudySession**: id, userId, startedAt, endedAt, cardsAttempted, accuracy
- **Feedback / PronunciationResult**: id, cardId, userId, score, audioURL

---

## 5. Authentication & Telegram linking

### Email flow
- POST `/auth/signup` -> send verification email with token
- POST `/auth/login` -> return access + refresh tokens
- POST `/auth/refresh` -> issue new access
- middleware to protect routes using JWT

### Telegram flow (two ways)
1. **Telegram Login Widget (web)**
   - User clicks "Login with Telegram" on web/mobile.
   - The widget returns user data signed by Telegram.
   - Backend verifies signature and either links to existing user or creates new user with `telegramId`.

2. **Telegram Bot linking**
   - Bot sends a one-time code to the user in chat.
   - In the web app, the user enters that code to link the Telegram account.
   - Alternatively use deep link with `tg://resolve?domain=YourBot&start=link_<token>`.

**Security:** when linking, verify ownership by sending a code to the Telegram account or via the widget signature.

---

## 6. Telegram Bot & Mini App

- **Bot responsibilities:** quick quizzes, push daily practice reminders, accept answers, provide short feedback, let user open a card in-app, export progress.
- **Web App (Telegram Mini App):** host a small responsive Next.js page configured for Telegram Web Apps; the bot can open it via `WebApp.open()`.
- **Bot architecture:** separate service (bot-service) that uses the same business logic via internal API to avoid duplication.
- **Webhooks vs Polling:** Webhooks recommended in production (requires HTTPS & reachable endpoint). Polling (long-poll) ok in development.

---

## 7. UI / Frontend architecture

- **Design system:** Tailwind + component library in `packages/ui`.
- **Pages:** Dashboard, Study session (card view + quick answer), Progress analytics, Card editor, Settings, Telegram linking.
- **Study UI:** large card front, flip with animation, input area for typed or spoken answer, show correctness + move card to proper box.
- **Real-time sync:** WebSocket to sync a session if user opens on multiple devices.
- **Accessibility:** keyboard navigation, screen-reader friendly, high contrast mode.

---

## 8. Cross-platform strategy

**Share UI logic & components** by using React (Next.js) + React Native + React Native Web.

- **Mobile:** Expo (managed workflow) — easiest for quick build & OTA updates.
  - `expo start` → builds for iOS/Android.
  - Use `eas build` to produce production binaries.
- **Web:** Next.js (hosted at CDN/Cloudflare/AWS).
- **Windows Desktop:** wrap the web build using **Tauri** or **Electron**.
  - Tauri uses the compiled web bundle and produces a small native binary.
  - Alternatively, package the React Native app with `Expo for web` + Capacitor.

Tradeoffs:
- React Native + Expo gives best code sharing but slightly more native setup.
- Flutter is an alternative (single codebase), but React stack is more re-usable with Next.js.

---

## 9. Docker + docker-compose (local dev)

### Suggested services
- `api` (NestJS)
- `worker` (background jobs)
- `bot` (telegram bot service)
- `postgres`
- `redis`
- `nginx` (reverse proxy + TLS in production)

### Example `docker-compose.yml` (simplified)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: matrus
      POSTGRES_USER: matrus
      POSTGRES_PASSWORD: matrus_pass
    volumes:
      - pgdata:/var/lib/postgresql/data
  redis:
    image: redis:7
    volumes:
      - redisdata:/data
  api:
    build: ./apps/api
    env_file: ./apps/api/.env.dev
    ports:
      - '4000:4000'
    depends_on:
      - postgres
      - redis
  worker:
    build: ./apps/worker
    env_file: ./apps/worker/.env.dev
    depends_on:
      - redis
      - postgres
  bot:
    build: ./apps/bot
    env_file: ./apps/bot/.env.dev
    depends_on:
      - api

volumes:
  pgdata:
  redisdata:
```

### Minimal `Dockerfile` for NestJS (apps/api/Dockerfile)

```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json .
COPY pnpm-lock.yaml .
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

---

## 10. CI/CD (GitHub Actions) — skeleton

- `ci.yml` for lint/test/build
- `deploy.yml` for building Docker image and pushing to registry and deployment

Key steps:
1. Run lint, unit tests
2. Build and push multi-arch Docker images
3. Run DB migrations stage -> prod
4. Deploy to target (DigitalOcean App Platform / AWS ECS / GCP Cloud Run / Heroku)

---

## 11. MVP feature list & roadmap

### MVP (4–8 weeks, small team)
- User register/login (email + Telegram linking)
- Basic card CRUD
- Basic Leitner scheduling (5 boxes, fixed intervals)
- Web app study flow
- Telegram bot: view today's cards + quick quiz
- Dockerized backend + local docker-compose
- Simple AI features: example sentence generation (on demand)

### v1 (after MVP)
- Pronunciation check (record & score)
- Smart scheduling using performance data and AI adjustments
- Mobile apps (Expo builds)
- Offline support for mobile
- Analytics & progress charts

### v2 (scale)
- Multi-user classrooms, sharing decks
- Advanced AI features (explain mistakes, personalized curriculum)
- Recommendation engine for new cards
- Kubernetes production deployment + autoscaling

---

## 12. Security & compliance

- Secure JWT storage: use httpOnly cookies for web or secure storage for mobile.
- Password hashing: bcrypt / argon2.
- Rate limit endpoints.
- Audit logs for sensitive actions.
- GDPR: data export & delete endpoints if you target EU users.
- Protect API keys and AI credentials via secrets manager (AWS Secrets Manager, Hashicorp Vault).

---

## 13. Monitoring, logging & analytics

- Errors: Sentry
- Metrics: Prometheus + Grafana or Datadog
- Request logs: centralized logging (ELK) or hosted alternative
- Usage analytics: track study time, retention, success rates (privacy-aware)

---

## 14. Developer workflow & best practices

- Use feature branches + PRs + codeowners
- Write unit tests for business logic (especially scheduling)
- Keep modules small and testable
- Use API contracts (OpenAPI) and generate clients for frontends
- Use storybook for UI components

---

## 15. Example API endpoints (REST)

**Auth**
- `POST /auth/signup` (email, password)
- `POST /auth/verify` (token)
- `POST /auth/login` (email, password)
- `POST /auth/telegram-login` (telegram payload)
- `POST /auth/refresh`

**Cards**
- `GET /cards` (list)
- `POST /cards` (create)
- `PUT /cards/:id` (update)
- `DELETE /cards/:id`

**Study**
- `GET /study/today` (cards due today)
- `POST /study/answer` ({cardId, answer, timeSpent, correctness})
- `POST /study/session/start`
- `POST /study/session/end`

**Admin**
- `GET /admin/users`

---

## 16. Sample DB schema snippet (Postgres + Prisma-like)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String?  @unique
  telegramId String? @unique
  password  String?
  createdAt DateTime @default(now())
}

model Card {
  id       String  @id @default(uuid())
  userId   String
  front    String
  back     String
  tags     String[]
  createdAt DateTime @default(now())
}

model LeitnerCard {
  id          String   @id @default(uuid())
  cardId      String   @unique
  boxLevel    Int
  lastReviewed DateTime
  nextReview  DateTime
}
```

---

## 17. Example implementation steps (concrete)

1. **Scaffold monorepo** using Turborepo + pnpm. Create `apps/api`, `apps/web`.
2. **Bootstrap NestJS** in `apps/api` with modules listed above.
3. **Add Postgres + Redis** services in `infra/docker-compose.yml` and ensure env config loaded.
4. **Implement Auth** (email + basic JWT) and basic User model.
5. **Implement Card CRUD** and simple Leitner algorithm on server.
6. **Implement Web UI** (Next.js) for register/login and study flow.
7. **Add Telegram Bot** using Telegraf and a `/due` command.
8. **Add AI module** with a single endpoint `POST /ai/generate-example`.
9. **Dockerize each app** and make `docker-compose up` launch everything.
10. **Set up CI** for lint/test/build and automated Docker image builds.

---

## 18. Maintenance & scaling tips

- Keep the AI module stateless; manage rate-limits and API costs.
- Retain historical user answers for training / analytics (opt-in).
- Archive old data to cheaper storage.

---

## 19. Appendices

### Useful libs & tools
- **NestJS** (backend)
- **Prisma** or TypeORM (ORM)
- **BullMQ** (workers)
- **Telegraf** (telegram bot)
- **Next.js** + React + Tailwind (web)
- **Expo / React Native** (mobile)
- **Tauri/Electron** (desktop)

---

If you want, I can:
- generate a **starter repo skeleton** (monorepo with basic auth, docker-compose, and one working study flow), or
- create **detailed Dockerfiles & GitHub Actions workflows**, or
- **design UI mockups** for the study screen and card editor,
- or produce an **ERD diagram** and OpenAPI spec for the API.

Tell me which one you'd like me to produce next and I'll generate it.

