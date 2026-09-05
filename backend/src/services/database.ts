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
  category: "Lab Report" | "Imaging" | "Prescription" | "Vaccination" | "Discharge Summary" | "Other";
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

export interface HealthCondition {
  id: string;
  userId: string;
  title: string;
  category: "Metabolic" | "Orthopedic" | "Respiratory" | "Cardiovascular" | "Deficiency" | "Infection" | "Gastrointestinal" | "General";
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
  status: "active" | "resolved" | "monitoring" | "remission";
  severity: "mild" | "moderate" | "severe";
  symptoms: string[];
  diagnosis: string;
  treatingDoctor?: string;
  hospital?: string;
  outcome?: string;
  linkedRecordIds?: string[];
  createdAt: string;
}

export interface VaccinationRecord {
  id: string;
  userId: string;
  vaccineName: string;
  targetDisease: string;
  doseNumber: number;
  totalDoses: number;
  dateAdministered: string;
  nextDueDate?: string;
  manufacturer?: string;
  batchNumber?: string;
  clinic?: string;
  status: "completed" | "due" | "overdue";
  certificateUrl?: string;
  createdAt?: string;
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
  type?: "emergency" | "doctor" | "pharmacy" | "general";
  active?: boolean;
  createdAt?: string;
}

const DATA_FILE = path.join(__dirname, '../../data/db.json');

