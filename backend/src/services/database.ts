import fs from 'fs';
import path from 'path';
import { supabase } from './supabase';

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
  extractedMarkers?: any[];
  rawText?: string;
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
      passwordHash: "$2a$10$X8p5Kz8T940/2L2p7xG9e.40j9h9K3z10sP.wQ.eX2z.G5kL"
    }
  ],
  records: [
    {
      id: "rec-1",
      userId: "usr-1",
      name: "Comprehensive Metabolic Panel & Lipid Profile",
      date: "2026-05-10",
      type: "PDF",
      category: "Lab Report",
      status: "processed",
      size: "2.4 MB",
      summary: "Fasting blood glucose 108 mg/dL (Borderline), HbA1c 5.9% (Pre-diabetes range), Total Cholesterol 210 mg/dL (Elevated), Triglycerides 165 mg/dL.",
      fileUrl: "/uploads/sample_cmp_lab.pdf",
      createdAt: "2026-05-10T09:30:00.000Z"
    },
    {
      id: "rec-2",
      userId: "usr-1",
      name: "Chest X-Ray (PA View)",
      date: "2026-02-14",
      type: "PNG",
      category: "Imaging",
      status: "processed",
      size: "4.1 MB",
      summary: "Normal cardiac silhouette, clear lung fields, no focal consolidation or pleural effusion.",
      fileUrl: "/uploads/sample_chest_xray.png",
      createdAt: "2026-02-14T11:15:00.000Z"
    },
    {
      id: "rec-3",
      userId: "usr-1",
      name: "Endocrinology Clinical Prescription",
      date: "2026-05-12",
      type: "PDF",
      category: "Prescription",
      status: "processed",
      size: "890 KB",
      summary: "Prescribed Metformin 500mg once daily after dinner; Lifestyle dietary modifications; Repeat HbA1c in 90 days.",
      fileUrl: "/uploads/sample_prescription.pdf",
      createdAt: "2026-05-12T16:00:00.000Z"
    }
  ],
  vitals: [
    { id: "vit-1", userId: "usr-1", date: "2026-01-10", systolic: 124, diastolic: 82, heartRate: 74, bloodGlucose: 102, weightKg: 78.5 },
    { id: "vit-2", userId: "usr-1", date: "2026-02-12", systolic: 122, diastolic: 80, heartRate: 72, bloodGlucose: 99, weightKg: 78.0 },
    { id: "vit-3", userId: "usr-1", date: "2026-03-15", systolic: 120, diastolic: 79, heartRate: 70, bloodGlucose: 96, weightKg: 77.2 },
    { id: "vit-4", userId: "usr-1", date: "2026-04-18", systolic: 118, diastolic: 78, heartRate: 68, bloodGlucose: 95, weightKg: 76.5 },
    { id: "vit-5", userId: "usr-1", date: "2026-05-20", systolic: 116, diastolic: 76, heartRate: 69, bloodGlucose: 92, weightKg: 76.0 }
  ],
  emergencyTokens: []
};

class DatabaseService {
  private localDb: DbSchema;

  constructor() {
    this.localDb = this.loadLocalData();
  }

