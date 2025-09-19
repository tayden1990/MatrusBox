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