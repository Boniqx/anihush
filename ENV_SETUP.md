# Anikama Environment Configuration Guide

## ✅ Supabase Configuration - COMPLETE

Both environment files have been configured with your Supabase credentials:

### Backend (`backend/.env`)

- ✅ Database URL: PostgreSQL connection to your Supabase instance
- ✅ Supabase URL: https://danvffrfketxsyobresy.supabase.co
- ✅ Service Role Key: Configured for admin operations
- ✅ JWT Secret: Configured for token validation

### Frontend (`frontend/.env.local`)

- ✅ Supabase URL: https://danvffrfketxsyobresy.supabase.co
- ✅ Publishable Key: Configured for client-side auth
- ✅ Backend API URL: Points to localhost:8080

## ⚠️ Still Needed

### Google Gemini API Key

You need to add your Google Gemini API key to both files:

**Get your key:**

1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Copy it

**Add to backend/.env:**

```bash
GEMINI_API_KEY=your_actual_key_here
```

**Add to frontend/.env.local (optional):**

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_key_here
```

## 🚀 Next Steps

1. **Get Gemini API Key** (required for AI chat to work)
2. **Run database migrations** in Supabase SQL Editor:
   - `supabase/migrations/20240101_init.sql`
   - `supabase/seeds/seed.sql`
3. **Install dependencies:**
   ```bash
   cd frontend && pnpm install
   cd ../backend && go mod download
   ```
4. **Start the servers:**

   ```bash
   # Terminal 1 - Backend
   cd backend && go run cmd/api/main.go

   # Terminal 2 - Frontend
   cd frontend && pnpm dev
   ```

## 📝 Summary

**Configured:**

- ✅ Database connection
- ✅ Supabase authentication
- ✅ JWT secrets
- ✅ API endpoints

**Still needed:**

- ⚠️ Gemini API key (required)
- ⚠️ Database migrations (run SQL files)
- ⚠️ Dependencies installation