  private loadLocalData(): DbSchema {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
      this.saveLocalData(initialDb);
      return initialDb;
    } catch (e) {
      console.error('Error loading local data store:', e);
      return initialDb;
    }
  }

  private saveLocalData(data: DbSchema): void {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
      this.localDb = data;
    } catch (e) {
      console.error('Error persisting local data:', e);
    }
  }

  // --- Users & Profiles ---

  public async findUserByEmail(email: string): Promise<UserAccount | undefined> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase())
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            dob: data.dob || '',
            gender: data.gender || '',
            bloodGroup: data.blood_group || 'O+',
            email: data.email,
            phone: data.phone || '',
            height: data.height || '',
            weight: data.weight || '',
            allergies: Array.isArray(data.allergies) ? data.allergies : (data.allergies ? JSON.parse(data.allergies) : []),
            conditions: Array.isArray(data.conditions) ? data.conditions : (data.conditions ? JSON.parse(data.conditions) : []),
            emergencyContact: typeof data.emergency_contact === 'object' ? data.emergency_contact : { name: '', relation: '', phone: '' },
            passwordHash: data.password_hash,
          };
        }
      } catch (err) {
        console.warn('Supabase findUserByEmail fallback to local store:', err);
      }
    }
    return this.localDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public async findUserById(id: string): Promise<UserAccount | undefined> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            dob: data.dob || '',
            gender: data.gender || '',
            bloodGroup: data.blood_group || 'O+',
            email: data.email,
            phone: data.phone || '',
            height: data.height || '',
            weight: data.weight || '',
            allergies: Array.isArray(data.allergies) ? data.allergies : (data.allergies ? JSON.parse(data.allergies) : []),
            conditions: Array.isArray(data.conditions) ? data.conditions : (data.conditions ? JSON.parse(data.conditions) : []),
            emergencyContact: typeof data.emergency_contact === 'object' ? data.emergency_contact : { name: '', relation: '', phone: '' },
            passwordHash: data.password_hash,
          };
        }
      } catch (err) {
        console.warn('Supabase findUserById fallback to local store:', err);
      }
    }
    return this.localDb.users.find(u => u.id === id);
  }

  public async createUser(user: UserAccount): Promise<UserAccount> {
    // 1. Persist in local DB for seamless fallback
    this.localDb.users.push(user);
    this.saveLocalData(this.localDb);

    // 2. Persist in Supabase
    if (supabase) {
      try {
        const { error } = await supabase.from('users').insert({
          id: user.id,
          name: user.name,
          email: user.email.toLowerCase(),
          dob: user.dob,
          gender: user.gender,
          blood_group: user.bloodGroup,
          phone: user.phone,
          height: user.height,
          weight: user.weight,
          allergies: user.allergies,
          conditions: user.conditions,
          emergency_contact: user.emergencyContact,
          password_hash: user.passwordHash,
          created_at: new Date().toISOString()
        });
        if (error) console.error('Supabase createUser error:', error);
      } catch (err) {
        console.error('Supabase createUser exception:', err);
      }
    }

    return user;
  }

  public async updateUser(id: string, updates: Partial<PatientProfile>): Promise<PatientProfile | null> {
    let updatedProfile: PatientProfile | null = null;

    // 1. Update local
    const index = this.localDb.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.localDb.users[index] = { ...this.localDb.users[index], ...updates };
      this.saveLocalData(this.localDb);
      const { passwordHash, ...profile } = this.localDb.users[index];
      updatedProfile = profile;
    }

    // 2. Update Supabase
    if (supabase) {
      try {
        const supaUpdates: Record<string, any> = {};
        if (updates.name !== undefined) supaUpdates.name = updates.name;
        if (updates.dob !== undefined) supaUpdates.dob = updates.dob;
        if (updates.gender !== undefined) supaUpdates.gender = updates.gender;
        if (updates.bloodGroup !== undefined) supaUpdates.blood_group = updates.bloodGroup;
        if (updates.phone !== undefined) supaUpdates.phone = updates.phone;
        if (updates.height !== undefined) supaUpdates.height = updates.height;
        if (updates.weight !== undefined) supaUpdates.weight = updates.weight;
        if (updates.allergies !== undefined) supaUpdates.allergies = updates.allergies;
        if (updates.conditions !== undefined) supaUpdates.conditions = updates.conditions;
        if (updates.emergencyContact !== undefined) supaUpdates.emergency_contact = updates.emergencyContact;

        const { data, error } = await supabase
          .from('users')
          .update(supaUpdates)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (!error && data) {
          updatedProfile = {
            id: data.id,
            name: data.name,
            dob: data.dob || '',
            gender: data.gender || '',
            bloodGroup: data.blood_group || 'O+',
            email: data.email,
            phone: data.phone || '',
            height: data.height || '',
            weight: data.weight || '',
            allergies: Array.isArray(data.allergies) ? data.allergies : [],
            conditions: Array.isArray(data.conditions) ? data.conditions : [],
            emergencyContact: typeof data.emergency_contact === 'object' ? data.emergency_contact : { name: '', relation: '', phone: '' },
          };
        }
      } catch (err) {
        console.error('Supabase updateUser exception:', err);
      }
    }

    return updatedProfile;
  }

  // --- Medical Records ---

  public async getRecords(userId: string): Promise<MedicalRecord[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('medical_records')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(r => ({
            id: r.id,
            userId: r.user_id,
            name: r.name,
            date: r.date,
            type: r.type,
            category: r.category,
            status: r.status,
            size: r.size,
            summary: r.summary,
            fileUrl: r.file_url,
            extractedMarkers: r.extracted_markers || [],
            rawText: r.raw_text,
            createdAt: r.created_at
          }));
        }
      } catch (err) {
        console.warn('Supabase getRecords fallback:', err);
      }
    }
    return this.localDb.records.filter(r => r.userId === userId);
  }

  public async getRecordById(id: string, userId: string): Promise<MedicalRecord | undefined> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('medical_records')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            date: data.date,
            type: data.type,
            category: data.category,
            status: data.status,
            size: data.size,
            summary: data.summary,
            fileUrl: data.file_url,
            extractedMarkers: data.extracted_markers || [],
            rawText: data.raw_text,
            createdAt: data.created_at
          };
        }
      } catch (err) {
        console.warn('Supabase getRecordById fallback:', err);
      }
    }
    return this.localDb.records.find(r => r.id === id && r.userId === userId);
  }

  public async addRecord(record: MedicalRecord): Promise<MedicalRecord> {
    // 1. Local sync
    this.localDb.records.unshift(record);
    this.saveLocalData(this.localDb);

    // 2. Supabase sync
    if (supabase) {
      try {
        const { error } = await supabase.from('medical_records').insert({
          id: record.id,
          user_id: record.userId,
          name: record.name,
          date: record.date,
          type: record.type,
          category: record.category,
          status: record.status,
          size: record.size,
          summary: record.summary,
          file_url: record.fileUrl,
          extracted_markers: record.extractedMarkers || [],
          raw_text: record.rawText || '',
          created_at: record.createdAt || new Date().toISOString()
        });
        if (error) console.error('Supabase addRecord error:', error);
      } catch (err) {
        console.error('Supabase addRecord exception:', err);
      }
    }

    return record;
  }

  public async deleteRecord(id: string, userId: string): Promise<boolean> {
    const initialLen = this.localDb.records.length;
    this.localDb.records = this.localDb.records.filter(r => !(r.id === id && r.userId === userId));
    const localSuccess = this.localDb.records.length < initialLen;
    if (localSuccess) {
      this.saveLocalData(this.localDb);
    }

    if (supabase) {
      try {
        const { error } = await supabase
          .from('medical_records')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (!error) return true;
      } catch (err) {
        console.error('Supabase deleteRecord error:', err);
      }
    }

    return localSuccess;
  }

  // --- Vitals ---

  public async getVitals(userId: string): Promise<VitalRecord[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('vitals')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map(v => ({
            id: v.id,
            userId: v.user_id,
            date: v.date,
            systolic: v.systolic,
            diastolic: v.diastolic,
            heartRate: v.heart_rate,
            bloodGlucose: v.blood_glucose,
            weightKg: Number(v.weight_kg)
          }));
        }
      } catch (err) {
        console.warn('Supabase getVitals fallback:', err);
      }
    }
    return this.localDb.vitals.filter(v => v.userId === userId);
  }

  public async addVital(vital: VitalRecord): Promise<VitalRecord> {
    // 1. Local
    this.localDb.vitals.push(vital);
    this.saveLocalData(this.localDb);

    // 2. Supabase
    if (supabase) {
      try {
        const { error } = await supabase.from('vitals').insert({
          id: vital.id,
          user_id: vital.userId,
          date: vital.date,
          systolic: vital.systolic,
          diastolic: vital.diastolic,
          heart_rate: vital.heartRate,
          blood_glucose: vital.bloodGlucose,
          weight_kg: vital.weightKg,
          created_at: new Date().toISOString()
        });
        if (error) console.error('Supabase addVital error:', error);
      } catch (err) {
        console.error('Supabase addVital exception:', err);
      }
    }

    return vital;
  }

  // --- Emergency Access Tokens ---

  public async createEmergencyToken(access: EmergencyAccess): Promise<EmergencyAccess> {
    this.localDb.emergencyTokens = this.localDb.emergencyTokens.filter(t => t.patientId !== access.patientId);
    this.localDb.emergencyTokens.push(access);
    this.saveLocalData(this.localDb);

    if (supabase) {
      try {
        await supabase.from('emergency_access').delete().eq('patient_id', access.patientId);
        const { error } = await supabase.from('emergency_access').insert({
          token: access.token,
          patient_id: access.patientId,
          patient_name: access.patientName,
          blood_group: access.bloodGroup,
          allergies: access.allergies,
          conditions: access.conditions,
          emergency_contact: access.emergencyContact,
          expires_at: access.expiresAt,
          created_at: new Date().toISOString()
        });
        if (error) console.error('Supabase createEmergencyToken error:', error);
      } catch (err) {
        console.error('Supabase createEmergencyToken exception:', err);
      }
    }

    return access;
  }

  public async getEmergencyToken(token: string): Promise<EmergencyAccess | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('emergency_access')
          .select('*')
          .eq('token', token)
          .maybeSingle();

        if (!error && data) {
          if (new Date(data.expires_at) > new Date()) {
            return {
              token: data.token,
              patientId: data.patient_id,
              patientName: data.patient_name,
              bloodGroup: data.blood_group,
              allergies: Array.isArray(data.allergies) ? data.allergies : [],
              conditions: Array.isArray(data.conditions) ? data.conditions : [],
              emergencyContact: typeof data.emergency_contact === 'object' ? data.emergency_contact : { name: '', relation: '', phone: '' },
              expiresAt: data.expires_at
            };
          }
        }
      } catch (err) {
        console.warn('Supabase getEmergencyToken fallback:', err);
      }
    }

    const found = this.localDb.emergencyTokens.find(t => t.token === token);
    if (!found) return null;
    if (new Date(found.expiresAt) < new Date()) return null;
    return found;
  }
}

export const db = new DatabaseService();
