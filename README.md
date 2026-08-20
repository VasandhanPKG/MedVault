# 🏥 MedVault — AI-Powered Personal Health Record (PHR) Platform

[![CI Pipeline](https://github.com/VasandhanPKG/MedVault/actions/workflows/ci.yml/badge.svg)](https://github.com/VasandhanPKG/MedVault/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**MedVault** is an AI-powered Personal Health Record (PHR) system engineered to help patients securely store, manage, and understand their medical documents. With automated document OCR, clinical AI assistant grounding, longitudinal vital analytics, and instant emergency QR access for first responders, MedVault bridges the gap between complex clinical records and actionable patient understanding.

---

## 🌟 Key Features

- 📑 **Automated Medical Document OCR**: Upload lab reports, scans, and prescriptions (PDF, PNG, JPG). MedVault extracts key biomarkers (e.g. HbA1c, fasting glucose, lipid profiles) and reference intervals automatically.
- 🤖 **Clinical AI Health Assistant**: Ask questions in natural language and receive answers grounded directly in your uploaded health documents.
- 📊 **Health Analytics & Vital Tracking**: Record and monitor blood pressure, resting heart rate, blood glucose, and body weight with interactive trajectory charts.
- 🚨 **Emergency QR & First Responder Access**: Generate time-limited, encrypted QR access tokens so emergency paramedics can access critical allergies, blood group, and emergency contacts without exposing full records.
- 🔒 **Secure Patient Profiles & Isolation**: Per-user data isolation, password hashing with BCrypt, and secure JWT-based API authentication.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 19 + Vite Frontend                        │
│             (Dashboard, Upload, Records, Assistant, Analytics)          │
│                            http://localhost:5173                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API & JSON / FormData
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Node.js + Express + TypeScript Backend               │
│                            http://localhost:5000                       │
├───────────────────┬───────────────────┬────────────────────────────────┤
│   Auth & JWT      │  Medical Records  │  OCR & Parser Engine           │
│   (/api/auth)     │  (/api/records)   │  (Tesseract.js & pdf-parse)    │
├───────────────────┼───────────────────┼────────────────────────────────┤
│  Patient Profile  │ Health Analytics  │  Clinical AI & Risk Engine     │
│  (/api/patient)   │ (/api/analytics)  │  (Google Gemini / RAG)         │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 📁 Repository Structure

```tree
MedVault/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow (Node.js 22)
├── backend/                     # Express & TypeScript Backend API
│   ├── src/
│   │   ├── controllers/         # Route controllers (Auth, Records, AI, Emergency, etc.)
│   │   ├── middleware/          # JWT authentication middleware
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # OCR, Gemini AI, Database services
│   │   └── server.ts            # Main application entrypoint
│   ├── data/                    # Local database store
│   ├── uploads/                 # Uploaded medical documents
│   ├── package.json
│   └── tsconfig.json
├── frontend/                    # React 19 + Vite Frontend Application
│   ├── src/
│   │   ├── components/          # Reusable UI components & dialogs
│   │   ├── pages/               # Application view pages
│   │   ├── lib/                 # API client and helper functions
│   │   └── App.tsx              # React router root
│   ├── public/                  # Static assets & SVG favicon
│   ├── package.json
│   └── vite.config.ts
├── API_DOCUMENTATION.md         # Full REST API endpoint reference
├── DATABASE_SCHEMA.md           # Database tables, ER diagram & PostgreSQL DDL
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` ([Download Node.js](https://nodejs.org/))
- **npm**: `v10.x+` (comes bundled with Node.js)

---

### 1. Start the Backend API

```bash
cd backend
npm install
npm run dev
```

- **Backend URL**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/health`

---

### 2. Start the Frontend Application

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev
```

- **Frontend App**: `http://localhost:5173`

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_2026
CLIENT_ORIGIN=http://localhost:5173,http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📚 Detailed Documentation

- 📖 **[API Documentation (`API_DOCUMENTATION.md`)](API_DOCUMENTATION.md)**: Detailed JSON schemas and request/response specifications for all REST endpoints.
- 🗄️ **[Database Architecture & Schema (`DATABASE_SCHEMA.md`)](DATABASE_SCHEMA.md)**: Entity-Relationship diagram, field constraints, and PostgreSQL DDL scripts.

---

## 🛡️ Security & Privacy

- **Data Privacy**: Medical records and health metrics are isolated on a per-user basis.
- **Stateless Tokens**: Secure JWT authentication tokens with 7-day expiration.
- **Emergency Protection**: 24-hour expiring emergency tokens restrict access to only critical triage data (Allergies, Blood Group, Contact).

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
