import fs from 'fs';
import path from 'path';

export interface PatientProfile {
  id: string;
  name: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  email: string;
  phone: string;
  height: string;
  weight: string;
  allergies: string[];
  conditions: string[];
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
}

export interface UserAccount extends PatientProfile {
  passwordHash: string;
}

export interface MedicalRecord {
  id: string;
  userId: string;
  name: string;
  date: string;
  type: string;
  category: "Lab Report" | "Imaging" | "Prescription" | "Vaccination" | "Discharge Summary";
  status: "processed" | "processing" | "failed";
  size: string;
  summary: string;
  fileUrl?: string;
  createdAt: string;
}

export interface VitalRecord {
  id: string;
  userId: string;
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  bloodGlucose: number;
  weightKg: number;
}

export interface EmergencyAccess {
  token: string;
  patientId: string;
  patientName: string;
  bloodGroup: string;
  allergies: string[];
  conditions: string[];
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  expiresAt: string;
}

const DATA_FILE = path.join(__dirname, '../../data/db.json');

interface DbSchema {
  users: UserAccount[];
  records: MedicalRecord[];
  vitals: VitalRecord[];
  emergencyTokens: EmergencyAccess[];
}

const initialDb: DbSchema = {
  users: [
    {
      id: "usr-1",
      name: "Aarav Sharma",
      dob: "1992-04-18",
      gender: "Male",
      bloodGroup: "O+",
      email: "aarav.sharma@example.com",
      phone: "+91 98200 41122",
      height: "178 cm",
      weight: "76 kg",
      allergies: ["Penicillin", "Dust mite"],
      conditions: ["Pre-diabetes", "Vitamin D deficiency"],
      emergencyContact: {
        name: "Meera Sharma",
        relation: "Spouse",
        phone: "+91 98111 20034"
      },
      passwordHash: "$2a$10$X8p5Kz8T940/2L2p7xG9e.40j9h9K3z10sP.wQ.eX2z.G5kL" // demo password: "Password123!"
    }
  ],
  records: [
    {
      id: "rec-1",
      userId: "usr-1",
      name: "Complete Blood Count (CBC)",
      date: "2026-07-28",
      type: "PDF",
      category: "Lab Report",
      status: "processed",
      size: "412 KB",
      summary: "Hemoglobin 14.2 g/dL, WBC 7.1 K/µL — all values within normal reference range.",
      createdAt: new Date().toISOString()
    },
    {
      id: "rec-2",
      userId: "usr-1",
      name: "HbA1c & Fasting Glucose Panel",
      date: "2026-07-12",
      type: "PDF",
      category: "Lab Report",
      status: "processed",
      size: "298 KB",
      summary: "HbA1c 5.9% — borderline. Fasting glucose 104 mg/dL, trending down from last quarter.",
      createdAt: new Date().toISOString()
    },
    {
      id: "rec-3",
      userId: "usr-1",
      name: "Lipid Profile",
      date: "2026-06-30",
      type: "PDF",
      category: "Lab Report",
      status: "processed",
      size: "355 KB",
      summary: "Total Cholesterol 192 mg/dL, HDL 48 mg/dL, LDL 118 mg/dL, Triglycerides 130 mg/dL.",
      createdAt: new Date().toISOString()
    },
    {
      id: "rec-4",
      userId: "usr-1",
      name: "Chest X-Ray PA View",
      date: "2026-05-15",
      type: "DICOM/Image",
      category: "Imaging",
      status: "processed",
      size: "4.2 MB",
      summary: "Clear lung fields bilaterally. Normal cardiothoracic ratio. No acute cardiopulmonary disease.",
      createdAt: new Date().toISOString()
    },
    {
      id: "rec-5",
      userId: "usr-1",
      name: "Tetanus Booster Prescription",
      date: "2026-04-10",
      type: "PDF",
      category: "Prescription",
      status: "processed",
      size: "180 KB",
      summary: "Tdap vaccine administered post minor abrasion. Valid for 10 years.",
      createdAt: new Date().toISOString()
    }
  ],
  vitals: [
    { id: "v-1", userId: "usr-1", date: "2026-08-01", systolic: 122, diastolic: 80, heartRate: 72, bloodGlucose: 102, weightKg: 76 },
    { id: "v-2", userId: "usr-1", date: "2026-08-05", systolic: 120, diastolic: 78, heartRate: 70, bloodGlucose: 99, weightKg: 75.8 },
    { id: "v-3", userId: "usr-1", date: "2026-08-10", systolic: 118, diastolic: 79, heartRate: 68, bloodGlucose: 96, weightKg: 75.5 },
    { id: "v-4", userId: "usr-1", date: "2026-08-15", systolic: 121, diastolic: 81, heartRate: 74, bloodGlucose: 101, weightKg: 76.0 }
  ],
  emergencyTokens: []
};

class Database {
  private data: DbSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DbSchema {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
      this.save(initialDb);
      return initialDb;
    } catch (error) {
      console.error('Failed to read database file, initializing in-memory fallback:', error);
      return initialDb;
    }
  }

  public save(data?: DbSchema): void {
    if (data) {
      this.data = data;
    }
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to write database file:', error);
    }
  }

  // User Operations
  public findUserByEmail(email: string): UserAccount | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): UserAccount | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: UserAccount): UserAccount {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<UserAccount>): UserAccount | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // Medical Record Operations
  public getRecords(userId: string): MedicalRecord[] {
    return this.data.records.filter(r => r.userId === userId);
  }

  public getRecordById(id: string, userId: string): MedicalRecord | undefined {
    return this.data.records.find(r => r.id === id && r.userId === userId);
  }

  public addRecord(record: MedicalRecord): MedicalRecord {
    this.data.records.unshift(record);
    this.save();
    return record;
  }

  public deleteRecord(id: string, userId: string): boolean {
    const initialLen = this.data.records.length;
    this.data.records = this.data.records.filter(r => !(r.id === id && r.userId === userId));
    const deleted = this.data.records.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // Vitals Operations
  public getVitals(userId: string): VitalRecord[] {
    return this.data.vitals.filter(v => v.userId === userId);
  }

  public addVital(vital: VitalRecord): VitalRecord {
    this.data.vitals.push(vital);
    this.save();
    return vital;
  }

  // Emergency Token Operations
  public saveEmergencyToken(access: EmergencyAccess): EmergencyAccess {
    this.data.emergencyTokens.push(access);
    this.save();
    return access;
  }

  public getEmergencyToken(token: string): EmergencyAccess | undefined {
    return this.data.emergencyTokens.find(t => t.token === token);
  }
}

export const db = new Database();