interface DbSchema {
  users: UserAccount[];
  records: MedicalRecord[];
  vitals: VitalRecord[];
  conditions: HealthCondition[];
  vaccinations: VaccinationRecord[];
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
      conditions: ["L4-L5 Lumbar Disc Bulge", "Pre-diabetes", "Vitamin D deficiency"],
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
      fileUrl: "https://medvault.health/documents/sample_cmp_lab.pdf",
      extractedMarkers: [
        { name: "HbA1c", value: "5.9", unit: "%", status: "borderline", referenceRange: "< 5.7% Normal" },
        { name: "Fasting Blood Glucose", value: "108", unit: "mg/dL", status: "borderline", referenceRange: "70 - 99 mg/dL" },
        { name: "Total Cholesterol", value: "210", unit: "mg/dL", status: "borderline", referenceRange: "< 200 mg/dL" },
        { name: "Triglycerides", value: "165", unit: "mg/dL", status: "borderline", referenceRange: "< 150 mg/dL" }
      ],
      createdAt: "2026-05-10T09:30:00.000Z"
    },
    {
      id: "rec-2",
      userId: "usr-1",
      name: "MRI Lumbar Spine (L1-S1)",
      date: "2026-08-05",
      type: "PDF",
      category: "Imaging",
      status: "processed",
      size: "4.8 MB",
      summary: "Diffuse posterior disc bulge at L4-L5 with mild indenting of the anterior thecal sac. Neural foramina patent without acute nerve root impingement.",
      fileUrl: "https://medvault.health/documents/mri_lumbar_spine.pdf",
      extractedMarkers: [
        { name: "Imaging Modality", value: "Magnetic Resonance Imaging (MRI)", unit: "Radiology", status: "normal" },
        { name: "Anatomical Region", value: "Lumbar Spine (L-Spine)", unit: "Target Organ", status: "normal" },
        { name: "Radiological Impression", value: "Diffuse posterior disc bulge at L4-L5 causing mild thecal sac impingement.", unit: "Impression", status: "attention" }
      ],
      createdAt: "2026-08-05T14:20:00.000Z"
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
      fileUrl: "https://medvault.health/documents/sample_prescription.pdf",
      createdAt: "2026-05-12T16:00:00.000Z"
    }
  ],
  vitals: [
    { id: "vit-1", userId: "usr-1", date: "2025-06-15", systolic: 128, diastolic: 84, heartRate: 76, bloodGlucose: 110, weightKg: 79.5 },
    { id: "vit-2", userId: "usr-1", date: "2025-09-20", systolic: 126, diastolic: 82, heartRate: 74, bloodGlucose: 106, weightKg: 78.8 },
    { id: "vit-3", userId: "usr-1", date: "2025-12-10", systolic: 124, diastolic: 80, heartRate: 72, bloodGlucose: 102, weightKg: 78.0 },
    { id: "vit-4", userId: "usr-1", date: "2026-03-15", systolic: 120, diastolic: 79, heartRate: 70, bloodGlucose: 98, weightKg: 77.2 },
    { id: "vit-5", userId: "usr-1", date: "2026-05-20", systolic: 118, diastolic: 78, heartRate: 69, bloodGlucose: 96, weightKg: 76.4 },
    { id: "vit-6", userId: "usr-1", date: "2026-08-15", systolic: 120, diastolic: 80, heartRate: 72, bloodGlucose: 95, weightKg: 76.0 }
  ],
  conditions: [
    {
      id: "con-1",
      userId: "usr-1",
      title: "L4-L5 Lumbar Disc Bulge & Sciatica",
      category: "Orthopedic",
      startDate: "2026-08-01",
      isOngoing: true,
      status: "active",
      severity: "moderate",
      symptoms: ["Radiating lower back pain down left thigh", "Morning lumbar stiffness", "Aggravated by prolonged sitting"],
      diagnosis: "MRI Lumbar Spine confirmed posterior diffuse disc protrusion at L4-L5 with mild thecal sac compression.",
      treatingDoctor: "Dr. Sarah Bennett (Senior Spine Specialist)",
      hospital: "City Orthopedic & Spine Center",
      outcome: "Undergoing conservative physiotherapy, core strengthening, and ergonomic posture correction.",
      linkedRecordIds: ["rec-2"],
      createdAt: "2026-08-05T10:00:00.000Z"
    },
    {
      id: "con-2",
      userId: "usr-1",
      title: "Severe Vitamin D3 Deficiency",
      category: "Deficiency",
      startDate: "2024-11-10",
      endDate: "2025-02-28",
      isOngoing: false,
      status: "resolved",
      severity: "moderate",
      symptoms: ["Chronic lethargy", "Generalized muscle aches", "Bone tenderness"],
      diagnosis: "Serum 25-Hydroxy Vitamin D level tested at 11.2 ng/mL (Deficient range < 20 ng/mL).",
      treatingDoctor: "Dr. Rajesh Mehta (Internal Medicine)",
      hospital: "Apollo Health Clinic",
      outcome: "Completed 12-week regimen of 60,000 IU Cholecalciferol weekly. Post-treatment serum D3 level successfully normalized to 39.4 ng/mL.",
      linkedRecordIds: ["rec-1"],
      createdAt: "2024-11-15T09:00:00.000Z"
    },
    {
      id: "con-3",
      userId: "usr-1",
      title: "Metabolic Pre-Diabetes",
      category: "Metabolic",
      startDate: "2022-08-15",
      isOngoing: true,
      status: "monitoring",
      severity: "mild",
      symptoms: ["Mild post-prandial fatigue", "Family history of Type 2 Diabetes"],
      diagnosis: "Fasting Blood Glucose 108 mg/dL, HbA1c 5.9% (Pre-diabetes spectrum).",
      treatingDoctor: "Dr. Ananya Ray (Endocrinologist)",
      hospital: "Metro Diabetes Care Institute",
      outcome: "Active dietary low-glycemic management and daily 45-min brisk walking. Quarterly HbA1c stable at 5.8% - 5.9%.",
      linkedRecordIds: ["rec-1", "rec-3"],
      createdAt: "2022-08-20T11:00:00.000Z"
    },
    {
      id: "con-4",
      userId: "usr-1",
      title: "Acute Viral Bronchitis",
      category: "Respiratory",
      startDate: "2021-01-12",
      endDate: "2021-02-05",
      isOngoing: false,
      status: "resolved",
      severity: "mild",
      symptoms: ["Persistent dry nocturnal cough", "Low-grade fever (100.2°F)", "Mild wheezing"],
      diagnosis: "Acute respiratory tract viral infection with transient bronchial hyper-reactivity.",
      treatingDoctor: "Dr. K. S. Verma (Pulmonology)",
      hospital: "St. Jude Healthcare",
      outcome: "Full clinical resolution within 3 weeks with inhalational bronchodilators and symptomatic hydration.",
      linkedRecordIds: [],
      createdAt: "2021-01-15T10:00:00.000Z"
    }
  ],
  vaccinations: [
    {
      id: "vac-1",
      userId: "usr-1",
      vaccineName: "COVID-19 mRNA Vaccine",
      targetDisease: "SARS-CoV-2",
      doseNumber: 2,
      totalDoses: 2,
      dateAdministered: "2021-08-14",
      manufacturer: "Pfizer-BioNTech",
      batchNumber: "FF8291",
      clinic: "National Vaccination Center",
      status: "completed",
      createdAt: "2021-08-14T09:00:00.000Z"
    },
    {
      id: "vac-2",
      userId: "usr-1",
      vaccineName: "COVID-19 Bivalent Booster",
      targetDisease: "SARS-CoV-2 (Omicron Variant)",
      doseNumber: 3,
      totalDoses: 3,
      dateAdministered: "2023-01-20",
      nextDueDate: "2026-10-15",
      manufacturer: "Moderna",
      batchNumber: "MOD-7749",
      clinic: "City Public Health Unit",
      status: "completed",
      createdAt: "2023-01-20T10:30:00.000Z"
    },
    {
      id: "vac-3",
      userId: "usr-1",
      vaccineName: "Hepatitis B Recombinant Vaccine",
      targetDisease: "Hepatitis B Virus",
      doseNumber: 3,
      totalDoses: 3,
      dateAdministered: "2019-06-10",
      manufacturer: "GlaxoSmithKline (Engerix-B)",
      batchNumber: "GSK-HB-902",
      clinic: "Apollo Health Center",
      status: "completed",
      createdAt: "2019-06-10T12:00:00.000Z"
    },
    {
      id: "vac-4",
      userId: "usr-1",
      vaccineName: "Annual Quadrivalent Influenza",
      targetDisease: "Seasonal Influenza (Flu)",
      doseNumber: 1,
      totalDoses: 1,
      dateAdministered: "2025-10-12",
      nextDueDate: "2026-10-12",
      manufacturer: "Sanofi Pasteur (Fluzone)",
      batchNumber: "FLU-2025-Q4",
      clinic: "Metro Community Care",
      status: "due",
      createdAt: "2025-10-12T15:00:00.000Z"
    },
    {
      id: "vac-5",
      userId: "usr-1",
      vaccineName: "Tdap (Tetanus, Diphtheria, Pertussis)",
      targetDisease: "Tetanus, Diphtheria, Pertussis",
      doseNumber: 1,
      totalDoses: 1,
      dateAdministered: "2022-04-18",
      nextDueDate: "2032-04-18",
      manufacturer: "Sanofi Pasteur (Adacel)",
      batchNumber: "TD-3382",
      clinic: "Metro Community Care",
      status: "completed",
      createdAt: "2022-04-18T11:00:00.000Z"
    }
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
        const parsed = JSON.parse(fileContent);
        // Ensure new arrays exist
        parsed.conditions = parsed.conditions || initialDb.conditions;
        parsed.vaccinations = parsed.vaccinations || initialDb.vaccinations;
        return parsed;
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
    } catch (e) {
      console.error('Error saving local data store:', e);
    }
  }

  // --- Users ---

  public async findUserByEmail(email: string): Promise<UserAccount | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            dob: data.dob,
            gender: data.gender,
            bloodGroup: data.blood_group,
            email: data.email,
            phone: data.phone,
            height: data.height,
            weight: data.weight,
            allergies: Array.isArray(data.allergies) ? data.allergies : [],
            conditions: Array.isArray(data.conditions) ? data.conditions : [],
            emergencyContact: typeof data.emergency_contact === 'object' ? data.emergency_contact : { name: '', relation: '', phone: '' },
            passwordHash: data.password_hash
          };
        }
      } catch (err) {
        console.warn('Supabase findUserByEmail fallback:', err);
      }
    }

    const user = this.localDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  public async findUserById(id: string): Promise<UserAccount | null> {
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
            dob: data.dob,
            gender: data.gender,
            bloodGroup: data.blood_group,
            email: data.email,
            phone: data.phone,
            height: data.height,
            weight: data.weight,
            allergies: Array.isArray(data.allergies) ? data.allergies : [],
            conditions: Array.isArray(data.conditions) ? data.conditions : [],
            emergencyContact: typeof data.emergency_contact === 'object' ? data.emergency_contact : { name: '', relation: '', phone: '' },
            passwordHash: data.password_hash
          };
        }
      } catch (err) {
        console.warn('Supabase findUserById fallback:', err);
      }
    }

    const user = this.localDb.users.find(u => u.id === id);
    return user || null;
  }

  public async createUser(user: UserAccount): Promise<UserAccount> {
    this.localDb.users.push(user);
    this.saveLocalData(this.localDb);

    if (supabase) {
      try {
        const { error } = await supabase.from('users').insert({
          id: user.id,
          name: user.name,
          dob: user.dob,
          gender: user.gender,
          blood_group: user.bloodGroup,
          email: user.email,
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

  public async updateUser(id: string, updates: Partial<PatientProfile>): Promise<UserAccount | null> {
    const userIndex = this.localDb.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    this.localDb.users[userIndex] = {
      ...this.localDb.users[userIndex],
      ...updates
    };
    this.saveLocalData(this.localDb);

    if (supabase) {
      try {
        const supabaseUpdates: Record<string, any> = {};
        if (updates.name !== undefined) supabaseUpdates.name = updates.name;
        if (updates.dob !== undefined) supabaseUpdates.dob = updates.dob;
        if (updates.gender !== undefined) supabaseUpdates.gender = updates.gender;
        if (updates.bloodGroup !== undefined) supabaseUpdates.blood_group = updates.bloodGroup;
        if (updates.email !== undefined) supabaseUpdates.email = updates.email;
        if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone;
        if (updates.height !== undefined) supabaseUpdates.height = updates.height;
        if (updates.weight !== undefined) supabaseUpdates.weight = updates.weight;
        if (updates.allergies !== undefined) supabaseUpdates.allergies = updates.allergies;
        if (updates.conditions !== undefined) supabaseUpdates.conditions = updates.conditions;
        if (updates.emergencyContact !== undefined) supabaseUpdates.emergency_contact = updates.emergencyContact;

        const { error } = await supabase.from('users').update(supabaseUpdates).eq('id', id);
        if (error) console.error('Supabase updateUser error:', error);
      } catch (err) {
        console.error('Supabase updateUser exception:', err);
      }
    }

    return this.localDb.users[userIndex];
  }

  // --- Records ---

  public async getRecords(userId: string): Promise<MedicalRecord[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('medical_records')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

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
            extractedMarkers: Array.isArray(r.extracted_markers) ? r.extracted_markers : [],
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

  public async getRecordById(id: string, userId: string): Promise<MedicalRecord | null> {
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
            extractedMarkers: Array.isArray(data.extracted_markers) ? data.extracted_markers : [],
            rawText: data.raw_text,
            createdAt: data.created_at
          };
        }
      } catch (err) {
        console.warn('Supabase getRecordById fallback:', err);
      }
    }
    return this.localDb.records.find(r => r.id === id && r.userId === userId) || null;
  }

  public async addRecord(record: MedicalRecord): Promise<MedicalRecord> {
    this.localDb.records.unshift(record);
    this.saveLocalData(this.localDb);

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
          extracted_markers: record.extractedMarkers,
          raw_text: record.rawText,
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
    this.saveLocalData(this.localDb);

    if (supabase) {
      try {
        const { error } = await supabase.from('medical_records').delete().eq('id', id).eq('user_id', userId);
        if (error) console.error('Supabase deleteRecord error:', error);
      } catch (err) {
        console.error('Supabase deleteRecord exception:', err);
      }
    }

    return this.localDb.records.length < initialLen;
  }

  // --- Health Conditions (Patient Illness Timeline) ---

  public async getConditions(userId: string): Promise<HealthCondition[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('health_conditions')
          .select('*')
          .eq('user_id', userId)
          .order('start_date', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(c => ({
            id: c.id,
            userId: c.user_id,
            title: c.title,
            category: c.category,
            startDate: c.start_date,
            endDate: c.end_date,
            isOngoing: c.is_ongoing,
            status: c.status,
            severity: c.severity,
            symptoms: Array.isArray(c.symptoms) ? c.symptoms : [],
            diagnosis: c.diagnosis,
            treatingDoctor: c.treating_doctor,
            hospital: c.hospital,
            outcome: c.outcome,
            linkedRecordIds: Array.isArray(c.linked_record_ids) ? c.linked_record_ids : [],
            createdAt: c.created_at
          }));
        }
      } catch (err) {
        console.warn('Supabase getConditions fallback:', err);
      }
    }
    return (this.localDb.conditions || []).filter(c => c.userId === userId);
  }

  public async addCondition(condition: HealthCondition): Promise<HealthCondition> {
    this.localDb.conditions = this.localDb.conditions || [];
    this.localDb.conditions.unshift(condition);
    this.saveLocalData(this.localDb);

    if (supabase) {
      try {
        const { error } = await supabase.from('health_conditions').insert({
          id: condition.id,
          user_id: condition.userId,
          title: condition.title,
          category: condition.category,
          start_date: condition.startDate,
          end_date: condition.endDate,
          is_ongoing: condition.isOngoing,
          status: condition.status,
          severity: condition.severity,
          symptoms: condition.symptoms,
          diagnosis: condition.diagnosis,
          treating_doctor: condition.treatingDoctor,
          hospital: condition.hospital,
          outcome: condition.outcome,
          linked_record_ids: condition.linkedRecordIds,
          created_at: condition.createdAt
        });
        if (error) console.error('Supabase addCondition error:', error);
      } catch (err) {
        console.error('Supabase addCondition exception:', err);
      }
    }

    return condition;
  }

  public async updateCondition(id: string, userId: string, updates: Partial<HealthCondition>): Promise<HealthCondition | null> {
    this.localDb.conditions = this.localDb.conditions || [];
    const index = this.localDb.conditions.findIndex(c => c.id === id && c.userId === userId);
    if (index === -1) return null;

    this.localDb.conditions[index] = {
      ...this.localDb.conditions[index],
      ...updates
    };
    this.saveLocalData(this.localDb);

    if (supabase) {
      try {
        const supUpdates: any = {};
        if (updates.title) supUpdates.title = updates.title;
        if (updates.category) supUpdates.category = updates.category;
        if (updates.startDate) supUpdates.start_date = updates.startDate;
        if (updates.endDate !== undefined) supUpdates.end_date = updates.endDate;
        if (updates.isOngoing !== undefined) supUpdates.is_ongoing = updates.isOngoing;
        if (updates.status) supUpdates.status = updates.status;
        if (updates.severity) supUpdates.severity = updates.severity;
        if (updates.symptoms) supUpdates.symptoms = updates.symptoms;
        if (updates.diagnosis) supUpdates.diagnosis = updates.diagnosis;
        if (updates.treatingDoctor !== undefined) supUpdates.treating_doctor = updates.treatingDoctor;
        if (updates.hospital !== undefined) supUpdates.hospital = updates.hospital;
        if (updates.outcome !== undefined) supUpdates.outcome = updates.outcome;
        if (updates.linkedRecordIds !== undefined) supUpdates.linked_record_ids = updates.linkedRecordIds;

        await supabase.from('health_conditions').update(supUpdates).eq('id', id).eq('user_id', userId);
      } catch (err) {
        console.error('Supabase updateCondition exception:', err);
      }
    }

    return this.localDb.conditions[index];
  }

  public async deleteCondition(id: string, userId: string): Promise<boolean> {
    this.localDb.conditions = this.localDb.conditions || [];
    const initialLen = this.localDb.conditions.length;
    this.localDb.conditions = this.localDb.conditions.filter(c => !(c.id === id && c.userId === userId));
    this.saveLocalData(this.localDb);

    if (supabase) {
      try {
        await supabase.from('health_conditions').delete().eq('id', id).eq('user_id', userId);
      } catch (err) {
        console.error('Supabase deleteCondition exception:', err);
      }
    }

    return this.localDb.conditions.length < initialLen;
  }

  // --- Vaccinations ---

  public async getVaccinations(userId: string): Promise<VaccinationRecord[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('vaccinations')
          .select('*')
          .eq('user_id', userId)
          .order('date_administered', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(v => ({
            id: v.id,
            userId: v.user_id,
            vaccineName: v.vaccine_name,
            targetDisease: v.target_disease,
            doseNumber: v.dose_number,
            totalDoses: v.total_doses,
            dateAdministered: v.date_administered,
            nextDueDate: v.next_due_date,
            manufacturer: v.manufacturer,
            batchNumber: v.batch_number,
            clinic: v.clinic,
            status: v.status,
            certificateUrl: v.certificate_url,
            createdAt: v.created_at
          }));
        }
      } catch (err) {
        console.warn('Supabase getVaccinations fallback:', err);
      }
    }
    return (this.localDb.vaccinations || []).filter(v => v.userId === userId);
  }

  public async addVaccination(vaccination: VaccinationRecord): Promise<VaccinationRecord> {
    this.localDb.vaccinations = this.localDb.vaccinations || [];
    this.localDb.vaccinations.unshift(vaccination);
    this.saveLocalData(this.localDb);

    if (supabase) {
      try {
        const { error } = await supabase.from('vaccinations').insert({
          id: vaccination.id,
          user_id: vaccination.userId,
          vaccine_name: vaccination.vaccineName,
          target_disease: vaccination.targetDisease,
          dose_number: vaccination.doseNumber,
          total_doses: vaccination.totalDoses,
          date_administered: vaccination.dateAdministered,
          next_due_date: vaccination.nextDueDate,
          manufacturer: vaccination.manufacturer,
          batch_number: vaccination.batchNumber,
          clinic: vaccination.clinic,
          status: vaccination.status,
          certificate_url: vaccination.certificateUrl,
          created_at: vaccination.createdAt || new Date().toISOString()
        });
        if (error) console.error('Supabase addVaccination error:', error);
      } catch (err) {
        console.error('Supabase addVaccination exception:', err);
      }
    }

    return vaccination;
  }

  public async deleteVaccination(id: string, userId: string): Promise<boolean> {
    this.localDb.vaccinations = this.localDb.vaccinations || [];
    const initialLen = this.localDb.vaccinations.length;
    this.localDb.vaccinations = this.localDb.vaccinations.filter(v => !(v.id === id && v.userId === userId));
    this.saveLocalData(this.localDb);

    if (supabase) {
      try {
        await supabase.from('vaccinations').delete().eq('id', id).eq('user_id', userId);
      } catch (err) {
        console.error('Supabase deleteVaccination exception:', err);
      }
    }

    return this.localDb.vaccinations.length < initialLen;
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
            weightKg: v.weight_kg
          }));
        }
      } catch (err) {
        console.warn('Supabase getVitals fallback:', err);
      }
    }
    return this.localDb.vitals.filter(v => v.userId === userId);
  }

  public async addVital(vital: VitalRecord): Promise<VitalRecord> {
    this.localDb.vitals.push(vital);
    this.saveLocalData(this.localDb);

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

  // --- Multi-Tier QR Access Tokens ---

  public async createEmergencyToken(access: EmergencyAccess): Promise<EmergencyAccess> {
    this.localDb.emergencyTokens = this.localDb.emergencyTokens.filter(t => t.token !== access.token);
    this.localDb.emergencyTokens.push(access);
    this.saveLocalData(this.localDb);

    if (supabase) {
      try {
        const { error } = await supabase.from('emergency_access').insert({
          token: access.token,
          patient_id: access.patientId,
          patient_name: access.patientName,
          blood_group: access.bloodGroup,
          allergies: access.allergies,
          conditions: access.conditions,
          emergency_contact: access.emergencyContact,
          expires_at: access.expiresAt,
          type: access.type || 'emergency',
          created_at: access.createdAt || new Date().toISOString()
        });
        if (error) console.error('Supabase createEmergencyToken error:', error);
      } catch (err) {
        console.error('Supabase createEmergencyToken exception:', err);
      }
    }

    return access;
  }

  public async getUserEmergencyTokens(patientId: string): Promise<EmergencyAccess[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('emergency_access')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(d => ({
            token: d.token,
            patientId: d.patient_id,
            patientName: d.patient_name,
            bloodGroup: d.blood_group,
            allergies: Array.isArray(d.allergies) ? d.allergies : [],
            conditions: Array.isArray(d.conditions) ? d.conditions : [],
            emergencyContact: typeof d.emergency_contact === 'object' ? d.emergency_contact : { name: '', relation: '', phone: '' },
            expiresAt: d.expires_at,
            type: d.type || 'emergency',
            active: new Date(d.expires_at) > new Date()
          }));
        }
      } catch (err) {
        console.warn('Supabase getUserEmergencyTokens fallback:', err);
      }
    }

    return (this.localDb.emergencyTokens || []).filter(t => t.patientId === patientId);
  }

  public async revokeEmergencyToken(token: string, patientId: string): Promise<boolean> {
    this.localDb.emergencyTokens = this.localDb.emergencyTokens.filter(t => !(t.token === token && t.patientId === patientId));
    this.saveLocalData(this.localDb);

    if (supabase) {
      try {
        await supabase.from('emergency_access').delete().eq('token', token).eq('patient_id', patientId);
      } catch (err) {
        console.error('Supabase revokeEmergencyToken exception:', err);
      }
    }

    return true;
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
              expiresAt: data.expires_at,
              type: data.type || 'emergency'
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
