# 🖊️ Inkwell AI — Full-Stack AI Blog Writer

A production-ready AI blog writing application built with **React.js**, **Node.js + Express**, **MongoDB**, and the **Hugging Face Inference API**.

---

## 📁 Project Structure

```
ai-blog-writer/
├── package.json                  ← Root: run both servers with one command
│
├── backend/
│   ├── server.js                 ← Express app entry point
│   ├── .env                      ← Your secrets (API keys, DB URI)
│   ├── .env.example              ← Template for .env
│   ├── package.json
│   ├── config/
│   │   └── db.js                 ← MongoDB connection
│   ├── middleware/
│   │   └── auth.js               ← JWT protect / optionalAuth middleware
│   ├── models/
│   │   ├── Blog.js               ← Mongoose Blog schema
│   │   └── User.js               ← Mongoose User schema (with bcrypt)
│   └── routes/
│       ├── blogs.js              ← /generate, /humanize, /save, GET, DELETE
│       └── auth.js               ← /register, /login, /me, /logout
│
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env                      ← REACT_APP_API_URL
    └── src/
        ├── index.js              ← React entry point
        ├── index.css             ← Tailwind + global styles
        ├── App.js                ← Router + providers
        ├── utils/
        │   └── api.js            ← Axios instance with JWT interceptor
        ├── context/
        │   ├── AuthContext.js    ← Global auth state (login/register/logout)
        │   └── ThemeContext.js   ← Dark mode toggle
        ├── hooks/
        │   └── useBlog.js        ← All blog API calls in one hook
        ├── components/
        │   ├── Navbar.js         ← Sticky nav with dark mode + auth controls
        │   ├── BlogForm.js       ← Topic, tone, word count, SEO keyword input
        │   ├── BlogOutput.js     ← Formatted blog display + action buttons
        │   └── BlogCard.js       ← History card (expand, copy, favorite, delete)
        └── pages/
            ├── Home.js           ← Landing page with features + how-it-works
            ├── Generator.js      ← Main generation page (form + output)
            ├── History.js        ← Saved blogs (search, filter, paginate)
            ├── Login.js          ← JWT login form
            └── Register.js       ← Registration with password strength meter
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 AI Blog Generation | Uses Hugging Face `Mistral-7B-Instruct` to write full blogs |
| ✨ Humanize / Rewrite | One-click rewrite to sound more natural |
| 💾 Save Blogs | Persist to MongoDB; view full history |
| 🔍 SEO Keywords | Inject up to 5 keywords into the prompt |
| 🎨 5 Writing Tones | Professional, Casual, Academic, Creative, Persuasive |
| 📋 Copy to Clipboard | One-click copy with visual confirmation |
| 🌙 Dark Mode | System-preference aware; toggleable; persisted to localStorage |
| 🔐 JWT Auth (Bonus) | Register/login; blogs tied to user accounts |
| ❤️ Favorites | Star blogs you love |
| 🔎 Search & Filter | Search by topic/content; filter by tone; favorites-only view |
| 📄 Pagination | 12 blogs per page with prev/next navigation |
| 🚦 Rate Limiting | 100 req/15min global; 5 AI generations/min |

---

## 🚀 Setup Guide (Step by Step)

### Prerequisites

Make sure you have these installed:
- **Node.js** v18 or higher → [nodejs.org](https://nodejs.org)
- **MongoDB** (local) → [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
  - OR a free **MongoDB Atlas** cloud cluster → [cloud.mongodb.com](https://cloud.mongodb.com)
- **npm** v8 or higher (comes with Node.js)

---

### Step 1 — Clone / Download the Project

```bash
# If you have git:
git clone https://github.com/yourname/ai-blog-writer.git
cd ai-blog-writer

# Or just unzip the downloaded folder and cd into it
cd ai-blog-writer
```

---

### Step 2 — Get Your Hugging Face API Key (FREE)

1. Go to [huggingface.co/join](https://huggingface.co/join) and create a free account
2. Go to **Settings → Access Tokens** → [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. Click **"New token"**, name it `inkwell-ai`, role = **Read**
4. Copy the token — it looks like `hf_xxxxxxxxxxxxxxxxxxxxxxxx`

---

### Step 3 — Configure Environment Variables

Open `backend/.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development

# Local MongoDB (default):
MONGODB_URI=mongodb://localhost:27017/ai-blog-writer

# OR MongoDB Atlas (replace with your connection string):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-blog-writer

# Paste your Hugging Face API key here:
HF_API_KEY=hf_your_actual_key_here

