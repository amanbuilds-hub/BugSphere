# BugSphere AI 🛡️
**Production-Ready AI-Powered Bug Tracking System (MERN)**

BugSphere AI is a robust, production-grade bug tracker built with the MERN stack. It features an AI-driven classification engine, duplicate detection, and automated developer assignment recommendations using OpenRouter (google/gemma-3-1b-it:free).

---

## 🌟 Key Features
- **AI Core (OpenRouter)**: Automated bug classification, technical summarization, duplicate detection, and AI resolution suggestions.
- **State Machine Enforcement**: Strict bug lifecycle management (`open` -> `in-progress` -> `qa` -> `closed`) with role-based transition guards.
- **Multi-Channel Notifications**: Real-time Socket.io alerts, AI-generated email reports, and Web Push notifications.
- **Security First**: JWT-based auth with refresh token rotation, 2FA (TOTP) via Google Authenticator, Rate Limiting, and XSS/NoSQLi protection.
- **PWA Ready**: Offline capabilities, manifest support, and service worker integration.
- **Premium UI**: Glassmorphism design, dark mode support, and interactive analytics with Recharts.

## 🚀 Quick Start (Local)

### 1. Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- OpenRouter API Key

### 2. Setup Monorepo
```bash
# Install root dependencies
npm install

# Install all sub-project dependencies
npm run install:all
```

### 3. Environment Variables
Create `.env` files in both folders:

**`server/.env`**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bugsphere
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_key_here
SMTP_HOST=smtp.mailtrap.io
SMTP_USER=user
SMTP_PASS=pass
NODE_ENV=development
```

**`client/.env`**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Running the App
```bash
# Populate demo data (Users, Projects, Bugs)
npm run seed

# Run everything (Server + Client concurrently)
npm run dev
```

---

## 🐳 Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

---

## 🧪 Testing
```bash
# Run all tests (Server + Client)
npm run test
```

## 🏗️ Technical Architecture
- **Frontend**: React 18, Recoil (State), React Query (Server State), Tailwind CSS, Recharts.
- **Backend**: Node.js, Express, Mongoose, Socket.io, Winston (Logging).
- **Security**: Helmet, CORS, Express-Rate-Limit, Zod (Validation), Otplib (2FA).
- **AI**: Routed via `server/services/openrouter.js` using strictly `google/gemma-3-1b-it:free`.

---

Created with ❤️ by Antigravity AI
