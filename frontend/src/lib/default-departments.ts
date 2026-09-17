export interface DepartmentOption {
  label: string;
  value: string;
  tamilLabel?: string;
  hindiLabel?: string;
}

export interface DepartmentQuestion {
  id: string;
  slotKey: string;
  question: {
    en: string;
    ta: string;
    hi: string;
  };
  inputType: "choice" | "multi-choice" | "text" | "scale" | "location";
  options?: DepartmentOption[];
  isRequired: boolean;
}

export interface DepartmentItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  commonSymptoms: string[];
  totalQuestions: number;
  languagesSupported: { code: string; label: string }[];
  questions?: DepartmentQuestion[];
}

export const DEPARTMENT_QUESTIONS_MAP: Record<string, DepartmentQuestion[]> = {
  dental: [
    {
      id: "dent_q1",
      slotKey: "chiefComplaint",
      question: {
        en: "What is the primary dental issue you are experiencing today?",
        ta: "இன்று நீங்கள் சந்திக்கும் முதன்மையான பல் பிரச்சனை என்ன?",
        hi: "आज आपको दांतों में मुख्य रूप से क्या समस्या महसूस हो रही है?"
      },
      inputType: "choice",
      options: [
        { label: "Toothache / Sharp Pain", value: "toothache", tamilLabel: "பல் வலி", hindiLabel: "दांत दर्द" },
        { label: "Hot or Cold Sensitivity", value: "sensitivity", tamilLabel: "சூடு/குளிர் கூச்சம்", hindiLabel: "संवेदनशीलता (Sensitivity)" },
        { label: "Swollen or Bleeding Gums", value: "gum_issues", tamilLabel: "ஈறு வீக்கம் / ரத்தம்", hindiLabel: "मसूड़ों में सूजन या खून" },
        { label: "Broken / Chipped Tooth", value: "chipped_tooth", tamilLabel: "உடைந்த பல்", hindiLabel: "टूटा हुआ दांत" },
        { label: "Wisdom Tooth / Jaw Pain", value: "wisdom_jaw", tamilLabel: "தாடை வலி / ஞானப்பல்", hindiLabel: "अक्ल दाढ़ / जबड़े का दर्द" },
        { label: "General Checkup / Cleaning", value: "routine_checkup", tamilLabel: "வழக்கமான பரிசோதனை", hindiLabel: "सामान्य जांच" }
      ],
      isRequired: true
    },
    {
      id: "dent_q2",
      slotKey: "painLocation",
      question: {
        en: "Where exactly is the discomfort or pain located in your mouth?",
        ta: "உங்கள் வாயில் எந்த பகுதியில் வலி அல்லது அசௌகரியம் உள்ளது?",
        hi: "मुंह में ठीक किस जगह पर दर्द या तकलीफ हो रही है?"
      },
      inputType: "choice",
      options: [
        { label: "Upper Right (Molar / Premolar)", value: "upper_right", tamilLabel: "மேல் வலது புறம்", hindiLabel: "ऊपरी दाहिना हिस्सा" },
        { label: "Upper Left (Molar / Premolar)", value: "upper_left", tamilLabel: "மேல் இடது புறம்", hindiLabel: "ऊपरी बायां हिस्सा" },
        { label: "Lower Right (Back Tooth)", value: "lower_right", tamilLabel: "கீழ் வலது புறம்", hindiLabel: "निचला दाहिना हिस्सा" },
        { label: "Lower Left (Back Tooth)", value: "lower_left", tamilLabel: "கீழ் இடது புறம்", hindiLabel: "निचला बायां हिस्सा" },
        { label: "Front Teeth (Upper or Lower)", value: "front_teeth", tamilLabel: "முன் பற்கள்", hindiLabel: "सामने के दांत" },
        { label: "Entire Jaw / Generalized Pain", value: "generalized", tamilLabel: "முழு தாடை / பரவலான வலி", hindiLabel: "पूरे जबड़े में" }
      ],
      isRequired: true
    },
    {
      id: "dent_q3",
      slotKey: "duration",
      question: {
        en: "How long have you had this dental symptom?",
        ta: "இந்த பிரச்சனை எத்தனை நாட்களாக உள்ளது?",
        hi: "यह समस्या कितने समय से है?"
      },
      inputType: "choice",
      options: [
        { label: "Started Today / Sudden", value: "today", tamilLabel: "இன்றுதான் தொடங்கியது", hindiLabel: "आज ही शुरू हुआ" },
        { label: "2 to 3 Days", value: "few_days", tamilLabel: "2-3 நாட்களாக", hindiLabel: "2-3 दिनों से" },
        { label: "1 to 2 Weeks", value: "weeks", tamilLabel: "1-2 வாரங்களாக", hindiLabel: "1-2 सप्ताह से" },
        { label: "More than a Month", value: "chronic", tamilLabel: "ஒரு மாதத்திற்கும் மேலாக", hindiLabel: "एक महीने से अधिक" }
      ],
      isRequired: true
    },
    {
      id: "dent_q4",
      slotKey: "painSeverity",
      question: {
        en: "How would you rate the pain severity on a scale of 1 to 10?",
        ta: "வலியின் தீவிரத்தை 1 முதல் 10 வரை எவ்வாறு மதிப்பிடுவீர்கள்?",
        hi: "दर्द की तीव्रता को 1 से 10 के पैमाने पर कैसे आंकेंगे?"
      },
      inputType: "scale",
      options: [
        { label: "1 - 3 (Mild Discomfort)", value: "mild", tamilLabel: "லேசான வலி", hindiLabel: "हल्का दर्द" },
        { label: "4 - 6 (Moderate / Distracting)", value: "moderate", tamilLabel: "மிதமான வலி", hindiLabel: "मध्यम दर्द" },
        { label: "7 - 8 (Severe / Throbbing)", value: "severe", tamilLabel: "கடுமையான வலி", hindiLabel: "तीव्र दर्द" },
        { label: "9 - 10 (Unbearable Emergency)", value: "emergency", tamilLabel: "தாங்க முடியாத அவசர வலி", hindiLabel: "असहनीय दर्द" }
      ],
      isRequired: true
    },
    {
      id: "dent_q5",
      slotKey: "triggersHotCold",
      question: {
        en: "Does hot, cold, or sweet food trigger or worsen the pain?",
        ta: "சூடான, குளிர்ந்த அல்லது இனிப்பான உணவுகள் வலியை அதிகரிக்கிறதா?",
        hi: "क्या गर्म, ठंडा या मीठा खाने से दर्द बढ़ता है?"
      },
      inputType: "choice",
      options: [
        { label: "Yes, Sharp pain with Cold items", value: "cold_sensitive", tamilLabel: "ஆம், குளிர்ந்த பொருட்களால் கூச்சம்", hindiLabel: "हां, ठंडे से तेज दर्द" },
        { label: "Yes, Lingering pain with Hot drinks", value: "hot_sensitive", tamilLabel: "ஆம், சூடான பானங்களால் வலி நீடிக்கிறது", hindiLabel: "हां, गर्म से दर्द" },
        { label: "Yes, Both Hot and Cold", value: "both_sensitive", tamilLabel: "ஆம், சூடு மற்றும் குளிர் இரண்டிலும்", hindiLabel: "हां, दोनों से" },
        { label: "No sensitivity triggers", value: "no_trigger", tamilLabel: "இல்லை, கூச்சம் இல்லை", hindiLabel: "नहीं, कोई ट्रिगर नहीं" }
      ],
      isRequired: true
    },
    {
      id: "dent_q6",
      slotKey: "chewingPain",
      question: {
        en: "Do you experience sharp pain when biting down or chewing food?",
        ta: "உணவை மெல்லும்போதோ கடிக்கும்போதோ வலி ஏற்படுகிறதா?",
        hi: "क्या खाना चबाने या काटने पर दर्द होता है?"
      },
      inputType: "choice",
      options: [
        { label: "Yes, cannot chew on that side", value: "cannot_chew", tamilLabel: "ஆம், அந்த பக்கம் மெல்லவே முடியாது", hindiLabel: "हां, उस तरफ चबा नहीं सकते" },
        { label: "Mild discomfort while chewing", value: "mild_chewing", tamilLabel: "மெல்லும்போது லேசான வலி", hindiLabel: "चबाते समय हल्का दर्द" },
        { label: "No pain while chewing", value: "none", tamilLabel: "இல்லை, மெல்லும்போது வலி இல்லை", hindiLabel: "नहीं, चबाने पर कोई दर्द नहीं" }
      ],
      isRequired: true
    },
    {
      id: "dent_q7",
      slotKey: "swelling",
      question: {
        en: "Is there any visible swelling in your gums, cheek, or jaw?",
        ta: "உங்கள் ஈறுகள், கன்னம் அல்லது தாடையில் ஏதேனும் வீக்கம் உள்ளதா?",
        hi: "क्या मसूड़ों, गाल या जबड़े में कोई सूजन है?"
      },
      inputType: "choice",
      options: [
        { label: "No swelling", value: "none", tamilLabel: "வீக்கம் இல்லை", hindiLabel: "कोई सूजन नहीं" },
        { label: "Mild gum swelling near tooth", value: "gum_localized", tamilLabel: "பல்லின் அருகில் லேசான ஈறு வீக்கம்", hindiLabel: "दांत के पास हल्की सूजन" },
        { label: "Visible facial/cheek swelling", value: "facial_swelling", tamilLabel: "கன்னத்தில் தெரியும் வீக்கம்", hindiLabel: "गाल पर स्पष्ट सूजन" }
      ],
      isRequired: true
    },
    {
      id: "dent_q8",
      slotKey: "bleeding",
      question: {
        en: "Do your gums bleed when brushing or flossing?",
        ta: "பல் துலக்கும்போது அல்லது சுத்தம் செய்யும்போது ஈறுகளில் ரத்தம் வருகிறதா?",
        hi: "क्या ब्रश करते समय मसूड़ों से खून आता है?"
      },
      inputType: "choice",
      options: [
        { label: "Yes, frequently while brushing", value: "frequent", tamilLabel: "ஆம், துலக்கும்போது அடிக்கடி ரத்தம்", hindiLabel: "हां, ब्रश करते समय बार-बार" },
        { label: "Occasionally / Spontaneous", value: "occasional", tamilLabel: "எப்போதாவது", hindiLabel: "कभी-कभार" },
        { label: "No bleeding", value: "none", tamilLabel: "ரத்தப்போக்கு இல்லை", hindiLabel: "कोई खून नहीं" }
      ],
      isRequired: true
    }
  ],
  cardiology: [
    {
      id: "cardio_q1",
      slotKey: "chiefComplaint",
      question: {
        en: "What cardiac or chest symptoms are you feeling today?",
        ta: "இன்று நீங்கள் உணரும் மார்பு அல்லது இதய அறிகுறிகள் என்ன?",
        hi: "आज आपको हृदय या छाती में क्या लक्षण महसूस हो रहे हैं?"
      },
      inputType: "choice",
      options: [
        { label: "Chest Pressure / Tightness", value: "chest_tightness", tamilLabel: "மார்பு அழுத்தம் / இறுக்கம்", hindiLabel: "छाती में जकड़न / भारीपन" },
        { label: "Racing Heartbeat / Palpitations", value: "palpitations", tamilLabel: "படபடப்பு / வேகமான இதயத்துடிப்பு", hindiLabel: "दिल की धड़कन तेज होना" },
        { label: "Shortness of Breath on Walking", value: "dyspnea_exertion", tamilLabel: "நடக்கும்போது மூச்சுத்திணறல்", hindiLabel: "चलने पर सांस फूलना" },
        { label: "Dizziness or Lightheadedness", value: "dizziness", tamilLabel: "தலைச்சுற்றல் / மயக்கம்", hindiLabel: "चक्कर आना / कमजोरी" },
        { label: "High Blood Pressure Check", value: "hypertension_check", tamilLabel: "ரத்த அழுத்த பரிசோதனை", hindiLabel: "हाई ब्लड प्रेशर जांच" }
      ],
      isRequired: true
    },
    {
      id: "cardio_q2",
      slotKey: "duration",
      question: {
        en: "When did this symptom start or how often does it happen?",
        ta: "இந்த அறிகுறி எப்போது தொடங்கியது அல்லது எவ்வளவு அடிக்கடி ஏற்படுகிறது?",
        hi: "यह लक्षण कब शुरू हुआ या कितनी बार होता है?"
      },
      inputType: "choice",
      options: [
        { label: "Just started in the last hour", value: "acute_hour", tamilLabel: "கடந்த ஒரு மணி நேரத்திற்குள்", hindiLabel: "पिछले 1 घंटे में शुरू हुआ" },
        { label: "Happens daily during activity", value: "daily_exertion", tamilLabel: "வேலை செய்யும்போது தினமும்", hindiLabel: "रोजाना काम करते समय" },
        { label: "Intermittent over the past few weeks", value: "intermittent_weeks", tamilLabel: "சில வாரங்களாக அவ்வப்போது", hindiLabel: "पिछले कुछ हफ्तों से रुक-रुक कर" }
      ],
      isRequired: true
    },
    {
      id: "cardio_q3",
      slotKey: "painRadiation",
      question: {
        en: "Does the discomfort spread to your left arm, jaw, neck, or back?",
        ta: "வலி இடது கை, தாடை, கழுத்து அல்லது முதுகுக்கு பரவுகிறதா?",
        hi: "क्या दर्द बाएं हाथ, जबड़े, गर्दन या पीठ की तरफ फैलता है?"
      },
      inputType: "choice",
      options: [
        { label: "No radiation (stays in chest)", value: "localized", tamilLabel: "இல்லை, மார்பிலேயே உள்ளது", hindiLabel: "नहीं, केवल छाती में" },
        { label: "Spreads to Left Arm & Shoulder", value: "left_arm", tamilLabel: "இடது கை மற்றும் தோள்பட்டைக்கு பரவுகிறது", hindiLabel: "बाएं हाथ और कंधे की तरफ" },
        { label: "Spreads to Jaw and Neck", value: "jaw_neck", tamilLabel: "தாடை மற்றும் கழுத்துக்கு பரவுகிறது", hindiLabel: "जबड़े और गर्दन की तरफ" },
        { label: "Spreads to Upper Back", value: "back", tamilLabel: "மேல் முதுகுக்கு பரவுகிறது", hindiLabel: "पीठ के ऊपरी हिस्से की तरफ" }
      ],
      isRequired: true
    },
    {
      id: "cardio_q4",
      slotKey: "associatedSymptoms",
      question: {
        en: "Do you have any sweating, nausea, or swelling in your ankles?",
        ta: "அதிக வியர்வை, குமட்டல் அல்லது கணுக்கால் வீக்கம் உள்ளதா?",
        hi: "क्या पसीना आना, उल्टी जैसा लगना या टखनों में सूजन है?"
      },
      inputType: "choice",
      options: [
        { label: "None of these", value: "none", tamilLabel: "இவை எதுவும் இல்லை", hindiLabel: "इनमें से कोई नहीं" },
        { label: "Cold Sweats & Nausea", value: "sweats_nausea", tamilLabel: "குளிர்ந்த வியர்வை & குமட்டல்", hindiLabel: "ठंडा पसीना और उल्टी जैसा" },
        { label: "Swollen Ankles / Feet", value: "ankle_edema", tamilLabel: "கணுக்கால் / கால் வீக்கம்", hindiLabel: "पैरों या टखनों में सूजन" }
      ],
      isRequired: true
    }
  ],
  orthopedics: [
    {
      id: "ortho_q1",
      slotKey: "chiefComplaint",
      question: {
        en: "Which joint or musculoskeletal area is causing pain?",
        ta: "எந்த மூட்டு அல்லது தசை பகுதியில் வலி உள்ளது?",
        hi: "किस जोड़ या हड्डी/मांसपेशी में दर्द हो रहा है?"
      },
      inputType: "choice",
      options: [
        { label: "Knee Joint Pain", value: "knee", tamilLabel: "முழங்கால் வலி", hindiLabel: "घुटने का दर्द" },
        { label: "Lower Back / Spine Ache", value: "lower_back", tamilLabel: "இடுப்பு / கீழ் முதுகு வலி", hindiLabel: "कमर / रीढ़ का दर्द" },
        { label: "Shoulder / Rotator Cuff Pain", value: "shoulder", tamilLabel: "தோள்பட்டை வலி", hindiLabel: "कंधे का दर्द" },
        { label: "Neck & Upper Spine Stiffness", value: "neck", tamilLabel: "கழுத்து வலி / பிடிப்பு", hindiLabel: "गर्दन का दर्द" },
        { label: "Ankle / Foot Strain", value: "ankle", tamilLabel: "கணுக்கால் / பாத வலி", hindiLabel: "टखने या पैर का दर्द" }
      ],
      isRequired: true
    },
    {
      id: "ortho_q2",
      slotKey: "duration",
      question: {
        en: "How long have you had this joint or back pain?",
        ta: "இந்த வலி எவ்வளவு காலமாக உள்ளது?",
        hi: "यह दर्द कितने समय से है?"
      },
      inputType: "choice",
      options: [
        { label: "Recent injury or fall (1-2 days)", value: "recent_trauma", tamilLabel: "சமீபத்திய காயம் / விழுந்ததால்", hindiLabel: "हाल ही में चोट या गिरने से" },
        { label: "1 to 4 Weeks", value: "subacute", tamilLabel: "1 முதல் 4 வாரங்கள்", hindiLabel: "1 से 4 सप्ताह" },
        { label: "Chronic (Several months to years)", value: "chronic", tamilLabel: "நீண்ட காலமாக (மாதங்கள்/வருடங்கள்)", hindiLabel: "काफी समय से (महीनों या सालों से)" }
      ],
      isRequired: true
    },
    {
      id: "ortho_q3",
      slotKey: "mobilityImpact",
      question: {
        en: "Does this pain restrict your walking or daily activities?",
        ta: "இந்த வலி நடப்பதற்கோ அன்றாட வேலைகளுக்கோ தடையாக உள்ளதா?",
        hi: "क्या यह दर्द चलने-फिरने या रोजमर्रा के कामों में रुकावट डालता है?"
      },
      inputType: "choice",
      options: [
        { label: "Severe - Cannot bear weight / walk", value: "cannot_walk", tamilLabel: "கடுமையானது - நடக்கவே முடியவில்லை", hindiLabel: "गंभीर - चल नहीं पा रहे" },
        { label: "Moderate - Pain while climbing stairs", value: "stairs_pain", tamilLabel: "மிதமானது - படிக்கட்டுகள் ஏறும்போது வலி", hindiLabel: "मध्यम - सीढ़ियां चढ़ते समय दर्द" },
        { label: "Mild - Stiff in morning, improves later", value: "morning_stiffness", tamilLabel: "லேசானது - காலையில் பிடிப்பு", hindiLabel: "हल्का - सुबह अकड़न रहती है" }
      ],
      isRequired: true
    }
  ],
  ophthalmology: [
    {
      id: "eye_q1",
      slotKey: "chiefComplaint",
      question: {
        en: "What eye or vision symptoms are you experiencing?",
        ta: "உங்கள் கண்களில் என்ன பிரச்சனை உள்ளது?",
        hi: "आंखों या दृष्टि में क्या समस्या आ रही है?"
      },
      inputType: "choice",
      options: [
        { label: "Blurry Vision (Near or Distance)", value: "blur", tamilLabel: "மங்கலான பார்வை", hindiLabel: "धुंधला दिखाई देना" },
        { label: "Redness, Itching & Irritation", value: "redness_itching", tamilLabel: "சிவத்தல், அரிப்பு & எரிச்சல்", hindiLabel: "लालिमा, खुजली और जलन" },
        { label: "Watery or Yellowish Discharge", value: "discharge", tamilLabel: "கண்ணில் நீர் / அழுக்கு வடிதல்", hindiLabel: "आंखों से पानी या कीचड़ आना" },
        { label: "Eye Pain & Headache with Screens", value: "strain_headache", tamilLabel: "கண் வலி & தலைவலி", hindiLabel: "आंखों में दर्द और सिरदर्द" }
      ],
      isRequired: true
    },
    {
      id: "eye_q2",
      slotKey: "duration",
      question: {
        en: "How long has your vision or eye irritation been present?",
        ta: "இந்த கண் பிரச்சனை எத்தனை நாட்களாக உள்ளது?",
        hi: "यह समस्या कितने समय से है?"
      },
      inputType: "choice",
      options: [
        { label: "Started Suddenly Today", value: "today", tamilLabel: "இன்றுதான் தொடங்கியது", hindiLabel: "आज ही शुरू हुआ" },
        { label: "Few Days", value: "few_days", tamilLabel: "சில நாட்களாக", hindiLabel: "कुछ दिनों से" },
        { label: "Gradually over Months", value: "months", tamilLabel: "சில மாதங்களாக படிப்படியாக", hindiLabel: "महीनों से धीरे-धीरे" }
      ],
      isRequired: true
    }
  ],
  general_medicine: [
    {
      id: "gen_q1",
      slotKey: "chiefComplaint",
      question: {
        en: "What is your main health concern or reason for consultation?",
        ta: "உங்கள் முதன்மையான உடல்நல பிரச்சனை அல்லது ஆலோசனைக்கான காரணம் என்ன?",
        hi: "आपकी मुख्य स्वास्थ्य समस्या या परामर्श का कारण क्या है?"
      },
      inputType: "choice",
      options: [
        { label: "Fever, Chills & Body Aches", value: "fever_bodyaches", tamilLabel: "காய்ச்சல், நடுக்கம் & உடல் வலி", hindiLabel: "बुखार, ठंड और बदन दर्द" },
        { label: "Fatigue, Weakness & Lethargy", value: "fatigue", tamilLabel: "அசதி, சோர்வு & பலவீனம்", hindiLabel: "थकान और कमजोरी" },
        { label: "Headache / Migraine", value: "headache", tamilLabel: "தலைவலி / மைக்ரேன்", hindiLabel: "सिरदर्द / माइग्रेन" },
        { label: "Routine Health Checkup & Labs", value: "checkup", tamilLabel: "வழக்கமான உடல் பரிசோதனை", hindiLabel: "सामान्य स्वास्थ्य जांच" }
      ],
      isRequired: true
    },
    {
      id: "gen_q2",
      slotKey: "duration",
      question: {
        en: "How many days have you had these symptoms?",
        ta: "இந்த அறிகுறிகள் எத்தனை நாட்களாக உள்ளன?",
        hi: "ये लक्षण कितने दिनों से हैं?"
      },
      inputType: "choice",
      options: [
        { label: "1 - 2 Days", value: "1_2_days", tamilLabel: "1-2 நாட்கள்", hindiLabel: "1-2 दिन" },
        { label: "3 - 7 Days", value: "3_7_days", tamilLabel: "3-7 நாட்கள்", hindiLabel: "3-7 दिन" },
        { label: "More than a Week", value: "more_week", tamilLabel: "ஒரு வாரத்திற்கும் மேலாக", hindiLabel: "एक सप्ताह से अधिक" }
      ],
      isRequired: true
    }
  ]
};

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
    ],
    questions: DEPARTMENT_QUESTIONS_MAP.dental
  },
  {
    id: "cardiology",
    name: "Cardiology",
    category: "Cardiovascular",
    description: "Chest discomfort, palpitations, shortness of breath, hypertension, and syncope.",
    icon: "HeartPulse",
    commonSymptoms: ["Chest tightness", "Palpitations", "Shortness of breath on exertion", "Dizziness", "Ankle swelling"],
    totalQuestions: 4,
    languagesSupported: [
      { code: "en", label: "English" },
      { code: "ta", label: "தமிழ் (Tamil)" },
      { code: "hi", label: "हिंदी (Hindi)" }
    ],
    questions: DEPARTMENT_QUESTIONS_MAP.cardiology
  },
  {
    id: "orthopedics",
    name: "Orthopedics & Joint Care",
    category: "Musculoskeletal",
    description: "Joint pain, knee osteoarthritis, lumbar disc spine issues, fractures, and stiffness.",
    icon: "Bone",
    commonSymptoms: ["Knee pain", "Lower back ache", "Joint stiffness", "Difficulty walking", "Post-injury trauma"],
    totalQuestions: 3,
    languagesSupported: [
      { code: "en", label: "English" },
      { code: "ta", label: "தமிழ் (Tamil)" },
      { code: "hi", label: "हिंदी (Hindi)" }
    ],
    questions: DEPARTMENT_QUESTIONS_MAP.orthopedics
  },
  {
    id: "ophthalmology",
    name: "Ophthalmology (Eye Clinic)",
    category: "Vision",
    description: "Blurry vision, eye redness, irritation, floaters, cataracts, and visual strain.",
    icon: "Eye",
    commonSymptoms: ["Blurry vision", "Red eye", "Watery discharge", "Eye strain", "Halos around light"],
    totalQuestions: 2,
    languagesSupported: [
      { code: "en", label: "English" },
      { code: "ta", label: "தமிழ் (Tamil)" },
      { code: "hi", label: "हिंदी (Hindi)" }
    ],
    questions: DEPARTMENT_QUESTIONS_MAP.ophthalmology
  },
  {
    id: "general_medicine",
    name: "General Medicine / Internal Care",
    category: "General",
    description: "Fever, body fatigue, viral illness, unexplained weight changes, and health check-up.",
    icon: "Stethoscope",
    commonSymptoms: ["High fever", "Generalized weakness", "Body aches", "Headache", "Loss of appetite"],
    totalQuestions: 2,
    languagesSupported: [
      { code: "en", label: "English" },
      { code: "ta", label: "தமிழ் (Tamil)" },
      { code: "hi", label: "हिंदी (Hindi)" }
    ],
    questions: DEPARTMENT_QUESTIONS_MAP.general_medicine
  }
];
