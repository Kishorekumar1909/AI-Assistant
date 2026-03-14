# 🤖 AI Chat — Full-Stack Application

Welcome to **AI Chat**! This is a production-ready, ChatGPT-style conversational application. It allows users to register, log in, create chat sessions, and interact with the powerful **Llama 3** language model via the Groq API.

All chat history is securely saved to a PostgreSQL database, so you can always come back and pick up where you left off. 

## ✨ Key Features

- **Email-based Authentication:** Secure JWT authentication (register with username/email/password, login with email/password). Tokens are stored safely and auto-refreshed in the background.
- **Persistent Chat Sessions:** Create, rename, delete, and view previous chat sessions.
- **Smart Conversations:** Integrates with Groq's blazingly fast inference API to power conversations using Meta's `Llama-3-70b` model.
- **Context-Aware:** The backend automatically sends your full chat history for that specific session to the AI, ensuring it remembers what you said earlier in the conversation.
- **Modern UI/UX:** A sleek dark-mode React frontend with a sidebar for chat history, Markdown and code-block rendering for AI responses, and auto-growing input fields.

## 🛠️ Tech Stack

- **Backend:** Django 5, Django REST Framework, SimpleJWT, PostgreSQL
- **Frontend:** React 18, Vite, React Router v6, Axios, Tailwind-like custom CSS
- **AI Integration:** Llama 3 (via Groq REST API)

---

## 🚀 How to Run Locally

Follow these step-by-step instructions to get the application running on your own machine.

### Prerequisites

1. **Python 3.11+** installed on your system.
2. **Node.js 20+** installed on your system.
3. **PostgreSQL** installed and running locally.
4. A free **Groq API Key**. Get one at: [console.groq.com](https://console.groq.com)

### Step 1: Clone or Open the Project
Open the project folder (`AI Chat`) in your preferred terminal or code editor (like VS Code).

### Step 2: Set up the PostgreSQL Database
Open your favorite visual database tool (like pgAdmin or DBeaver) or use the `psql` command line tool to create an empty database named `aichat`:
```sql
CREATE DATABASE aichat;
```

### Step 3: Setup the Backend (Django)

Open a terminal and navigate to the backend folder:
```bash
cd backend
```

**1. Create and activate a Python virtual environment:**
```bash
# Create the environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Activate it (Mac/Linux)
source venv/bin/activate
```
*(You should see `(venv)` appear in your terminal prompt)*

**2. Install Python dependencies:**
```bash
pip install -r requirements.txt
```

**3. Set up your environment variables:**
Create a copy of `.env.example` and name it `.env`:
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```
Open the new `.env` file in your editor and fill in your database password and Groq API key:
```env
DB_PASSWORD=your_postgres_password
GROQ_API_KEY=gsk_your_actual_api_key_here
```

**4. Run database migrations:**
This creates the necessary tables in your `aichat` PostgreSQL database.
```bash
python manage.py migrate
```

**5. Start the backend server:**
```bash
python manage.py runserver
```
✅ *The Django API is now running at `http://localhost:8000`*

---

### Step 4: Setup the Frontend (React)

Open a **new, separate terminal window** (leave the backend running!) and navigate to the frontend folder:
```bash
cd frontend
```

**1. Install Node modules:**
```bash
npm install
```

**2. Set up environment variables:**
Similarly, copy the example env file:
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```
*(For local development, you don't need to change anything in this frontend `.env` file. Vite automatically proxies `/api` calls to Django).*

**3. Start the frontend server:**
```bash
npm run dev
```
✅ *The React app is now running at `http://localhost:5173`*

---

### Step 5: Start Chatting! 🎉

1. Open your browser and go to: **[http://localhost:5173](http://localhost:5173)**
2. Click **"Create one"** to register a new account.
3. Once registered, log in with your email and password.
4. Say hello to Llama 3! 

---

## 🛡️ Security Notes
- Passwords are encrypted in the database using Django's secure hashing.
- User sessions are isolated; you cannot see other users' chats.
- JWT Refresh tokens are blacklisted immediately upon logout.
