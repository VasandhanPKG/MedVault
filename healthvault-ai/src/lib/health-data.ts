export type RecordStatus = "processed" | "processing" | "failed";

export type MedicalRecord = {
  id: string;
  name: string;
  date: string;
  type: string;
  category: "Lab Report" | "Imaging" | "Prescription" | "Vaccination" | "Discharge Summary";
  status: RecordStatus;
  size: string;
  summary: string;
};

export const patient = {
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
    phone: "+91 98111 20034",
  },
};

export const medicalRecords: MedicalRecord[] = [
  {
    id: "rec-1",
    name: "Complete Blood Count (CBC)",
    date: "2026-07-28",
    type: "PDF",
    category: "Lab Report",
    status: "processed",
    size: "412 KB",
    summary: "Hemoglobin 14.2 g/dL, WBC 7.1 K/µL — all values within normal reference range.",
  },
  {
    id: "rec-2",
    name: "HbA1c & Fasting Glucose Panel",
    date: "2026-07-12",
    type: "PDF",
    category: "Lab Report",
    status: "processed",
    size: "298 KB",
    summary: "HbA1c 5.9% — borderline. Fasting glucose 104 mg/dL, trending down from last quarter.",
  },
  {
    id: "rec-3",
    name: "Lipid Profile",
    date: "2026-06-30",
    type: "PDF",
    category: "Lab Report",
    status: "processed",
    size: "355 KB",
    summary: "LDL 128 mg/dL slightly elevated; HDL 51 mg/dL healthy.",
  },
  {
    id: "rec-4",
    name: "Chest X-Ray (PA View)",
    date: "2026-06-04",
    type: "JPG",
    category: "Imaging",
    status: "processed",
    size: "2.1 MB",
    summary: "Clear lung fields, no active infiltrates reported.",
  },
  {
    id: "rec-5",
    name: "Vitamin D & B12 Assay",
    date: "2026-05-19",
    type: "PDF",
    category: "Lab Report",
    status: "processing",
    size: "188 KB",
    summary: "Document is being analysed by MedVault AI.",
  },
  {
    id: "rec-6",
    name: "Metformin 500mg Prescription",
    date: "2026-05-02",
    type: "PDF",
    category: "Prescription",
    status: "processed",
    size: "96 KB",
    summary: "Dr. R. Iyer — 500 mg once daily after dinner for 90 days.",
  },
  {
    id: "rec-7",
    name: "Influenza Vaccination Certificate",
    date: "2026-03-11",
    type: "PDF",
    category: "Vaccination",
    status: "processed",
    size: "74 KB",
    summary: "Quadrivalent influenza vaccine administered, batch FLU-2261.",
  },
  {
    id: "rec-8",
    name: "Day-Care Discharge Summary",
    date: "2025-12-21",
    type: "PDF",
    category: "Discharge Summary",
    status: "processed",
    size: "521 KB",
    summary: "Observation for acute gastritis, discharged stable within 24 hours.",
  },
];

export const recordCategories = [
  "All",
  "Lab Report",
  "Imaging",
  "Prescription",
  "Vaccination",
  "Discharge Summary",
] as const;

