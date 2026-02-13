# Anikama - Quick Start Guide

## 🚀 Setup Instructions

### 1. Get Your API Keys

#### Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **Settings** → **API**
3. Copy your:
   - Project URL (looks like `https://xxxxx.supabase.co`)
   - Anon/Public key (starts with `eyJ...`)
4. Navigate to **Settings** → **Database**
5. Copy your Connection String (Direct connection)

#### Google Gemini AI Setup

1. Go to [ai.google.dev](https://ai.google.dev)
2. Click **Get API Key** → **Create API key**
3. Copy your API key

### 2. Configure Environment Variables

**Frontend** (`/frontend/.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

**Backend** (`/backend/.env`):

```env
PORT=8080
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
GEMINI_API_KEY=your-gemini-api-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key
JWT_SECRET=generate-a-random-32-char-string
```

### 3. Set Up Database

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the migration:
   ```sql
   -- Copy and paste contents from supabase/migrations/20240101_init.sql
   ```
4. Run the seed data:
   ```sql
   -- Copy and paste contents from supabase/seeds/seed.sql
   ```

### 4. Install Dependencies

**Frontend:**

```bash
cd frontend
pnpm install
```

**Backend:**

```bash
cd backend
go mod download
```

### 5. Run the Application

**Backend (Terminal 1):**

```bash
cd backend
go run cmd/api/main.go
```

**Frontend (Terminal 2):**

```bash
cd frontend
pnpm dev
```

### 6. Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Health check: http://localhost:8080/health

## 🎮 API Testing

Test the backend is working:

```bash
# Health check
curl http://localhost:8080/health

# Get all companions
curl http://localhost:8080/api/v1/companions

# Get stories
curl http://localhost:8080/api/v1/stories
```

## 🐛 Troubleshooting

**Database connection fails:**

- Check your DATABASE_URL is correct
- Ensure you've run the migrations in Supabase

**Frontend can't connect to backend:**

- Verify backend is running on port 8080
- Check NEXT_PUBLIC_API_URL in frontend/.env.local

**Gemini API errors:**

- Verify your API key is valid
- Check you haven't exceeded free tier limits

## 📚 Next Steps

1. Try registering a user through Supabase
2. Test chat with Satoru Gojo
3. View companion stories
4. Build out the UI components

---

**Need help?** Check the main README.md for full documentation.
