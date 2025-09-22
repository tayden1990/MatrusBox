# Matrus - AI-powered Leitner System

An intelligent spaced repetition learning app built with TypeScript, supporting web, mobile, desktop, and Telegram bot interfaces.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- Docker & Docker Compose

### Development Setup

1. **Clone and install dependencies:**
```bash
pnpm install
```

2. **Start infrastructure:**
```bash
pnpm docker:up
```

3. **Run database migrations:**
```bash
cd apps/api && pnpm db:migrate
```

4. **Start development servers:**
```bash
pnpm dev
```

## 📁 Project Structure

```
matrus-monorepo/
├── apps/
│   ├── api/           # NestJS backend API
│   ├── web/           # Next.js web application
│   ├── mobile/        # React Native (Expo) app
│   └── bot/           # Telegram bot service
├── packages/
│   ├── api-types/     # Shared API types
│   ├── ui/            # Shared UI components
│   ├── db/            # Database models & migrations
│   └── common-types/  # Common TypeScript types
└── infra/
    └── docker/        # Docker configurations
```

## 🔧 Development Commands

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all applications
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all packages
- `pnpm docker:up` - Start Docker services
- `pnpm docker:down` - Stop Docker services

## 🧭 Web app (Next.js) quickstart

To work on just the web UI without starting the whole monorepo:

```powershell
pnpm --filter @matrus/web dev
```

Build the web app only:

```powershell
pnpm --filter @matrus/web build
```

Run lint and type-check for the web app only:

```powershell
pnpm --filter @matrus/web lint
pnpm --filter @matrus/web type-check
```

When the API is already running (Docker or another terminal) the web UI will use `http://localhost:4000` via Next.js API routes that proxy requests and forward Authorization headers.

## 🛠️ Troubleshooting

- Port already in use (EADDRINUSE) on 4000
    - Cause: Another API instance is already running (Docker Compose, a previous terminal, or an orphaned process).
    - Fix options:
        - Stop Docker API: `pnpm docker:down`
        - Or stop the local API process that’s listening on 4000
        - Or run only the web app (no API) using: `pnpm --filter @matrus/web dev`
        - On Windows, check which process uses the port:
            ```powershell
            netstat -ano | findstr :4000
            taskkill /PID <pid> /F
            ```

- 401 Unauthorized from proxy routes
    - Ensure your browser has tokens stored after login (localStorage/sessionStorage).
    - The Next.js API routes forward Authorization headers; verify requests show the header in the client debug console.
    - Use the debug toggle (?debug=1) to open the floating console and confirm the Auth snapshot.

- Study flow returns no cards
    - The demo endpoints may return an empty queue. Try starting a new session from the Study page and check debug logs.
    - The "End Session" button returns mocked stats in demo mode.

## 🌟 Features

- **Multi-platform**: Web, mobile (iOS/Android), desktop, and Telegram
- **AI-powered**: Smart scheduling and contextual learning assistance
- **Leitner System**: Scientifically-proven spaced repetition algorithm
- **Real-time sync**: Study progress synced across all devices
- **Telegram integration**: Bot commands and mini-app support

## 🏗️ Architecture

Built with a modular monorepo architecture:
- **Backend**: NestJS + PostgreSQL + Redis
- **Frontend**: Next.js + React + Tailwind CSS
- **Mobile**: React Native with Expo
- **Bot**: Telegraf (Node.js)
- **AI**: Pluggable LLM integration (OpenAI/others)

## 📱 Platform Support

- ✅ Web (Next.js)
- ✅ Android (React Native)
- ✅ iOS (React Native)
- ✅ Telegram Bot + Mini App
- 🚧 Windows Desktop (Tauri)

## 🔐 Authentication

- Email/password registration
- Telegram login widget integration
- JWT-based authentication
- Account linking between platforms

## 📊 Study Features

- Adaptive Leitner box system
- AI-generated example sentences
- Progress tracking and analytics
- Offline support (mobile)
- Multi-language support

## 🤖 AI Capabilities

- Context-aware example generation
- Pronunciation scoring
- Smart scheduling adjustments
- Personalized learning recommendations

## 📞 Support

For questions or issues, please check our documentation or create an issue.

---

Built with ❤️ for effective language learning