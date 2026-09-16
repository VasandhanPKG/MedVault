export interface DepartmentOption {
  label: string;
  value: string;
  tamilLabel?: string;
  hindiLabel?: string;
}

export interface DepartmentQuestionDef {
  id: string;
  slotKey: string;
  question: {
    en: string;
    ta: string;
    hi: string;
    te?: string;
    kn?: string;
    ml?: string;
  };
  inputType: 'choice' | 'multi-choice' | 'text' | 'scale' | 'location';
  options?: DepartmentOption[];
  followUpTrigger?: {
    slotKey: string;
    values: string[];
  };
  isRequired: boolean;
}

export interface DepartmentConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  commonSymptoms: string[];
  requiredSlots: string[];
  questions: DepartmentQuestionDef[];
  redFlagKeywords: {
    en: string[];
    ta: string[];
    hi: string[];
  };
}

export const DEPARTMENT_REGISTRY: Record<string, DepartmentConfig> = {
  dental: {
    id: "dental",
    name: "Dental & Oral Maxillofacial",
    category: "Specialty",
    description: "Toothache, gum bleeding, tooth sensitivity, jaw pain, chewing difficulties, and oral lesions.",
    icon: "Smile",
    commonSymptoms: ["Tooth Pain", "Hot/Cold Sensitivity", "Gum Swelling", "Bleeding Gums", "Chewing Pain", "Broken Tooth"],
    requiredSlots: ["chiefComplaint", "painLocation", "duration", "painSeverity", "triggersHotCold", "chewingPain", "swelling", "bleeding"],
    redFlagKeywords: {
      en: ["difficulty breathing", "difficulty swallowing", "facial swelling reaching eye", "severe lockjaw", "fever with swelling", "uncontrolled bleeding"],
      ta: ["மூச்சு திணறல்", "விழுங்குவதில் சிரமம்", "கண் வரை வீக்கம்", "கட்டுப்படுத்த முடியாத ரத்தப்போக்கு"],
      hi: ["सांस लेने में तकलीफ", "निगलने में कठिनाई", "आंख तक सूजन", "अत्यधिक रक्तस्राव"]
    },
    questions: [
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
          en: "When did this dental issue or pain first begin?",
          ta: "இந்த பல் வலி அல்லது பிரச்சனை எப்போது தொடங்கியது?",
          hi: "यह दांत दर्द या समस्या कब शुरू हुई थी?"
        },
        inputType: "choice",
        options: [
          { label: "Today / Less than 24 hours ago", value: "under_24_hours", tamilLabel: "இன்று (24 மணிநேரத்திற்குள்)", hindiLabel: "आज ही (24 घंटे में)" },
          { label: "2 to 3 days ago", value: "2_3_days", tamilLabel: "2 முதல் 3 நாட்களாக", hindiLabel: "2-3 दिनों से" },
          { label: "About 1 to 2 weeks ago", value: "1_2_weeks", tamilLabel: "1-2 வாரங்களாக", hindiLabel: "1-2 हफ्तों से" },
          { label: "More than a month (Chronic)", value: "chronic", tamilLabel: "ஒரு மாதத்திற்கும் மேலாக", hindiLabel: "एक महीने से ज्यादा" }
        ],
        isRequired: true
      },
      {
        id: "dent_q4",
        slotKey: "painSeverity",
        question: {
          en: "How would you rate the pain severity on a scale of 1 to 10?",
          ta: "வலியின் தீவிரத்தை 1 முதல் 10 வரையிலான அளவில் எவ்வாறு குறிப்பிடுவீர்கள்?",
          hi: "1 से 10 के पैमाने पर दर्द की तीव्रता कितनी है?"
        },
        inputType: "choice",
        options: [
          { label: "Mild (1-3) — Annoying but manageable", value: "mild_1_3", tamilLabel: "லேசான வலி (1-3)", hindiLabel: "हल्का दर्द (1-3)" },
          { label: "Moderate (4-6) — Discomforting, disturbs focus", value: "moderate_4_6", tamilLabel: "மிதமான வலி (4-6)", hindiLabel: "मध्यम दर्द (4-6)" },
          { label: "Severe (7-8) — Throbbing, disrupts sleep", value: "severe_7_8", tamilLabel: "கடும் வலி (7-8)", hindiLabel: "तेज दर्द (7-8)" },
          { label: "Excruciating (9-10) — Unbearable, constant agony", value: "excruciating_9_10", tamilLabel: "தாங்க முடியாத வலி (9-10)", hindiLabel: "असहनीय दर्द (9-10)" }
        ],
        isRequired: true
      },
      {
        id: "dent_q5",
        slotKey: "triggersHotCold",
        question: {
          en: "Does consuming hot or cold food and drinks trigger or worsen the pain?",
          ta: "சூடான அல்லது குளிர்ந்த உணவுகளை உட்கொள்ளும்போது வலி அதிகரிக்கிறதா?",
          hi: "क्या गर्म या ठंडा खाने-पीने से दर्द बढ़ता है?"
        },
        inputType: "choice",
        options: [
          { label: "Yes — Cold foods / drinks make it worse", value: "cold_trigger", tamilLabel: "ஆம் — குளிர்ந்த உணவுகளால் வலி", hindiLabel: "हाँ — ठंडे से दर्द बढ़ता है" },
          { label: "Yes — Hot foods / drinks make it worse", value: "hot_trigger", tamilLabel: "ஆம் — சூடான உணவுகளால் வலி", hindiLabel: "हाँ — गर्म से दर्द बढ़ता है" },
          { label: "Both hot and cold foods trigger pain", value: "both_hot_cold", tamilLabel: "சூடு மற்றும் குளிர் இரண்டும்", hindiLabel: "गर्म और ठंडा दोनों से" },
          { label: "No sensitivity to temperature", value: "none", tamilLabel: "இல்லை — சூடு/குளிர் பாதிப்பில்லை", hindiLabel: "नहीं — कोई असर नहीं" }
        ],
        isRequired: true
      },
      {
        id: "dent_q6",
        slotKey: "chewingPain",
        question: {
          en: "Do you feel pain or pressure specifically while biting or chewing food?",
          ta: "உணவை மெல்லும்போதோ அல்லது கடிக்கும்போதோ வலி ஏற்படுகிறதா?",
          hi: "क्या खाना चबाते या काटते समय दर्द महसूस होता है?"
        },
        inputType: "choice",
        options: [
          { label: "Yes — Sharp pain when biting down", value: "yes_sharp", tamilLabel: "ஆம் — கடிக்கும்போது கூர்மையான வலி", hindiLabel: "हाँ — चबाने पर तेज दर्द" },
          { label: "Dull ache while eating", value: "yes_dull", tamilLabel: "சாப்பிடும்போது மந்தமான வலி", hindiLabel: "खाना खाते समय हल्का दर्द" },
          { label: "No — Chewing does not hurt", value: "no", tamilLabel: "இல்லை — மெல்லும்போது வலி இல்லை", hindiLabel: "नहीं — चबाने पर दर्द नहीं" }
        ],
        isRequired: true
      },
      {
        id: "dent_q7",
        slotKey: "swelling",
        question: {
          en: "Is there any noticeable swelling in your gums, cheek, or jaw area?",
          ta: "உங்கள் ஈறுகள், கன்னம் அல்லது தாடை பகுதியில் வீக்கம் ஏதேனும் உள்ளதா?",
          hi: "क्या मसूड़ों, गाल या जबड़े में कोई सूजन है?"
        },
        inputType: "choice",
        options: [
          { label: "No swelling", value: "no", tamilLabel: "வீக்கம் இல்லை", hindiLabel: "कोई सूजन नहीं" },
          { label: "Mild gum swelling around the tooth", value: "gum_swelling", tamilLabel: "பல்லை சுற்றியுள்ள ஈறில் லேசான வீக்கம்", hindiLabel: "मसूड़ों में हल्की सूजन" },
          { label: "Visible cheek or facial swelling", value: "facial_swelling", tamilLabel: "கன்னத்தில் அல்லது முகத்தில் வீக்கம்", hindiLabel: "गाल या चेहरे पर सूजन" }
        ],
        isRequired: true
      },
      {
        id: "dent_q8",
        slotKey: "bleeding",
        question: {
          en: "Do your gums bleed during brushing, flossing, or spontaneously?",
          ta: "பல் துலக்கும்போதோ அல்லது தானாகவோ ஈறுகளில் ரத்தம் வடிகிறதா?",
          hi: "क्या ब्रश करते समय या बिना वजह मसूड़ों से खून निकलता है?"
        },
        inputType: "choice",
        options: [
          { label: "No bleeding", value: "no", tamilLabel: "ரத்தப்போக்கு இல்லை", hindiLabel: "खून नहीं निकलता" },
          { label: "Bleeds occasionally while brushing", value: "during_brushing", tamilLabel: "பல் துலக்கும்போது எப்போதாவது ரத்தம்", hindiLabel: "ब्रश करते समय कभी-कभी" },
          { label: "Spontaneous / Frequent bleeding", value: "frequent_bleeding", tamilLabel: "அடிக்கடி ரத்தம் கசிகிறது", hindiLabel: "बार-बार खून निकलता है" }
        ],
        isRequired: true
      }
    ]
  },
  cardiology: {
    id: "cardiology",
    name: "Cardiology & Vascular Medicine",
    category: "Super-Specialty",
    description: "Chest discomfort, palpitations, breathlessness, exertion fatigue, ankle swelling, and hypertension.",
    icon: "HeartPulse",
    commonSymptoms: ["Chest Pain / Pressure", "Shortness of Breath", "Palpitations", "Ankle Swelling", "Dizziness", "Exertional Fatigue"],
    requiredSlots: ["chiefComplaint", "chestPainCharacter", "radiation", "duration", "exertionRelation", "breathlessness", "associatedSymptoms"],
    redFlagKeywords: {
      en: ["crushing chest pain", "radiating to left arm/jaw", "sweating with chest pressure", "syncope", "fainting", "severe dyspnea at rest"],
      ta: ["நெஞ்சு இறுக்கம்", "இடது கைக்கு பரவும் வலி", "அதிக வியர்வை", "மயக்கம்", "மூச்சுத்திணறல்"],
      hi: ["छाती में भारी दबाव", "बाएं हाथ में दर्द", "अत्यधिक पसीना", "बेहोशी", "सांस फूलना"]
    },
    questions: [
      {
        id: "card_q1",
        slotKey: "chiefComplaint",
        question: {
          en: "What cardiac or chest symptoms prompted your visit today?",
          ta: "இன்று நீங்கள் இதய மருத்துவரை அணுக என்ன காரணம்?",
          hi: "आज हृदय रोग विशेषज्ञ से मिलने का मुख्य कारण क्या है?"
        },
        inputType: "choice",
        options: [
          { label: "Chest Discomfort / Heaviness", value: "chest_heaviness", tamilLabel: "நெஞ்சில் பாரம் / வலி", hindiLabel: "छाती में भारीपन या दर्द" },
          { label: "Shortness of Breath (Dyspnea)", value: "breathlessness", tamilLabel: "மூச்சுத் திணறல்", hindiLabel: "सांस फूलना" },
          { label: "Rapid / Irregular Heartbeats (Palpitations)", value: "palpitations", tamilLabel: "இதய படபடப்பு", hindiLabel: "दिल की धड़कन तेज होना" },
          { label: "Swelling in Feet / Ankles (Edema)", value: "edema", tamilLabel: "கால்களில் வீக்கம்", hindiLabel: "पैरों या टखनों में सूजन" },
          { label: "Routine Hypertension / Cardiac Checkup", value: "routine_checkup", tamilLabel: "வழக்கமான இரத்த அழுத்த பரிசோதனை", hindiLabel: "सामान्य बीपी जांच" }
        ],
        isRequired: true
      },
      {
        id: "card_q2",
        slotKey: "chestPainCharacter",
        question: {
          en: "How would you describe the feeling in your chest?",
          ta: "நெஞ்சில் ஏற்படும் உணர்வை எவ்வாறு விவரிப்பீர்கள்?",
          hi: "छाती में होने वाले दर्द या अहसास को आप कैसे बताएंगे?"
        },
        inputType: "choice",
        options: [
          { label: "Pressure / Tightness / Squeezing", value: "pressure_tightness", tamilLabel: "அழுத்தம் / இறுக்கம்", hindiLabel: "दबाव या जकड़न" },
          { label: "Sharp / Stabbing / Pricking", value: "sharp_stabbing", tamilLabel: "குத்துவது போன்ற கூர்மையான வலி", hindiLabel: "तेज चुभन जैसा दर्द" },
          { label: "Burning / Acidity sensation", value: "burning_acidic", tamilLabel: "எரிச்சல் / அசிடிட்டி போன்ற உணர்வு", hindiLabel: "जलन जैसा दर्द" },
          { label: "No chest pain — only palpitations or breathlessness", value: "no_pain", tamilLabel: "வலி இல்லை — படபடப்பு/மூச்சு மட்டுமே", hindiLabel: "दर्द नहीं — केवल सांस/धड़कन" }
        ],
        isRequired: true
      },
      {
        id: "card_q3",
        slotKey: "radiation",
        question: {
          en: "Does the chest sensation spread or radiate to other areas?",
          ta: "நெஞ்சு வலி உடலின் மற்ற பகுதிகளுக்கு பரவுகிறதா?",
          hi: "क्या यह दर्द शरीर के अन्य हिस्सों में फैलता है?"
        },
        inputType: "choice",
        options: [
          { label: "Spreads to Left Arm or Shoulder", value: "left_arm", tamilLabel: "இடது கை அல்லது தோள்பட்டைக்கு பரவுகிறது", hindiLabel: "बाएं हाथ या कंधे में" },
          { label: "Spreads to Neck / Jaw / Throat", value: "neck_jaw", tamilLabel: "கழுத்து அல்லது தாடைக்கு பரவுகிறது", hindiLabel: "गर्दन या जबड़े में" },
          { label: "Spreads to Upper Back", value: "back", tamilLabel: "முதுகின் மேல் பகுதிக்கு பரவுகிறது", hindiLabel: "पीठ के ऊपरी हिस्से में" },
          { label: "No radiation — stays localized", value: "none", tamilLabel: "பரவவில்லை — ஒரே இடத்தில் மட்டுமே", hindiLabel: "कहीं नहीं फैलता" }
        ],
        isRequired: true
      },
      {
        id: "card_q4",
        slotKey: "exertionRelation",
        question: {
          en: "Does walking, climbing stairs, or physical exertion trigger or worsen it?",
          ta: "நடைப்பயிற்சி அல்லது மாடிப்படிகள் ஏறும்போது இது அதிகரிக்கிறதா?",
          hi: "क्या चलने या सीढ़ियां चढ़ने पर यह समस्या बढ़ती है?"
        },
        inputType: "choice",
        options: [
          { label: "Yes — Worsens with exertion, relieved by rest", value: "exertional", tamilLabel: "ஆம் — உழைப்பால் அதிகமாகிறது, ஓய்வில் குறைகிறது", hindiLabel: "हाँ — चलने पर बढ़ता है, आराम से घटता है" },
          { label: "Occurs at complete rest", value: "at_rest", tamilLabel: "ஓய்வாக இருக்கும்போதும் ஏற்படுகிறது", hindiLabel: "आराम करते समय भी होता है" },
          { label: "Unrelated to physical activity", value: "unrelated", tamilLabel: "உடற்பயிற்சியுடன் தொடர்பில்லை", hindiLabel: "शारीरिक गतिविधि से संबंध नहीं" }
        ],
        isRequired: true
      }
    ]
  },
  orthopedics: {
    id: "orthopedics",
    name: "Orthopedics & Joint Care",
    category: "Surgical / Musculoskeletal",
    description: "Joint pain, spine/back ache, sports injuries, stiffness, mobility restriction, fractures, and ligament tears.",
    icon: "Bone",
    commonSymptoms: ["Knee Pain", "Lower Back Pain", "Shoulder Stiffness", "Joint Swelling", "Difficulty Walking", "Morning Stiffness"],
    requiredSlots: ["chiefComplaint", "jointLocation", "duration", "traumaHistory", "weightBearingPain", "morningStiffness"],
    redFlagKeywords: {
      en: ["inability to move limb", "numbness in groin/saddle", "loss of bowel bladder control", "severe deformity after fall", "bone exposure"],
      ta: ["கால் அசைக்க இயலாமை", "மல சிறுநீர் கட்டுப்பாடு இழப்பு", "எலும்பு முறிவு"],
      hi: ["अंग हिलाने में असमर्थता", "शौच/पेशाब पर नियंत्रण खोना", "हड्डी का दिखना"]
    },
    questions: [
      {
        id: "ortho_q1",
        slotKey: "chiefComplaint",
        question: {
          en: "Which joint, bone, or muscle is giving you trouble?",
          ta: "எந்த மூட்டு, எலும்பு அல்லது தசையில் பிரச்சனை உள்ளது?",
          hi: "किस जोड़, हड्डी या मांसपेशी में समस्या है?"
        },
        inputType: "choice",
        options: [
          { label: "Knee Joint Pain / Crepitus", value: "knee", tamilLabel: "முழங்கால் மூட்டு வலி", hindiLabel: "घुटने का दर्द" },
          { label: "Lower Back / Lumbar Spine Pain", value: "lower_back", tamilLabel: "இடுப்பு / கீழ் முதுகு வலி", hindiLabel: "कमर / रीढ़ का दर्द" },
          { label: "Shoulder / Frozen Shoulder / Rotator Cuff", value: "shoulder", tamilLabel: "தோள்பட்டை வலி / அசைக்க முடியாமை", hindiLabel: "कंधे का दर्द" },
          { label: "Neck / Cervical Spine", value: "cervical_neck", tamilLabel: "கழுத்து வலி", hindiLabel: "गर्दन का दर्द" },
          { label: "Ankle / Foot / Heel Pain", value: "ankle_foot", tamilLabel: "கணுக்கால் / பாத வலி", hindiLabel: "टखने या एड़ी का दर्द" },
          { label: "Wrist / Hand / Finger Joints", value: "hand_wrist", tamilLabel: "மணிக்கட்டு / கை விரல்கள்", hindiLabel: "कलाई या हाथ के जोड़" }
        ],
        isRequired: true
      },
      {
        id: "ortho_q2",
        slotKey: "duration",
        question: {
          en: "How long have you had this joint or musculoskeletal pain?",
          ta: "இந்த மூட்டு அல்லது உடல் வலி எத்தனை நாட்களாக உள்ளது?",
          hi: "यह दर्द कितने समय से हो रहा है?"
        },
        inputType: "choice",
        options: [
          { label: "Recent acute injury (< 7 days)", value: "acute_under_7d", tamilLabel: "சமீபத்திய காயம் (7 நாட்களுக்குள்)", hindiLabel: "हाल ही में लगी चोट (< 7 दिन)" },
          { label: "1 to 4 weeks", value: "1_4_weeks", tamilLabel: "1 முதல் 4 வாரங்கள்", hindiLabel: "1 से 4 हफ्ते" },
          { label: "1 to 6 months", value: "1_6_months", tamilLabel: "1 முதல் 6 மாதங்கள்", hindiLabel: "1 से 6 महीने" },
          { label: "Chronic (> 6 months / Years)", value: "chronic_years", tamilLabel: "நீண்ட கால பிரச்சனை (வருடக்கணக்கில்)", hindiLabel: "लंबे समय से (सालों से)" }
        ],
        isRequired: true
      },
      {
        id: "ortho_q3",
        slotKey: "traumaHistory",
        question: {
          en: "Did this pain start after a fall, twist, lifting heavy weights, or road accident?",
          ta: "விபத்து, கீழே விழுந்தது, அதிக எடை தூக்கியது அல்லது சுளுக்கு காரணமாக இது தொடங்கியதா?",
          hi: "क्या यह दर्द गिरने, मुड़ने, भारी वजन उठाने या चोट लगने के बाद शुरू हुआ?"
        },
        inputType: "choice",
        options: [
          { label: "Yes — Direct fall or impact injury", value: "fall_impact", tamilLabel: "ஆம் — கீழே விழுந்ததால்", hindiLabel: "हाँ — गिरने या चोट से" },
          { label: "Yes — Twisting or sports injury", value: "twist_sports", tamilLabel: "ஆம் — சுளுக்கு அல்லது விளையாட்டு காயம்", hindiLabel: "हाँ — मुड़ने या खेल में चोट" },
          { label: "No — Began gradually without any injury", value: "gradual_wear", tamilLabel: "இல்லை — காயம் இன்றி படிப்படியாக வந்தது", hindiLabel: "नहीं — धीरे-धीरे शुरू हुआ" }
        ],
        isRequired: true
      },
      {
        id: "ortho_q4",
        slotKey: "weightBearingPain",
        question: {
          en: "Can you bear weight on the affected limb and walk without support?",
          ta: "பாதிக்கப்பட்ட காலில் ஊன்றி சுயமாக நடக்க முடிகிறதா?",
          hi: "क्या आप उस पैर पर वजन डालकर बिना सहारे के चल सकते हैं?"
        },
        inputType: "choice",
        options: [
          { label: "Yes — Can walk with mild discomfort", value: "walk_normal", tamilLabel: "ஆம் — லேசான வலியுடன் நடக்க முடிகிறது", hindiLabel: "हाँ — थोड़ा दर्द है पर चल सकते हैं" },
          { label: "Can only limp or need a walking stick", value: "limp_support", tamilLabel: "நொண்டியே நடக்க முடிகிறது", hindiLabel: "लंगड़ा कर चलना पड़ता है" },
          { label: "Cannot bear any weight at all", value: "non_weight_bearing", tamilLabel: "எடையை தாங்கவே முடியவில்லை", hindiLabel: "बिल्कुल वजन नहीं रख सकते" }
        ],
        isRequired: true
      }
    ]
  },
  ophthalmology: {
    id: "ophthalmology",
    name: "Ophthalmology (Eye Care)",
    category: "Specialty",
    description: "Blurry vision, eye redness, irritation, dry eyes, eye pain, floaters, and spectacle prescription checks.",
    icon: "Eye",
    commonSymptoms: ["Blurred Vision", "Red Eye", "Eye Pain / Strain", "Watering / Itching", "Floaters / Flashes", "Foreign Body Sensation"],
    requiredSlots: ["chiefComplaint", "affectedEye", "duration", "visionChanges", "dischargeRedness"],
    redFlagKeywords: {
      en: ["sudden loss of vision", "chemical splash in eye", "severe penetrating eye pain with nausea", "curtain falling over vision", "halos around lights"],
      ta: ["திடீர் கண்பார்வை இழப்பு", "கண்ணில் ரசாயனம் படுதல்", "கடும் கண்வலி"],
      hi: ["अचानक रोशनी चले जाना", "आंख में केमिकल गिरना", "अत्यधिक तेज दर्द"]
    },
    questions: [
      {
        id: "ophth_q1",
        slotKey: "chiefComplaint",
        question: {
          en: "What eye symptom or vision change are you experiencing?",
          ta: "கண்களில் என்ன பிரச்சனை அல்லது பார்வை மாற்றம் உள்ளது?",
          hi: "आंखों में क्या तकलीफ या देखने में क्या समस्या आ रही है?"
        },
        inputType: "choice",
        options: [
          { label: "Gradual Blurry Vision (Near or Distance)", value: "blurry_vision", tamilLabel: "மங்கலான பார்வை", hindiLabel: "धुंधला दिखाई देना" },
          { label: "Redness / Grittiness / Foreign body sensation", value: "redness_gritty", tamilLabel: "கண் சிவத்தல் / மணல் போன்ற உணர்வு", hindiLabel: "आंख लाल होना / चुभन" },
          { label: "Watering / Itching / Allergic discharge", value: "watering_itching", tamilLabel: "கண்ணீர் வடிதல் / அரிப்பு", hindiLabel: "पानी आना / खुजली" },
          { label: "Eye Strain / Headache from screens", value: "digital_strain", tamilLabel: "திரை பயன்பாட்டால் கண் சோர்வு", hindiLabel: "स्क्रीन से आंखों में थकान" },
          { label: "Sudden onset vision disturbance", value: "sudden_vision_loss", tamilLabel: "திடீர் பார்வை குறைபாடு", hindiLabel: "अचानक देखने में दिक्कत" }
        ],
        isRequired: true
      },
      {
        id: "ophth_q2",
        slotKey: "affectedEye",
        question: {
          en: "Which eye is primarily affected?",
          ta: "எந்த கண் முதன்மையாக பாதிக்கப்பட்டுள்ளது?",
          hi: "मुख्य रूप से कौन सी आंख में समस्या है?"
        },
        inputType: "choice",
        options: [
          { label: "Right Eye Only (OD)", value: "right_eye", tamilLabel: "வலது கண் மட்டும்", hindiLabel: "सिर्फ दाहिनी आंख" },
          { label: "Left Eye Only (OS)", value: "left_eye", tamilLabel: "இடது கண் மட்டும்", hindiLabel: "सिर्फ बाईं आंख" },
          { label: "Both Eyes (OU)", value: "both_eyes", tamilLabel: "இரண்டு கண்களும்", hindiLabel: "दोनों आंखें" }
        ],
        isRequired: true
      }
    ]
  },
  dermatology: {
    id: "dermatology",
    name: "Dermatology & Skin Care",
    category: "Specialty",
    description: "Rashes, itching, acne, pigmentation, fungal infections, eczema, hair loss, and mole changes.",
    icon: "Sparkles",
    commonSymptoms: ["Itchy Rash", "Acne / Pimples", "Skin Discoloration", "Hair Fall", "Dry / Flaking Skin", "Hives / Allergic Reaction"],
    requiredSlots: ["chiefComplaint", "skinLocation", "duration", "itchingSeverity", "previousTreatments"],
    redFlagKeywords: {
      en: ["rash with blistering all over", "lips and mouth peeling", "rapidly spreading dark mole with irregular borders", "high fever with purpuric rash"],
      ta: ["உடல் முழுவதும் கொப்புளங்கள்", "வாய் உதடு உரிதல்", "கடுமையான தோல் அலர்ஜி"],
      hi: ["पूरे शरीर पर छाले", "मुंह और होंठ छिलना", "अचानक फैलने वाले चकत्ते"]
    },
    questions: [
      {
        id: "derm_q1",
        slotKey: "chiefComplaint",
        question: {
          en: "What skin, hair, or nail condition would you like evaluated?",
          ta: "தோல், முடி அல்லது நகங்களில் என்ன பிரச்சனை உள்ளது?",
          hi: "त्वचा, बाल या नाखून में क्या समस्या है?"
        },
        inputType: "choice",
        options: [
          { label: "Itchy Rash / Red patches / Eczema", value: "itchy_rash", tamilLabel: "அரிப்புடன் கூடிய தோல் தடிப்பு", hindiLabel: "खुजली वाले लाल चकत्ते" },
          { label: "Acne / Breakouts / Dark Spots", value: "acne_pigment", tamilLabel: "பருக்கள் / கரும்புள்ளிகள்", hindiLabel: "मुंहासे / दाग-धब्बे" },
          { label: "Fungal Infection / Ringworm / Tinea", value: "fungal", tamilLabel: "படர்தாமரை / பூஞ்சை தொற்று", hindiLabel: "दाद / फंगल इन्फेक्शन" },
          { label: "Hair Thinning / Excessive Hair Fall / Dandruff", value: "hair_fall", tamilLabel: "முடி உதிர்தல் / பொடுகு", hindiLabel: "बाल झड़ना / रूसी" },
          { label: "Dry Flaking Skin / Psoriasis", value: "flaking_psoriasis", tamilLabel: "வறண்ட செதில் தோல்", hindiLabel: "सूखी पपड़ीदार त्वचा" }
        ],
        isRequired: true
      }
    ]
  },
  ent: {
    id: "ent",
    name: "ENT (Ear, Nose & Throat)",
    category: "Specialty",
    description: "Earache, hearing loss, tinnitus, nasal congestion, sinusitis, sore throat, voice hoarseness, and tonsillitis.",
    icon: "Ear",
    commonSymptoms: ["Ear Pain / Discharge", "Hearing Difficulty", "Blocked Nose / Sinus", "Sore Throat", "Hoarseness of Voice", "Tinnitus / Ringing"],
    requiredSlots: ["chiefComplaint", "duration", "fever", "associatedDischarge"],
    redFlagKeywords: {
      en: ["stridor", "airway blockage", "severe epistaxis / nosebleed not stopping", "mastoid swelling behind ear with fever"],
      ta: ["மூச்சுக்குழல் அடைப்பு", "நிற்காத மூக்கு ரத்தப்போக்கு", "காதுக்கு பின் வீக்கம்"],
      hi: ["सांस नली में रुकावट", "नाक से लगातार खून बहना", "कान के पीछे सूजन"]
    },
    questions: [
      {
        id: "ent_q1",
        slotKey: "chiefComplaint",
        question: {
          en: "Which area is causing your ENT symptoms?",
          ta: "காது, மூக்கு அல்லது தொண்டையில் எங்கு பிரச்சனை?",
          hi: "कान, नाक या गले में कहां समस्या है?"
        },
        inputType: "choice",
        options: [
          { label: "Ear — Pain / Discharge / Blocked Ear", value: "ear_pain", tamilLabel: "காது வலி / அடைப்பு / சீழ்", hindiLabel: "कान का दर्द / बहना" },
          { label: "Nose — Sinus Pressure / Blockage / Allergy", value: "sinus_nose", tamilLabel: "சைனஸ் / மூக்கடைப்பு / அலர்ஜி", hindiLabel: "साइनस / बंद नाक / जुकाम" },
          { label: "Throat — Pain while swallowing / Sore Throat", value: "sore_throat", tamilLabel: "தொண்டை வலி / விழுங்க சிரமம்", hindiLabel: "गले में दर्द / खराश" },
          { label: "Voice — Hoarseness / Lost Voice", value: "hoarseness", tamilLabel: "குரல் மாற்றம் / குரல் அடைப்பு", hindiLabel: "आवाज बैठना" }
        ],
        isRequired: true
      }
    ]
  },
  pulmonology: {
    id: "pulmonology",
    name: "Pulmonology & Respiratory",
    category: "Super-Specialty",
    description: "Chronic cough, wheezing, asthma, bronchitis, post-COVID symptoms, allergy cough, and breathlessness.",
    icon: "Wind",
    commonSymptoms: ["Persistent Cough", "Wheezing / Whistling Breath", "Shortness of Breath", "Chest Tightness", "Phlegm / Sputum", "Night Cough"],
    requiredSlots: ["chiefComplaint", "coughDuration", "sputumType", "wheezingBreathlessness"],
    redFlagKeywords: {
      en: ["coughing up blood / hemoptysis", "blue lips or nails / cyanosis", "severe respiratory distress", "oxygen saturation < 90%"],
      ta: ["இருமல் வழியே ரத்தம் வருதல்", "உதடு நீலமாதல்", "கடுமையான மூச்சுத்திணறல்"],
      hi: ["खांसी में खून आना", "होंठ नीले पड़ना", "गंभीर सांस की तकलीफ"]
    },
    questions: [
      {
        id: "pulm_q1",
        slotKey: "chiefComplaint",
        question: {
          en: "What breathing or lung symptoms are you currently experiencing?",
          ta: "சுவாசம் அல்லது நுரையீரல் சார்ந்த என்ன பிரச்சனை உள்ளது?",
          hi: "सांस या फेफड़ों से जुड़ी क्या समस्या हो रही है?"
        },
        inputType: "choice",
        options: [
          { label: "Persistent Dry or Wet Cough", value: "cough", tamilLabel: "தொடர் இருமல் (வறட்டு / சளி)", hindiLabel: "लगातार खांसी" },
          { label: "Wheezing / Whistling sound while breathing", value: "wheezing", tamilLabel: "சுவாசிக்கும்போது இரைப்பு / விசிலிங் சத்தம்", hindiLabel: "सांस लेते समय सीटी जैसी आवाज" },
          { label: "Shortness of breath on mild walking", value: "dyspnea", tamilLabel: "சிறிது தூரம் நடந்தாலும் மூச்சு வாங்குதல்", hindiLabel: "थोड़ा चलने पर सांस फूलना" },
          { label: "Asthma / Inhaler consultation", value: "asthma_review", tamilLabel: "ஆஸ்துமா / இன்ஹேலர் ஆலோசனை", hindiLabel: "अस्थमा / इनहेलर समीक्षा" }
        ],
        isRequired: true
      }
    ]
  },
  gastroenterology: {
    id: "gastroenterology",
    name: "Gastroenterology & Digestive",
    category: "Super-Specialty",
    description: "Acidity, GERD, abdominal pain, bloating, constipation, diarrhea, fatty liver, and indigestion.",
    icon: "Soup",
    commonSymptoms: ["Acidity / Heartburn", "Stomach Pain", "Bloating / Gas", "Constipation", "Nausea / Vomiting", "Loose Stools"],
    requiredSlots: ["chiefComplaint", "painLocation", "duration", "bowelHabits"],
    redFlagKeywords: {
      en: ["vomiting blood / hematemesis", "black tarry stools / melena", "unexplained rapid weight loss", "yellow jaundice in eyes with fever", "rigid board-like abdomen"],
      ta: ["ரத்த வாந்தி", "கருப்பு நிற மலம்", "திடீர் எடை குறைவு", "மஞ்சள் காமாலை"],
      hi: ["खून की उल्टी", "काला मल", "अचानक वजन घटना", "पीलिया"]
    },
    questions: [
      {
        id: "gastro_q1",
        slotKey: "chiefComplaint",
        question: {
          en: "What digestive or stomach symptom is bothering you?",
          ta: "செரிமானம் அல்லது வயிறு சார்ந்த என்ன பிரச்சனை உள்ளது?",
          hi: "पाचन या पेट से संबंधित क्या समस्या है?"
        },
        inputType: "choice",
        options: [
          { label: "Acidity / Heartburn / Acid Reflux", value: "reflux_gerd", tamilLabel: "நெஞ்செரிச்சல் / அசிடிட்டி", hindiLabel: "एसिडिटी / सीने में जलन" },
          { label: "Abdominal Pain / Cramps", value: "stomach_pain", tamilLabel: "வயிற்று வலி / தசைப்பிடிப்பு", hindiLabel: "पेट दर्द / मरोड़" },
          { label: "Bloating / Gas / Indigestion", value: "bloating_gas", tamilLabel: "வயிறு உப்புசம் / அஜீரணம்", hindiLabel: "पेट फूलना / गैस / अपच" },
          { label: "Constipation / Hard stools", value: "constipation", tamilLabel: "மலச்சிக்கல்", hindiLabel: "कब्ज" },
          { label: "Diarrhea / Loose watery stools", value: "diarrhea", tamilLabel: "வயிற்றுப்போக்கு", hindiLabel: "दस्त" }
        ],
        isRequired: true
      }
    ]
  },
  general_medicine: {
    id: "general_medicine",
    name: "General Medicine & Physician",
    category: "Primary Care",
    description: "Fever, body aches, diabetes management, hypertension, general fatigue, viral infections, and routine health.",
    icon: "Stethoscope",
    commonSymptoms: ["Fever & Chills", "Body Aches / Weakness", "Fatigue", "Cold & Flu", "Diabetes Review", "General Wellness"],
    requiredSlots: ["chiefComplaint", "duration", "feverTemperature", "associatedSymptoms"],
    redFlagKeywords: {
      en: ["altered sensorium / confusion", "high fever > 103F with stiff neck", "sudden severe weakness on one side of body"],
      ta: ["குழப்பமான நிலை", "கடுமையான காய்ச்சல் மற்றும் கழுத்து விறைப்பு", "பக்கவாதம் போன்ற உணர்வு"],
      hi: ["बेहोशी या भ्रम", "तेज बुखार और गर्दन में अकड़न", "शरीर के एक तरफ कमजोरी"]
    },
    questions: [
      {
        id: "gen_q1",
        slotKey: "chiefComplaint",
        question: {
          en: "What is your main health concern or reason for consulting the physician?",
          ta: "மருத்துவரை சந்திக்க உங்கள் முக்கிய உடல்நலப் பிரச்சனை என்ன?",
          hi: "डॉक्टर से मिलने का मुख्य कारण क्या है?"
        },
        inputType: "choice",
        options: [
          { label: "Fever, Chills, or Viral Illness", value: "fever_viral", tamilLabel: "காய்ச்சல் / குளிர் / வைரஸ் தொற்று", hindiLabel: "बुखार, ठंड या वायरल संक्रमण" },
          { label: "Chronic Fatigue / General Weakness", value: "fatigue_weakness", tamilLabel: "உடல் சோர்வு / பலவீனம்", hindiLabel: "थकान या कमजोरी" },
          { label: "Blood Pressure / Diabetes Routine Followup", value: "bp_sugar_review", tamilLabel: "இரத்த அழுத்தம் / சர்க்கரை அளவு பரிசோதனை", hindiLabel: "बीपी / शुगर की नियमित जांच" },
          { label: "Headache / Dizziness / Malaise", value: "headache_dizzy", tamilLabel: "தலைவலி / தலைச்சுற்றல்", hindiLabel: "सिरदर्द या चक्कर आना" }
        ],
        isRequired: true
      }
    ]
  },
  ayush: {
    id: "ayush",
    name: "AYUSH (Integrative & Holistic)",
    category: "Integrative",
    description: "Ayurveda, Yoga, Unani, Siddha, and Homeopathy holistic health, constitution evaluation, and chronic wellness.",
    icon: "Leaf",
    commonSymptoms: ["Prakriti / Constitution Check", "Chronic Joint Health", "Digestive Agni Balance", "Stress & Sleep Support", "Immunity Rejuvenation"],
    requiredSlots: ["chiefComplaint", "prakritiConstitution", "digestionAgni", "sleepQuality"],
    redFlagKeywords: {
      en: ["acute emergency requiring modern triage", "chest pain", "unconscious"],
      ta: ["அவசர சிகிச்சை தேவைப்படும் நிலை", "நெஞ்சு வலி"],
      hi: ["आपातकालीन स्थिति", "छाती में दर्द"]
    },
    questions: [
      {
        id: "ayush_q1",
        slotKey: "chiefComplaint",
        question: {
          en: "What is your primary wellness or holistic health objective today?",
          ta: "ஆயுஷ் / இயற்கை மருத்துவத்தில் உங்கள் நோக்கம் என்ன?",
          hi: "आयुष / समग्र स्वास्थ्य में आपका मुख्य उद्देश्य क्या है?"
        },
        inputType: "choice",
        options: [
          { label: "Chronic Pain & Joint Vata Care", value: "joint_vata", tamilLabel: "மூட்டு வாத பராமரிப்பு", hindiLabel: "जोड़ों का दर्द / वात विकार" },
          { label: "Digestive Fire (Agni) & Metabolism", value: "digestive_agni", tamilLabel: "செரிமான அக்னி சமநிலை", hindiLabel: "पाचन शक्ति (अग्नि) संतुलन" },
          { label: "Stress, Insomnia & Mental Calm", value: "stress_sleep", tamilLabel: "மன அழுத்தம் / தூக்கமின்மை", hindiLabel: "तनाव एवं अनिद्रा निवारण" },
          { label: "Rasayana / Immunity & Longevity", value: "rasayana_immunity", tamilLabel: "நோய் எதிர்ப்பு சக்தி மேம்பாடு", hindiLabel: "रोग प्रतिरोधक क्षमता (इम्युनिटी)" }
        ],
        isRequired: true
      }
    ]
  }
};
