# Anikama - Anime AI Companion Social Platform

<div align="center">

**High-Performance Anime AI Companion Platform**  
_Powered by Google Gemini AI_

![Shonen Jump Aesthetic](https://img.shields.io/badge/Style-Shonen%20Jump-FF9900?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Development-1A1A1A?style=for-the-badge)

</div>

## 🎯 Overview

Anikama is a mobile-first anime AI companion platform where users can interact with 10 iconic anime characters through AI-powered chat, view their stories, and build affinity relationships. Built with modern tech and a bouncy, energetic "Shonen Jump" aesthetic.

### Core Features

- 📱 **Mobile-First Design** - Responsive, energetic UI optimized for mobile
- 🤖 **AI Chat** - Powered by Google Gemini Pro with character-specific personalities
- 📖 **Stories** - Instagram-style story viewer with GSAP animations
- ⚡ **Affinity System** - XP and level progression (Nakama feature)
- 🎨 **Shonen Jump Aesthetic** - High-contrast black (#1A1A1A) & vibrant orange (#FF9900)

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **UI:** React 19, TypeScript, Tailwind CSS v4
- **Animation:** GSAP (GreenSock)
- **State:** Redux Toolkit
- **Icons:** Lucide React
- **Auth/DB:** Supabase

### Backend

- **Language:** Go 1.21+
- **Framework:** Gin Gonic
- **AI:** Google Gemini Pro (via AI Studio API)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth

## 📁 Project Structure

```
/anikama
  /frontend               # Next.js 14 Application
    /src
      /app               # App Router pages
      /components        # Shared UI components
      /features          # Feature modules (auth, chat, stories, etc.)
      /lib               # Supabase, Gemini, GSAP config
      /store             # Redux slices
      /types             # TypeScript definitions

  /backend               # Go API Server
    /cmd/api             # Main entry point
    /internal
      /domain           # Models and types
      /handlers         # HTTP handlers
      /router           # Route definitions
      /service          # Business logic
      /middleware       # Auth, CORS, etc.
    /pkg
      /gemini           # Gemini AI client
      /db               # Database connection

  /supabase             # Database & Migrations
    /migrations          # SQL migrations
    /seeds               # Seed data
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Go 1.21+
- Supabase account
- Google AI Studio API key

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd anikama

# Install frontend dependencies with pnpm
cd frontend
pnpm install

# Install backend dependencies
cd ../backend
go mod download
```

### 2. Environment Setup

**Frontend (`.env.local`):**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

**Backend (`.env`):**

```env
PORT=8080
DATABASE_URL=postgresql://user:password@localhost:5432/anikama
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
```

### 3. Database Setup

```bash
# Run migrations in your Supabase project
# Navigate to SQL Editor and run:
# 1. supabase/migrations/20240101_init.sql
# 2. supabase/seeds/seed.sql
```

### 4. Run Development Servers

**Backend:**

```bash
cd backend
go run cmd/api/main.go
# Server runs on http://localhost:8080
```

**Frontend:**

```bash
cd frontend
pnpm dev
# App runs on http://localhost:3000
```

## 🎮 API Endpoints

Base URL: `http://localhost:8080/api/v1`

| Method | Endpoint          | Description           | Auth Required |
| ------ | ----------------- | --------------------- | ------------- |
| POST   | `/auth/register`  | Register new user     | ❌            |
| GET    | `/companions`     | List all companions   | ❌            |
| GET    | `/companions/:id` | Get companion details | Optional      |
| GET    | `/stories`        | Get all stories       | ❌            |
| POST   | `/chat`           | Send AI chat message  | ✅            |
| POST   | `/interact`       | Update affinity (XP)  | ✅            |
| GET    | `/user/me`        | Get current user      | ✅            |

## 🤖 The 10 Companions

1. **Satoru Gojo** (Jujutsu Kaisen) - The Strongest
2. **Yor Forger** (Spy x Family) - Deadly Protector
3. **Katsuki Bakugo** (My Hero Academia) - The Rival
4. **Levi Ackerman** (Attack on Titan) - Stoic Leader
5. **Power** (Chainsaw Man) - Chaotic Fiend
6. **Makima** (Chainsaw Man) - Control Devil
7. **Loid Forger** (Spy x Family) - Master Spy
8. **Mikasa Ackerman** (Attack on Titan) - Loyal Warrior
9. **Zero Two** (Darling in the Franxx) - The Darling
10. **Frieren** (Frieren) - Timeless Mage

## 💎 Features

### Affinity System (Nakama)

- **View Story:** +5 XP
- **Send Message:** +1 XP
- **Level Formula:** `level = floor(xp / 100) + 1`

### Tier System

- **Free Tier:** Limited AI responses (256 tokens)
- **Premium Tier:** Full AI responses (1024 tokens)

### Authentication

- Username-based auth (converts to `{username}@anikama.app`)
- Powered by Supabase Auth
- Automatic profile creation via database trigger

## 🎨 Design System

### Colors

```css
--anikama-black: #1a1a1a --anikama-orange: #ff9900
  --anikama-orange-light: #ffad33 --anikama-orange-dark: #cc7a00;
```

### Animations

- Bouncy card entrances (`back.out(1.7)`)
- Story slide transitions
- Energetic page loads
- GSAP-powered smoothness

## 📝 Development Notes

### Backend

- Clean architecture with dependency injection
- Tier-based Gemini response limiting
- PostgreSQL with Row-Level Security (RLS)
- CORS configured for local development

### Frontend

- Server Components by default (React 19)
- Client components for interactivity
- Redux for global state
- GSAP for all animations

## 🔒 Security

- JWT-based authentication via Supabase
- Row-Level Security on all tables
- Environment variables for secrets
- CORS protection
- Input validation with Gin binding

## 📚 Next Steps

- [ ] Build auth UI (login/register forms)
- [ ] Create companion list view
- [ ] Implement story viewer with GSAP
- [ ] Build chat interface
- [ ] Add affinity display components
- [ ] Implement tier-based restrictions
- [ ] Mobile optimization
- [ ] Production deployment

## 🤝 Contributing

This project follows Go backend standards and React 19 Server Component best practices. See `.agent/skills` for detailed guidelines.

## 📄 License

MIT License - see LICENSE file for details

---

<div align="center">

**Built with ❤️ and Shonen Jump Energy**  
_Powered by Google Gemini AI_

</div>
# anihush