export const trends = {
  hba1c: [
    { month: "Feb", value: 6.4 },
    { month: "Mar", value: 6.3 },
    { month: "Apr", value: 6.2 },
    { month: "May", value: 6.1 },
    { month: "Jun", value: 6.0 },
    { month: "Jul", value: 5.9 },
  ],
  glucose: [
    { month: "Feb", fasting: 118, postMeal: 168 },
    { month: "Mar", fasting: 114, postMeal: 161 },
    { month: "Apr", fasting: 112, postMeal: 155 },
    { month: "May", fasting: 109, postMeal: 149 },
    { month: "Jun", fasting: 106, postMeal: 144 },
    { month: "Jul", fasting: 104, postMeal: 138 },
  ],
  cholesterol: [
    { month: "Feb", ldl: 142, hdl: 44, total: 214 },
    { month: "Mar", ldl: 139, hdl: 45, total: 209 },
    { month: "Apr", ldl: 136, hdl: 47, total: 204 },
    { month: "May", ldl: 133, hdl: 48, total: 199 },
    { month: "Jun", ldl: 130, hdl: 50, total: 195 },
    { month: "Jul", ldl: 128, hdl: 51, total: 192 },
  ],
  vitaminD: [
    { month: "Feb", value: 17 },
    { month: "Mar", value: 19 },
    { month: "Apr", value: 23 },
    { month: "May", value: 26 },
    { month: "Jun", value: 29 },
    { month: "Jul", value: 31 },
  ],
  bloodPressure: [
    { month: "Feb", systolic: 132, diastolic: 86 },
    { month: "Mar", systolic: 130, diastolic: 85 },
    { month: "Apr", systolic: 128, diastolic: 84 },
    { month: "May", systolic: 126, diastolic: 82 },
    { month: "Jun", systolic: 124, diastolic: 81 },
    { month: "Jul", systolic: 122, diastolic: 79 },
  ],
  bmi: [
    { month: "Feb", value: 25.6 },
    { month: "Mar", value: 25.3 },
    { month: "Apr", value: 25.1 },
    { month: "May", value: 24.8 },
    { month: "Jun", value: 24.5 },
    { month: "Jul", value: 24.0 },
  ],
};

export const aiInsights = [
  {
    title: "HbA1c improving steadily",
    body: "Your HbA1c has dropped 0.5% over six months. Maintaining your current routine could bring you into the normal range by October.",
    tone: "positive" as const,
  },
  {
    title: "LDL cholesterol still above target",
    body: "LDL is 128 mg/dL against a target of under 100 mg/dL. Consider discussing dietary fat intake at your next consultation.",
    tone: "watch" as const,
  },
  {
    title: "Vitamin D recovering",
    body: "Levels rose from 17 to 31 ng/mL since supplementation began. A repeat test in 8 weeks is recommended.",
    tone: "positive" as const,
  },
];

export const riskFactors = [
  { label: "Metabolic (Type 2 diabetes)", score: 38, level: "Moderate" },
  { label: "Cardiovascular", score: 24, level: "Low" },
  { label: "Nutritional deficiency", score: 41, level: "Moderate" },
  { label: "Respiratory", score: 11, level: "Low" },
  { label: "Lifestyle & activity", score: 29, level: "Low" },
];

export const recommendations = [
  "Walk 7,000+ steps daily — your BMI trend responds well to consistent activity.",
  "Keep vitamin D supplementation going until the next assay in 8 weeks.",
  "Swap two refined-carb meals a week for high-fibre alternatives to support HbA1c.",
  "Repeat your lipid profile in 3 months to confirm the downward LDL trend.",
];

export const suggestedQuestions = [
  "Explain my blood report",
  "Show my sugar trend",
  "Summarize my medical history",
  "What do my cholesterol numbers mean?",
];

export const assistantReplies: Record<string, string> = {
  "explain my blood report":
    "Your most recent **Complete Blood Count (28 Jul 2026)** looks healthy. Hemoglobin is 14.2 g/dL (normal 13.5–17.5), white cells 7.1 K/µL and platelets 245 K/µL — all comfortably within range. There is no sign of anaemia or active infection in this panel.",
  "show my sugar trend":
    "Over the last 6 months your **HbA1c fell from 6.4% to 5.9%** and fasting glucose from 118 to 104 mg/dL. That is a consistent month-over-month improvement and moves you from the diabetic range toward pre-diabetes. Staying on this path could reach a normal HbA1c (<5.7%) around October.",
  "summarize my medical history":
    "You have 8 records on file spanning Dec 2025 – Jul 2026. Key themes: **pre-diabetes** under active management with metformin, **vitamin D deficiency** now recovering (17 → 31 ng/mL), and **mildly elevated LDL** at 128 mg/dL. Imaging and blood counts are unremarkable, and you are up to date on influenza vaccination.",
};

export const defaultAssistantReply =
  "Based on the records in your vault, here is what I can see: your metabolic markers are improving, cholesterol needs continued attention, and vitamin D is recovering well. Ask me about a specific report or metric and I'll break it down in plain language.\n\n*MedVault AI provides health information, not medical diagnosis. Always confirm with your clinician.*";
