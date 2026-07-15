# 🧠 MindVault AI — Student Operating System

AI-Powered Student Operating System
Organize academics, manage assignments, track attendance, plan your timetable, take smart notes, and learn with an integrated AI assistant — all in one platform.
Student Operating System built with **React**, **TypeScript**, **Express**, **PostgreSQL**, **Prisma ORM**, **JWT Authentication**, and **Groq LPU AI**.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Groq](https://img.shields.io/badge/Groq_AI-F05032?style=flat-square&logo=git&logoColor=white)](https://console.groq.com)

---

## ✨ Features

- 🤖 **AI Study Tools**: High-speed AI assistance for concept explanation, note summarization, interactive flashcards, practice quiz generation, personalized study planning, and code debugging powered by **Groq LLaMA 3.3-70B**.
- 📊 **Dynamic Dashboard**: Personalized overview displaying attendance averages, pending assignments, productivity trends, and schedule summaries without hardcoded fake metrics.
- 📅 **Timetable & Class Schedule**: Interactive weekly timetable manager for tracking recurring lectures, labs, and classroom details.
- 📈 **Attendance Tracker**: Class presence management with real-time target indicators and safety miss calculators.
- 📋 **Assignment & Note Manager**: Priority-based assignment tracking and rich Markdown note-taking.
- 🔐 **Secure Authentication**: JWT-backed auth with password hashing and user data isolation.
- 🌙 **Modern Design System**: Dynamic dark mode support with glassmorphism, responsive navigation, and smooth UI animations.

---

## 🛠️ Tech Stack

### Client (Frontend)
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS & Custom CSS Utilities
- **Icons**: Lucide React
- **Charts**: Recharts

### Server (Backend)
- **Runtime**: Node.js & Express
- **ORM**: Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT) & Bcrypt
- **AI Engine**: Groq SDK (`llama-3.3-70b-versatile`)

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) database instance
- [Groq API Key](https://console.groq.com) (Free tier available)

---

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/swarangisavekar07-cmd/MindVault-AI.git
cd MindVault-AI

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

---

### 2. Configure Environment Variables

Create `.env` files for both backend and root based on the provided `.env.example`:

**Backend Configuration (`server/.env`):**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/MindVaultAI"
JWT_SECRET="your_secure_jwt_secret_key"
PORT=3001
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
```

---

### 3. Initialize Database (Prisma)

```bash
cd server
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

---

### 4. Run the Development Application

In two separate terminal tabs:

**Terminal 1 — Start Backend Server:**
```bash
cd server
npm run dev
```

**Terminal 2 — Start Frontend Application:**
```bash
npm run dev
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

---

## 📁 Repository Structure

```text
MindVault-AI/
├── .env.example              # Root environment template
├── .gitignore                 # Production-ready git ignore rules
├── package.json              # Root/Frontend dependencies
├── index.html                # App entry HTML
├── src/                      # Frontend Application Code
│   ├── app/
│   │   ├── components/       # UI Pages, Modals & Components
│   │   ├── services/         # API Service Adapters (AI & Auth)
│   │   └── App.tsx           # Primary Layout & State Router
│   └── main.tsx              # React DOM mounting
└── server/                   # Express & AI Backend Engine
    ├── .env.example          # Server environment template
    ├── prisma/               # Schema & DB Migrations
    └── src/
        ├── ai/               # Groq AI Provider Abstraction
        ├── middleware/       # JWT Auth Middleware
        ├── routes/           # REST API Routes (/api/ai, /api/auth)
        └── index.ts          # Express Server Initialization
```

---

## 🛡️ License & Contributing

Distributed under the MIT License. Contributions and feature suggestions are welcome!

Made with ❤️ for students worldwide.
