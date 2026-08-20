# 🏥 MedVault REST API Documentation

- **Base URL**: `http://localhost:5000`
- **Current Version**: `v1.0.0`
- **Content-Type**: `application/json` (or `multipart/form-data` for file uploads)
- **Authentication**: Bearer JWT token in header (`Authorization: Bearer <token>`)

---

## 📑 Table of Contents
1. [Health Check](#-health-check)
2. [Authentication Endpoints (`/api/auth`)](#-authentication-endpoints-apiauth)
3. [Patient Profile Endpoints (`/api/patient`)](#-patient-profile-endpoints-apipatient)
4. [Medical Records & OCR Endpoints (`/api/records`)](#-medical-records--ocr-endpoints-apirecords)
5. [Clinical AI & Risk Analysis Endpoints (`/api/ai`)](#-clinical-ai--risk-analysis-endpoints-apiai)
6. [Emergency QR & First Responder Access (`/api/emergency`)](#-emergency-qr--first-responder-access-apiemergency)
7. [Health Analytics & Vitals (`/api/analytics`)](#-health-analytics--vitals-apianalytics)

---

## 🩺 Health Check

### `GET /health`
Verifies backend server status and timestamp.

- **Auth Required**: No
- **Response `200 OK`**:
```json
{
  "status": "UP",
  "service": "MedVault Node.js Backend API",
  "timestamp": "2026-08-20T08:33:00.000Z"
}
```

---

## 🔐 Authentication Endpoints (`/api/auth`)

### 1. Register New User
- **Method / Path**: `POST /api/auth/register`
- **Auth Required**: No
- **Request Body**:
```json
{
  "name": "Dr. Sarah Jenkins",
  "email": "sarah.jenkins@medvault.health",
  "password": "SecurePassword123!",
  "dob": "1992-06-15",
  "gender": "Female",
  "bloodGroup": "A+",
  "phone": "+1 (555) 234-5678"
}
```
- **Response `201 Created`**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-a1b2c3d4",
    "name": "Dr. Sarah Jenkins",
    "email": "sarah.jenkins@medvault.health",
    "dob": "1992-06-15",
    "gender": "Female",
    "bloodGroup": "A+",
    "phone": "+1 (555) 234-5678",
    "height": "175 cm",
    "weight": "70 kg",
    "allergies": [],
    "conditions": [],
    "emergencyContact": {
      "name": "Primary Contact",
      "relation": "Family",
      "phone": "+91 98000 00001"
    }
  }
}
```

---

### 2. Login User
- **Method / Path**: `POST /api/auth/login`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "patient@medvault.health",
  "password": "Password123!"
}
```
- **Response `200 OK`**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-1",
    "name": "Sarah Jenkins",
    "email": "patient@medvault.health",
    "dob": "1992-06-15",
    "gender": "Female",
    "bloodGroup": "A+",
    "phone": "+1 (555) 234-5678"
  }
}
```

---

### 3. Get Authenticated User Details
- **Method / Path**: `GET /api/auth/me`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response `200 OK`**: Current user profile object without password hash.

---

## 👤 Patient Profile Endpoints (`/api/patient`)

### 1. Get Patient Profile
- **Method / Path**: `GET /api/patient/profile`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response `200 OK`**:
```json
{
  "id": "usr-1",
  "name": "Sarah Jenkins",
  "email": "patient@medvault.health",
  "dob": "1992-06-15",
  "gender": "Female",
  "bloodGroup": "A+",
  "phone": "+1 (555) 234-5678",
  "height": "168 cm",
  "weight": "62 kg",
  "allergies": ["Penicillin", "Peanuts"],
  "conditions": ["Mild Asthma", "Hypertension Stage 1"],
  "emergencyContact": {
    "name": "Michael Jenkins",
    "relation": "Spouse",
    "phone": "+1 (555) 987-6543"
  }
}
```

---

### 2. Update Patient Profile
- **Method / Path**: `PUT /api/patient/profile`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**: (Any profile fields to update)
```json
{
  "weight": "64 kg",
  "allergies": ["Penicillin", "Peanuts", "Sulfa drugs"],
  "emergencyContact": {
    "name": "Michael Jenkins",
    "relation": "Spouse",
    "phone": "+1 (555) 987-6543"
  }
}
```
- **Response `200 OK`**:
```json
{
  "message": "Profile updated successfully",
  "profile": { /* updated profile */ }
}
```

---

## 📁 Medical Records & OCR Endpoints (`/api/records`)

### 1. Get All Medical Records
- **Method / Path**: `GET /api/records`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response `200 OK`**:
```json
[
  {
    "id": "rec-1",
    "userId": "usr-1",
    "name": "Comprehensive Metabolic Panel",
    "date": "2026-05-10",
    "type": "PDF",
    "category": "Lab Report",
    "status": "processed",
    "size": "2.4 MB",
    "summary": "Fasting blood glucose 98 mg/dL (Normal). HbA1c 5.4%.",
    "fileUrl": "/uploads/1787195068776-731308978.pdf",
    "createdAt": "2026-05-10T10:30:00.000Z"
  }
]
```

---

### 2. Get Single Record by ID
- **Method / Path**: `GET /api/records/:id`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response `200 OK`**: Single medical record object.

---

### 3. Upload Document with Automated OCR Extraction
- **Method / Path**: `POST /api/records`
- **Auth Required**: Yes (`Bearer <token>`)
- **Content-Type**: `multipart/form-data`
- **Form Data Fields**:
  - `file` *(File)*: PDF, PNG, JPG medical document
  - `name` *(string, optional)*: Custom record title
  - `category` *(string, optional)*: "Lab Report" | "Prescription" | "Diagnostic Imaging" | "Discharge Summary"
  - `date` *(string, optional)*: Document date (`YYYY-MM-DD`)
  - `summary` *(string, optional)*: Manual summary fallback
- **Response `201 Created`**:
```json
{
  "message": "Document uploaded and OCR processed successfully",
  "record": {
    "id": "rec-99a8b7c6",
    "userId": "usr-1",
    "name": "Lipid Profile Test",
    "date": "2026-08-20",
    "type": "PDF",
    "category": "Lab Report",
    "status": "processed",
    "size": "450 KB",
    "summary": "Extracted Biomarkers: Total Cholesterol: 185 mg/dL (Normal), Triglycerides: 140 mg/dL (Normal), HDL: 52 mg/dL, LDL: 105 mg/dL.",
    "fileUrl": "/uploads/1787201234567-890123456.pdf",
    "createdAt": "2026-08-20T08:50:00.000Z"
  },
  "ocr": {
    "rawText": "PATIENT: Sarah Jenkins ... CHOLESTEROL TOTAL: 185 mg/dL ...",
    "extractedMarkers": [
      {
        "name": "Total Cholesterol",
        "value": 185,
        "unit": "mg/dL",
        "reference": "< 200 mg/dL",
        "status": "Normal"
      }
    ],
    "summary": "Extracted Biomarkers: Total Cholesterol: 185 mg/dL..."
  }
}
```

---

### 4. Delete Medical Record
- **Method / Path**: `DELETE /api/records/:id`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response `200 OK`**:
```json
{
  "message": "Record deleted successfully"
}
```

---

## 🤖 Clinical AI & Risk Analysis Endpoints (`/api/ai`)

### 1. Ask Clinical AI Assistant (RAG Grounded in Patient Records)
- **Method / Path**: `POST /api/ai/assistant`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**:
```json
{
  "question": "What were my fasting glucose levels in my last lab test?"
}
```
- **Response `200 OK`**:
```json
{
  "question": "What were my fasting glucose levels in my last lab test?",
  "answer": "Based on the verified reports in your vault, here are your actual results:\n\n• Comprehensive Metabolic Panel (5/10/2026): Fasting blood glucose 98 mg/dL (Normal). HbA1c 5.4%.\n\nAll values are referenced directly from your uploaded documents.",
  "sources": [
    "Comprehensive Metabolic Panel"
  ],
  "timestamp": "2026-08-20T08:52:00.000Z"
}
```

---

### 2. Get Clinical Risk Assessment
- **Method / Path**: `GET /api/ai/risk-analysis`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response `200 OK`**:
```json
{
  "patientId": "usr-1",
  "patientName": "Sarah Jenkins",
  "overallScore": 78,
  "hasRecords": true,
  "riskCategory": "Low to Moderate",
  "risks": [
    {
      "condition": "Metabolic Status",
      "level": "Moderate",
      "score": 42,
      "status": "stable",
      "finding": "Evaluated from uploaded glycemic & lipid panels.",
      "recommendation": "Maintain balanced nutrition and regular physical activity."
    }
  ],
  "lastUpdated": "2026-08-20T08:52:00.000Z"
}
```

---

## 🚨 Emergency QR & First Responder Access (`/api/emergency`)

### 1. Generate Emergency QR Token
Generates a 24-hour time-limited emergency access token.
- **Method / Path**: `POST /api/emergency/qr`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response `200 OK`**:
```json
{
  "message": "Emergency access QR token generated",
  "token": "EMG-9F4D2A1B",
  "qrDataUrl": "https://medvault.health/emergency/verify?token=EMG-9F4D2A1B",
  "expiresAt": "2026-08-21T08:52:00.000Z",
  "emergencyData": {
    "token": "EMG-9F4D2A1B",
    "patientId": "usr-1",
    "patientName": "Sarah Jenkins",
    "bloodGroup": "A+",
    "allergies": ["Penicillin", "Peanuts"],
    "conditions": ["Mild Asthma"],
    "emergencyContact": {
      "name": "Michael Jenkins",
      "relation": "Spouse",
      "phone": "+1 (555) 987-6543"
    },
    "expiresAt": "2026-08-21T08:52:00.000Z"
  }
}
```

---

### 2. Verify Emergency Token (First Responder Break-Glass)
Allows emergency response teams to retrieve life-saving data without full vault credentials.
- **Method / Path**: `GET /api/emergency/verify/:token`
- **Auth Required**: No (Token validated via URL param)
- **Response `200 OK`**:
```json
{
  "status": "ACTIVE_EMERGENCY_ACCESS",
  "patient": {
    "name": "Sarah Jenkins",
    "bloodGroup": "A+",
    "allergies": ["Penicillin", "Peanuts"],
    "conditions": ["Mild Asthma"],
    "emergencyContact": {
      "name": "Michael Jenkins",
      "relation": "Spouse",
      "phone": "+1 (555) 987-6543"
    }
  },
  "validUntil": "2026-08-21T08:52:00.000Z"
}
```

---

## 📈 Health Analytics & Vitals (`/api/analytics`)

### 1. Get Logged Vitals History
- **Method / Path**: `GET /api/analytics/vitals`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response `200 OK`**:
```json
[
  {
    "id": "v-1",
    "userId": "usr-1",
    "date": "2026-05-01",
    "systolic": 118,
    "diastolic": 78,
    "heartRate": 68,
    "bloodGlucose": 92,
    "weightKg": 61.5
  },
  {
    "id": "v-2",
    "userId": "usr-1",
    "date": "2026-05-15",
    "systolic": 120,
    "diastolic": 80,
    "heartRate": 72,
    "bloodGlucose": 95,
    "weightKg": 62.0
  }
]
```

---

### 2. Log New Vitals Entry
- **Method / Path**: `POST /api/analytics/vitals`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**:
```json
{
  "systolic": 120,
  "diastolic": 80,
  "heartRate": 72,
  "bloodGlucose": 98,
  "weightKg": 62.2,
  "date": "2026-08-20"
}
```
- **Response `201 Created`**:
```json
{
  "message": "Vitals logged successfully",
  "vital": {
    "id": "v-87c6b5a4",
    "userId": "usr-1",
    "date": "2026-08-20",
    "systolic": 120,
    "diastolic": 80,
    "heartRate": 72,
    "bloodGlucose": 98,
    "weightKg": 62.2
  }
}
```
