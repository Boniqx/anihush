# 🚀 Quick Start - Anikama

All environment variables are configured! Follow these steps to run Anikama:

## ✅ Prerequisites Complete

- [x] Go 1.25.7 installed
- [x] pnpm dependencies installed
- [x] Supabase credentials configured
- [x] Gemini API key configured

## ⚠️ Database Setup Required

Before starting the servers, run these SQL files in your Supabase SQL Editor:

1. Go to: https://supabase.com/dashboard/project/danvffrfketxsyobresy/sql
2. Copy and run [`migrations/20240101_init.sql`](file:///Users/boniqx/nectar/anikama/supabase/migrations/20240101_init.sql)
3. Copy and run [`seeds/seed.sql`](file:///Users/boniqx/nectar/anikama/supabase/seeds/seed.sql)

## 🖥️ Start the Servers

**Terminal 1 - Backend:**

```bash
cd backend
go run cmd/api/main.go
# Should show: Server running on :8080
```

**Terminal 2 - Frontend:**

```bash
cd frontend
pnpm dev
# Should show: Ready on http://localhost:3000
```

## 🎯 Access the App

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **Health Check:** http://localhost:8080/health

## 📋 Test the Flow

1. Go to http://localhost:3000/login
2. Register a new account (username + password)
3. Browse companions at http://localhost:3000/companions
4. Click a companion to chat with them
5. Stories will appear at the top of the companions page

## 🐛 Troubleshooting

**Backend won't start?**

- Check that port 8080 is not in use
- Verify database migrations were run
- Check backend logs for connection errors

**Frontend won't start?**

- Check that port 3000 is not in use
- Run `pnpm install` again if needed
- Clear `.next` folder: `rm -rf .next`

**Can't login?**

- Verify migrations created the `profiles` table
- Check browser console for errors
- Verify Supabase URL and anon key are correct

**Chat not working?**

- Verify Gemini API key is valid
- Check backend logs for API errors
- Ensure backend server is running
