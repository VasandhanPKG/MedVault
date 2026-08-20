# MedVault — Enterprise AI-Powered Personal Health Record Platform

**MedVault** is a polyglot microservice platform designed for high-security, HIPAA-compliant electronic health record management, clinical AI decision support, predictive biomarker analytics, patient consent management, emergency break-glass overrides, multi-channel notifications, and WebRTC telemedicine.

---

## 🏛️ System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │           React 19 Frontend Apps            │
                               │ (Patient Portal, Doctor Portal, Hospital Admin)│
                               └──────────────────────┬───────────────────────┘
                                                      │ HTTP / WebSockets
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │          Spring Cloud API Gateway            │
                               │                (Port 8080)                   │
                               └──────────────────────┬───────────────────────┘
                                                      │
         ┌───────────────────┬────────────────────────┼────────────────────────┬───────────────────┐
         ▼                   ▼                        ▼                        ▼                   ▼
┌──────────────────┐┌──────────────────┐   ┌────────────────────┐   ┌──────────────────┐┌──────────────────┐
│  Auth Service    ││   User Service   │   │ Medical Record Svc │   │ Notification Svc ││ Appointment Svc  │
│   (Port 8081)    ││   (Port 8082)    │   │    (Port 8083)     │   │   (Port 3009)    ││   (Port 3010)    │
└────────┬─────────┘└────────┬─────────┘   └─────────┬──────────┘   └────────┬─────────┘└────────┬─────────┘
         │                   │                       │                       │                   │
         └───────────────────┴───────────────────────┼───────────────────────┴───────────────────┘
                                                     ▼
                               ┌──────────────────────────────────────────────┐
                               │          Python / NestJS AI Services         │
                               │   (OCR, RAG Engine, Clinical CDS, Biomarkers)│
                               └──────────────────────┬───────────────────────┘
                                                      │
                                   ┌──────────────────┴──────────────────┐
                                   ▼                                     ▼
                      ┌──────────────────────────┐         ┌──────────────────────────┐
                      │   PostgreSQL 16 & Redis  │         │  ChromaDB Vector & MinIO │
                      └──────────────────────────┘         └──────────────────────────┘
```

---

## 🚀 Port & Microservice Mapping

| Service Name | Stack / Framework | Default Port | Description |
| :--- | :--- | :--- | :--- |
| **API Gateway** | Spring Cloud Gateway | `8080` | Unified routing, JWT validation, rate limiting |
| **Config Server** | Spring Cloud Config | `8888` | Centralized external configuration |
| **Auth Service** | Spring Boot / Java 21 | `8081` | Authentication, RBAC, Emergency QR tokens |
| **User Service** | Spring Boot / Java 21 | `8082` | User profiles, demographics, ABHA IDs |
| **Medical Record Service** | Spring Boot / Java 21 | `8083` | Metadata, MinIO file links, access logs |
| **OCR & FHIR Service** | NestJS / Python | `8084` | Tesseract/PaddleOCR, HL7 FHIR R4 mapping |
| **AI & RAG Service** | FastAPI / Python | `8001` | Llama-3/Gemini, ChromaDB vector indexing |
| **CDS Engine** | NestJS / TypeScript | `8085` | Drug-drug interaction, allergy safety alerts |
| **Notification Service** | NestJS / BullMQ / WebSockets | `3009` | Multi-channel email, push, in-app, WebSockets |
| **Appointment Service** | NestJS / Socket.io / WebRTC | `3010` | Booking slots, WebRTC HD telemedicine calls |
| **Frontend Portal** | React 19 / TypeScript / Vite | `5173` | Patient, Doctor & Hospital Admin portals |

---

## 🔒 Security & HIPAA Compliance

- **Role-Based Access Control (RBAC)**: Strictly enforced across `PATIENT`, `DOCTOR`, `HOSPITAL_ADMIN`, and `SYSTEM_ADMIN` roles.
- **Break-Glass Emergency Overrides**: Dual-key cryptographic tokens allowing emergency department physicians temporary access to critical patient allergy & history data with mandatory audit logging.
- **Data Protection & Encryption**: TLS in transit, AES-256 for sensitive payload fields, signed MinIO URLs for document access.

---

## 🛠️ Local Startup & Execution

### Prerequisites
- Docker & Docker Compose
- Node.js 22+
- JDK 21+

### Quickstart

1. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

2. **Launch Infrastructure & Microservices**:
   ```bash
   docker compose up --build -d
   ```

3. **Launch Frontend Application**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Access the unified clinical portals on `http://localhost:5173`.

---

## 📄 License & Compliance

MedVault is proprietary enterprise healthcare software compliant with HL7 FHIR R4 and ABDM standards.
