export interface DepartmentItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  commonSymptoms: string[];
  totalQuestions: number;
  languagesSupported: { code: string; label: string }[];
}

export const DEFAULT_DEPARTMENTS: DepartmentItem[] = [
  {
    id: "dental",
    name: "Dental & Maxillofacial",
    category: "Dental",
    description: "Toothache, gum bleeding, sensitivity, swelling, and oral surgery pre-assessment.",
    icon: "Smile",
    commonSymptoms: ["Toothache", "Bleeding gums", "Hot/Cold sensitivity", "Jaw pain", "Swelling"],
    totalQuestions: 8,
    languagesSupported: [
      { code: "en", label: "English" },
      { code: "ta", label: "தமிழ் (Tamil)" },
      { code: "hi", label: "हिंदी (Hindi)" }
    ]
  },
  {
    id: "cardiology",
    name: "Cardiology",
    category: "Cardiovascular",
    description: "Chest discomfort, palpitations, shortness of breath, hypertension, and syncope.",
    icon: "HeartPulse",
    commonSymptoms: ["Chest tightness", "Palpitations", "Shortness of breath on exertion", "Dizziness", "Ankle swelling"],
    totalQuestions: 8,
    languagesSupported: [
      { code: "en", label: "English" },
      { code: "ta", label: "தமிழ் (Tamil)" },
      { code: "hi", label: "हिंदी (Hindi)" }
    ]
  },
  {
    id: "orthopedics",
    name: "Orthopedics & Joint Care",
    category: "Musculoskeletal",
    description: "Joint pain, knee osteoarthritis, lumbar disc spine issues, fractures, and stiffness.",
    icon: "Bone",
    commonSymptoms: ["Knee pain", "Lower back ache", "Joint stiffness", "Difficulty walking", "Post-injury trauma"],
    totalQuestions: 8,
    languagesSupported: [
      { code: "en", label: "English" },
      { code: "ta", label: "தமிழ் (Tamil)" },
      { code: "hi", label: "हिंदी (Hindi)" }
    ]
  },
  {
    id: "ophthalmology",
    name: "Ophthalmology (Eye Clinic)",
    category: "Vision",
    description: "Blurry vision, eye redness, irritation, floaters, cataracts, and visual strain.",
    icon: "Eye",
    commonSymptoms: ["Blurry vision", "Red eye", "Watery discharge", "Eye strain", "Halos around light"],
    totalQuestions: 7,
    languagesSupported: [
      { code: "en", label: "English" },
      { code: "ta", label: "தமிழ் (Tamil)" },
      { code: "hi", label: "हिंदी (Hindi)" }
    ]
  },
  {
    id: "dermatology",
    name: "Dermatology (Skin & Hair)",
    category: "Dermatology",
    description: "Skin rashes, itching, eczema, acne, hair loss, and allergic lesions.",
    icon: "Sparkles",
    commonSymptoms: ["Itchy rash", "Red patches", "Acne breakouts", "Scaling skin", "Hair thinning"],
    totalQuestions: 7,
    languagesSupported: [
      { code: "en", label: "English" },
      { code: "ta", label: "தமிழ் (Tamil)" },
      { code: "hi", label: "हिंदी (Hindi)" }
    ]
  },
  {
    id: "ent",
    name: "ENT (Ear, Nose & Throat)",
    category: "ENT",
    description: "Earache, nasal congestion, sinus pressure, sore throat, and hearing changes.",
    icon: "Ear",
    commonSymptoms: ["Sore throat", "Sinus congestion", "Ear pain", "Tinnitus / Ringing", "Loss of smell"],
    totalQuestions: 7,
    languagesSupported: [
      { code: "en", label: "English" },
      { code: "ta", label: "தமிழ் (Tamil)" },
      { code: "hi", label: "हिंदी (Hindi)" }
    ]
  },
  {
    id: "pulmonology",
    name: "Pulmonology & Respiratory",
    category: "Respiratory",
    description: "Persistent cough, wheezing, asthma, bronchitis, and chest tightness.",
    icon: "Wind",
    commonSymptoms: ["Chronic cough", "Wheezing", "Phlegm production", "Breathlessness", "Night cough"],
    totalQuestions: 8,
    languagesSupported: [
      { code: "en", label: "English" },
      { code: "ta", label: "தமிழ் (Tamil)" },
      { code: "hi", label: "हिंदी (Hindi)" }
    ]
  },
  {
    id: "gastroenterology",
    name: "Gastroenterology",
    category: "Gastrointestinal",
    description: "Abdominal pain, acidity, GERD, nausea, bloating, and digestive irregularities.",
    icon: "Soup",
    commonSymptoms: ["Acid reflux / heartburn", "Stomach ache", "Bloating", "Nausea", "Altered bowel habits"],
    totalQuestions: 8,
    languagesSupported: [
      { code: "en", label: "English" },
      { code: "ta", label: "தமிழ் (Tamil)" },
      { code: "hi", label: "हिंदी (Hindi)" }
    ]
  },
  {
    id: "general_medicine",
    name: "General Medicine / Internal Care",
    category: "General",
    description: "Fever, body fatigue, viral illness, unexplained weight changes, and health check-up.",
    icon: "Stethoscope",
    commonSymptoms: ["High fever", "Generalized weakness", "Body aches", "Headache", "Loss of appetite"],
    totalQuestions: 8,
    languagesSupported: [
      { code: "en", label: "English" },
      { code: "ta", label: "தமிழ் (Tamil)" },
      { code: "hi", label: "हिंदी (Hindi)" }
    ]
  },
  {
    id: "ayurveda_wellness",
    name: "Ayurvedic & Holistic Wellness",
    category: "Integrative",
    description: "Holistic Prakriti analysis, chronic vitality, digestive Agni, stress, and lifestyle consultation.",
    icon: "Leaf",
    commonSymptoms: ["Chronic stress", "Poor digestion (Manda Agni)", "Sleep disturbance", "Joint stiffness", "Fatigue"],
    totalQuestions: 7,
    languagesSupported: [
      { code: "en", label: "English" },
      { code: "ta", label: "தமிழ் (Tamil)" },
      { code: "hi", label: "हिंदी (Hindi)" }
    ]
  }
];