# Keep this secret in production (change to a long random string):
JWT_SECRET=inkwell_ai_jwt_secret_change_me_in_production_xK9mP2qL

CORS_ORIGIN=http://localhost:3000
```

> ⚠️ **Never commit `.env` to git.** It's already in `.gitignore`.

---

### Step 4 — Install All Dependencies

From the **root folder** (`ai-blog-writer/`):

```bash
npm run install:all
```

This installs dependencies for the root, backend, and frontend in one command.

Or install manually:
```bash
# Root
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

### Step 5 — Start MongoDB

**If using local MongoDB:**
```bash
# macOS/Linux:
mongod --dbpath /usr/local/var/mongodb

# Windows (run as Administrator):
mongod

# Or if installed as a service, it's already running
```

**If using MongoDB Atlas** — no action needed, just make sure your `MONGODB_URI` in `.env` is correct.

---

### Step 6 — Run the Application

From the **root folder**, run both servers at once:

```bash
npm run dev
```

This starts:
- 🟡 **Backend** on `http://localhost:5000`
- 🔵 **Frontend** on `http://localhost:3000`

Or run them separately:
```bash
# Terminal 1 — Backend
npm run server

# Terminal 2 — Frontend
npm run client
```

---

### Step 7 — Open the App

Navigate to **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/blogs/generate` | Optional | Generate a blog using AI |
| `POST` | `/api/blogs/humanize` | Optional | Rewrite blog in human tone |
| `POST` | `/api/blogs/save` | Optional | Save blog to MongoDB |
| `GET` | `/api/blogs` | Optional | Fetch saved blogs (paginated) |
| `GET` | `/api/blogs/:id` | Optional | Get single blog |
| `PATCH` | `/api/blogs/:id/favorite` | Required | Toggle favorite |
| `DELETE` | `/api/blogs/:id` | Required | Delete blog |
| `POST` | `/api/auth/register` | None | Create account |
| `POST` | `/api/auth/login` | None | Login, returns JWT |
| `GET` | `/api/auth/me` | Required | Get current user |
| `GET` | `/health` | None | Server health check |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 (hooks, context, router)
- Tailwind CSS 3 (custom design system)
- Axios (HTTP client with interceptors)
- React Router v6
- React Hot Toast (notifications)
- Lucide React (icons)

**Backend**
- Node.js + Express 4
- Mongoose (MongoDB ODM)
- JWT (jsonwebtoken) for auth
- bcryptjs for password hashing
- express-validator for input validation
- express-rate-limit for API protection
- node-fetch for Hugging Face calls

**Database**
- MongoDB (local or Atlas)
- Two collections: `blogs`, `users`

**AI**
- Hugging Face Inference API
- Model: `mistralai/Mistral-7B-Instruct-v0.1`
- Fallback-compatible with GPT-2, GPT-Neo, etc.

---

## 🔄 Changing the AI Model

In `backend/routes/blogs.js`, find this line and swap the model name:

```js
const MODEL = 'mistralai/Mistral-7B-Instruct-v0.1';

// Other good free options:
// 'gpt2'
// 'EleutherAI/gpt-neo-1.3B'
// 'tiiuae/falcon-7b-instruct'
// 'HuggingFaceH4/zephyr-7b-beta'
```

> Larger models = better quality, but slower cold starts.

---

## 🚢 Deployment

**Backend → Railway / Render / Fly.io**
1. Push `backend/` to a GitHub repo
2. Connect to Railway or Render
3. Set environment variables in the dashboard
4. Deploy — it auto-detects Node.js

**Frontend → Vercel / Netlify**
1. Push `frontend/` to a GitHub repo
2. Connect to Vercel; set build command: `npm run build`, output dir: `build`
3. Set `REACT_APP_API_URL` to your deployed backend URL
4. Deploy

---

## 🐛 Troubleshooting

| Problem | Fix |
|---|---|
| `HF_API_KEY not configured` | Add your key to `backend/.env` |
| `Model is loading (503)` | Wait 30 seconds; first call wakes the model |
| `MongoDB connection failed` | Make sure `mongod` is running locally, or check Atlas URI |
| `CORS error` | Confirm `CORS_ORIGIN=http://localhost:3000` in `.env` |
| `Port 5000 in use` | Change `PORT=5001` in `.env` and update frontend `.env` |
| Blank page on frontend | Check browser console; run `npm run build` to see errors |

---

## 📜 License

MIT — free to use, modify, and deploy for personal or commercial projects.

---

*Built as a full-stack portfolio project demonstrating React, Node.js, MongoDB, JWT auth, and AI API integration.*
