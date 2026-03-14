# 🤖 AI Chat — Full-Stack Application

A production-ready ChatGPT-style AI chat application powered by **Llama 3 via Groq API**.

**Stack**: Django · PostgreSQL · React (Vite) · JWT · Groq/Llama3

---

## Project Structure

```
AI Chat/
├── backend/    ← Django REST API
└── frontend/   ← React (Vite) SPA
```

---

## 🚀 Local Development Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- A Groq API key → [console.groq.com](https://console.groq.com)

---

### 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env       # Windows
cp .env.example .env         # Mac/Linux
```

Edit `.env` and fill in your values:
```
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
DB_NAME=aichat
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
GROQ_API_KEY=gsk_...
```

```bash
# Create PostgreSQL database
# Connect via psql or pgAdmin and run:
# CREATE DATABASE aichat;

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env      # Windows
cp .env.example .env        # Mac/Linux
# VITE_API_BASE_URL= (leave blank for dev proxy)

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

> The Vite dev server proxies all `/api` requests to `http://localhost:8000` automatically.

---

## 🌐 Production Deployment

### Backend on Railway / Render

1. Push `backend/` to a Git repository
2. Create a new service on [Railway](https://railway.app) or [Render](https://render.com)
3. Set **build command**: `pip install -r requirements.txt`
4. Set **start command**: `gunicorn config.wsgi:application --workers 4 --timeout 120`
5. Add a **PostgreSQL** plugin/database
6. Set your environment variables:
   ```
   SECRET_KEY=...
   DEBUG=False
   ALLOWED_HOSTS=your-backend-domain.railway.app
   DATABASE_URL=postgresql://...  (auto-provided by Railway)
   GROQ_API_KEY=gsk_...
   CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
7. Run migrations via the Railway shell: `python manage.py migrate`

> **Tip (Railway)**: Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` individually from the PostgreSQL plugin variables, or use `DATABASE_URL` with dj-database-url.

---

### Frontend on Vercel / Netlify

1. Push `frontend/` to a Git repository
2. Import on [Vercel](https://vercel.com) — it auto-detects Vite
3. Set environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend-domain.railway.app
   ```
4. Deploy — no build configuration needed

---

### Database Options

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| [Railway](https://railway.app) | ✅ | Easy DB plugin for your backend |
| [Supabase](https://supabase.com) | ✅ | Managed Postgres, free 500MB |
| [Neon](https://neon.tech) | ✅ | Serverless Postgres, generous free tier |

---

## 🔑 Environment Variables Reference

### Backend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | ✅ | Django secret key |
| `DEBUG` | ✅ | `True` for dev, `False` for prod |
| `ALLOWED_HOSTS` | ✅ | Comma-separated allowed hosts |
| `DB_NAME` | ✅ | PostgreSQL database name |
| `DB_USER` | ✅ | PostgreSQL username |
| `DB_PASSWORD` | ✅ | PostgreSQL password |
| `DB_HOST` | ✅ | PostgreSQL host |
| `DB_PORT` | ✅ | PostgreSQL port (default: 5432) |
| `GROQ_API_KEY` | ✅ | Groq API key from console.groq.com |
| `GROQ_MODEL` | ❌ | Model name (default: `llama3-70b-8192`) |
| `GROQ_MAX_TOKENS` | ❌ | Max response tokens (default: `1024`) |
| `CORS_ALLOWED_ORIGINS` | ✅ | Frontend URL(s), comma-separated |
| `JWT_ACCESS_LIFETIME_MINUTES` | ❌ | Access token lifetime (default: `60`) |
| `JWT_REFRESH_LIFETIME_DAYS` | ❌ | Refresh token lifetime (default: `7`) |

### Frontend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | ✅ (prod) | Backend URL. Leave blank in dev (uses Vite proxy) |

---

## 🛡️ Security Features

- Passwords hashed with Django's PBKDF2 + Argon2
- JWT refresh tokens blacklisted on logout
- CORS restricted to configured origins only
- API rate limiting (20 req/min anon, 60 req/min user)
- Input validation via DRF serializers
- Owner-scoped queries (users can only see their own chats)
- Gunicorn with multiple workers in production

---

## 📡 API Reference

```
POST   /api/auth/register/          Register + return tokens
POST   /api/auth/login/             Login + return tokens
POST   /api/auth/logout/            Blacklist refresh token
POST   /api/auth/token/refresh/     Refresh access token
GET    /api/auth/profile/           Get current user

GET    /api/chats/                  List all sessions
POST   /api/chats/                  Create new session
GET    /api/chats/<id>/             Get session + messages
DELETE /api/chats/<id>/             Delete session
PATCH  /api/chats/<id>/rename/      Rename session
GET    /api/chats/<id>/messages/    Paginated messages
POST   /api/chats/<id>/send/        Send message → Groq → save
```
