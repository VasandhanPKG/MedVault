import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';
import pdfParser from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export interface ExtractedMarker {
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'borderline' | 'high' | 'low' | 'attention';
  referenceRange?: string;
}

export interface OcrProcessingResult {
  rawText: string;
  isMedical: boolean;
  extractedMarkers: ExtractedMarker[];
  summary: string;
  detectedCategory: "Lab Report" | "Imaging" | "Prescription" | "Vaccination" | "Discharge Summary" | "Other";
}

export class OcrService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim() !== '') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        console.log('🤖 Gemini AI Multimodal Vision initialized for intelligent document OCR');
      } catch (err) {
        console.warn('Could not initialize Gemini for OCR:', err);
      }
    }
  }

  /**
   * Main OCR extraction method for images and PDFs (supports both Buffer and file path)
   */
  public async processDocument(input: string | Buffer, mimeType: string, filename = 'document'): Promise<OcrProcessingResult> {
    let rawText = '';
    const isBuffer = Buffer.isBuffer(input);

    try {
      if (mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
        const buffer = isBuffer ? input : fs.readFileSync(input);
        rawText = await this.extractFromPdfBuffer(buffer, filename);
      } else if (mimeType.startsWith('image/') || /\.(png|jpe?g|webp|bmp|tiff)$/i.test(filename)) {
        rawText = await this.extractFromImageInput(input, filename);
      } else {
        const buffer = isBuffer ? input : fs.readFileSync(input);
        rawText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, '');
      }
    } catch (err) {
      console.warn('Primary text extraction failed, using fallback:', err);
    }

    // Try Gemini Vision multimodal extraction if API key is provided and available
    if (this.genAI) {
      try {
        const geminiResult = await this.extractWithGemini(input, mimeType, rawText, filename);
        if (geminiResult) {
          return geminiResult;
        }
      } catch (geminiErr) {
        console.warn('Gemini document extraction fallback to local clinical engine:', geminiErr);
      }
    }

    // Local Clinical Validation & Engine
    return this.processLocally(rawText, filename);
  }

  /**
   * Local deterministic clinical engine
   */
  public processLocally(rawText: string, filename = ''): OcrProcessingResult {
    const isMedical = this.isMedicalDocument(rawText, filename);

    if (!isMedical) {
      return {
        rawText: rawText.trim(),
        isMedical: false,
        extractedMarkers: [],
        summary: 'This document does not appear to be a recognized medical record, laboratory test report, or radiology imaging scan. No clinical metrics were extracted.',
        detectedCategory: 'Other'
      };
    }

    const detectedCategory = this.detectCategory(rawText, filename);
    let extractedMarkers: ExtractedMarker[] = [];

    if (detectedCategory === 'Imaging') {
      extractedMarkers = this.extractImagingMarkers(rawText, filename);
    } else {
      extractedMarkers = this.extractBiomarkers(rawText);
    }

    const summary = this.generateClinicalSummary(rawText, extractedMarkers, detectedCategory, filename);

    return {
      rawText: rawText.trim(),
      isMedical: true,
      extractedMarkers,
      summary,
      detectedCategory,
    };
  }

  private async extractFromImageInput(input: string | Buffer, filename: string): Promise<string> {
    console.log(`🔍 [OCR] Processing image with Tesseract: ${path.basename(filename)}`);
    try {
      const { data: { text } } = await Tesseract.recognize(
        input,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text' && m.progress) {
              const pct = (m.progress * 100).toFixed(0);
              if (Number(pct) % 25 === 0) console.log(`🔍 [OCR Progress] ${pct}%`);
            }
          }
        }
      );
      return text || '';
    } catch (err) {
      console.error('Tesseract image OCR failed:', err);
      return '';
    }
  }

  private async extractFromPdfBuffer(buffer: Buffer, filename: string): Promise<string> {
    console.log(`📄 [OCR] Parsing PDF document text: ${path.basename(filename)}`);
    try {
      const data = await pdfParser(buffer);
      return data.text || '';
    } catch (e) {
      console.error('PDF text extraction error:', e);
      return '';
    }
  }

  /**
   * Validate whether document text contains genuine healthcare/clinical content
   */
  public isMedicalDocument(text: string, filename = ''): boolean {
    const lower = `${text} ${filename}`.toLowerCase();

    // Specific non-medical disqualifiers (invoices, receipts, software code, tax documents, utility bills)
    if (
      (lower.includes('invoice #') || lower.includes('bill to:') || lower.includes('tax invoice') || lower.includes('payment receipt')) &&
      !lower.includes('hospital') && !lower.includes('patient') && !lower.includes('clinical') && !lower.includes('doctor')
    ) {
      return false;
    }

    if (
      lower.includes('curriculum vitae') || lower.includes('resume') || lower.includes('experience summary') ||
      lower.includes('education background') || lower.includes('skills & proficiencies')
    ) {
      return false;
    }

    // Medical keywords registry
    const medicalKeywords = [
      'patient', 'hospital', 'clinic', 'dr.', 'doctor', 'physician', 'specimen', 'laboratory', 'diagnostic',
      'reference interval', 'reference range', 'biochemistry', 'hematology', 'pathology', 'radiology',
      'mri', 'ct scan', 'x-ray', 'xray', 'ultrasound', 'sonography', 'ecg', 'ekg', 'echo', 'mammogram',
      'prescription', 'rx', 'tablet', 'capsule', 'dosage', 'diagnosis', 'impression', 'findings',
      'glucose', 'hba1c', 'cholesterol', 'triglycerides', 'hemoglobin', 'creatinine', 'platelet', 'wbc', 'rbc',
      'blood pressure', 'discharge summary', 'vital', 'vaccine', 'vaccination', 'immunization', 'serology',
      'biopsy', 'histopathology', 'urine analysis', 'lipid profile', 'renal function', 'liver function'
    ];

    let matchCount = 0;
    for (const kw of medicalKeywords) {
      if (lower.includes(kw)) {
        matchCount++;
      }
    }

    // At least 2 medical terms or 1 strong diagnostic term
    const strongTerms = ['mri', 'x-ray', 'ct scan', 'ultrasound', 'hba1c', 'lipid profile', 'discharge summary', 'prescription', 'biochemistry'];
    const hasStrongTerm = strongTerms.some(term => lower.includes(term));

    return matchCount >= 2 || hasStrongTerm;
  }

  /**
   * Accurate classification for Imaging, Lab Reports, Prescriptions, Vaccines, etc.
   */
  public detectCategory(text: string, filename = ''): "Lab Report" | "Imaging" | "Prescription" | "Vaccination" | "Discharge Summary" | "Other" {
    const lower = `${text} ${filename}`.toLowerCase();

    // 1. Radiology / Imaging (MRI, CT, X-Ray, Ultrasound, Mammography, PET, ECG)
    if (
      lower.includes('mri') || lower.includes('magnetic resonance') ||
      lower.includes('x-ray') || lower.includes('xray') || lower.includes('radiograph') || lower.includes('radiology') ||
      lower.includes('ct scan') || lower.includes('computed tomography') || lower.includes('hrct') || lower.includes('ncct') || lower.includes('cect') ||
      lower.includes('ultrasound') || lower.includes('usg') || lower.includes('sonography') || lower.includes('echocardiogram') ||
      lower.includes('mammography') || lower.includes('mammogram') || lower.includes('pet-ct') || lower.includes('pet scan') ||
      lower.includes('ecg') || lower.includes('electrocardiogram')
    ) {
      return 'Imaging';
    }

    // 2. Prescription
    if (
      lower.includes('rx') || lower.includes('prescription') || lower.includes('medication order') ||
      lower.includes('tablet') || lower.includes('capsule') || lower.includes('sig:') || lower.includes('dosage:')
    ) {
      return 'Prescription';
    }

    // 3. Vaccination
    if (
      lower.includes('vaccine') || lower.includes('vaccination') || lower.includes('immunization') ||
      lower.includes('booster dose') || lower.includes('covishield') || lower.includes('covaxin') || lower.includes('hepatitis b vaccine')
    ) {
      return 'Vaccination';
    }

    // 4. Discharge Summary
    if (
      lower.includes('discharge summary') || lower.includes('date of admission') || lower.includes('date of discharge') ||
      lower.includes('hospital course') || lower.includes('inpatient record')
    ) {
      return 'Discharge Summary';
    }

    // 5. Lab Report
    if (
      lower.includes('lab') || lower.includes('laboratory') || lower.includes('blood test') || lower.includes('serum') ||
      lower.includes('specimen') || lower.includes('hematology') || lower.includes('biochemistry') || lower.includes('urine') ||
      lower.includes('lipid') || lower.includes('glucose') || lower.includes('hba1c') || lower.includes('hemoglobin')
    ) {
      return 'Lab Report';
    }

    return 'Other';
  }

  /**
   * Extract Structured Radiology / Imaging Details (MRI, X-Ray, CT Scan, Ultrasound, ECG)
   */
  public extractImagingMarkers(text: string, filename = ''): ExtractedMarker[] {
    const markers: ExtractedMarker[] = [];
    const lower = `${text} ${filename}`.toLowerCase();

    // 1. Detect Modality
    let modality = 'Diagnostic Imaging';
    if (lower.includes('mri') || lower.includes('magnetic resonance')) modality = 'Magnetic Resonance Imaging (MRI)';
    else if (lower.includes('ct scan') || lower.includes('computed tomography') || lower.includes('hrct')) modality = 'Computed Tomography (CT Scan)';
    else if (lower.includes('x-ray') || lower.includes('xray') || lower.includes('radiograph')) modality = 'Digital Radiography (X-Ray)';
    else if (lower.includes('ultrasound') || lower.includes('usg') || lower.includes('sonography')) modality = 'Ultrasonography (USG)';
    else if (lower.includes('ecg') || lower.includes('electrocardiogram')) modality = '12-Lead Electrocardiogram (ECG)';
    else if (lower.includes('echo') || lower.includes('echocardiogram')) modality = '2D Echocardiogram (ECHO)';
    else if (lower.includes('mammogram') || lower.includes('mammography')) modality = 'Digital Mammography';

    markers.push({
      name: 'Imaging Modality',
      value: modality,
      unit: 'Radiology',
      status: 'normal',
      referenceRange: 'Standard Imaging Protocol'
    });

    // 2. Detect Anatomical Region
    let region = 'General Scan';
    if (lower.includes('brain') || lower.includes('head') || lower.includes('cranial') || lower.includes('skull')) region = 'Brain & Cranial Cavity';
    else if (lower.includes('chest') || lower.includes('lung') || lower.includes('thorax') || lower.includes('pulmonary')) region = 'Chest & Thoracic Cavity';
    else if (lower.includes('lumbar') || lower.includes('l-spine') || lower.includes('l1-l5') || lower.includes('l4-l5') || lower.includes('l5-s1')) region = 'Lumbar Spine (L-Spine)';
    else if (lower.includes('cervical') || lower.includes('c-spine') || lower.includes('c1-c7')) region = 'Cervical Spine (C-Spine)';
    else if (lower.includes('abdomen') || lower.includes('pelvis') || lower.includes('liver') || lower.includes('gallbladder') || lower.includes('kidney')) region = 'Abdomen & Pelvis';
    else if (lower.includes('knee') || lower.includes('joint') || lower.includes('meniscus') || lower.includes('acl')) region = 'Knee Joint (Musculoskeletal)';
    else if (lower.includes('heart') || lower.includes('cardiac') || lower.includes('myocardium')) region = 'Cardiovascular / Heart';
    else if (lower.includes('thyroid') || lower.includes('neck')) region = 'Thyroid & Neck';

    markers.push({
      name: 'Anatomical Region',
      value: region,
      unit: 'Target Organ',
      status: 'normal',
      referenceRange: 'Clinical Target'
    });

    // 3. Extract Radiological Impression / Finding
    let impression = '';
    const impMatch = text.match(/(?:IMPRESSION|CONCLUSION|OPINION|SUMMARY|FINDINGS):\s*([^\n\r]+(?:\n[^\n\r]+){0,3})/i);
    if (impMatch && impMatch[1]) {
      impression = impMatch[1].replace(/\s+/g, ' ').trim();
    }

    // Assess Clinical Status (negation-aware check)
    const lowerImp = (impression || text).toLowerCase();
    const normalKeywords = [
      'normal study', 'clear lung fields', 'no acute', 'unremarkable', 'within normal limits',
      'no focal abnormality', 'normal cardiac silhouette', 'intact', 'normal alignment',
      'no evidence of acute', 'without acute'
    ];

    const isExplicitlyNormal = normalKeywords.some(kw => lowerImp.includes(kw));

    let hasTrueAbnormality = false;
    for (const kw of ['bulge', 'herniation', 'protrusion', 'fracture', 'stenosis', 'fatty liver', 'calculus', 'lesion', 'mass', 'effusion', 'consolidation', 'edema', 'infarct', 'hemorrhage']) {
      const idx = lowerImp.indexOf(kw);
      if (idx !== -1) {
        const preceding = lowerImp.substring(Math.max(0, idx - 30), idx);
        if (!preceding.includes('no ') && !preceding.includes('without ') && !preceding.includes('free of ') && !preceding.includes('negative for ') && !preceding.includes('no focal ')) {
          hasTrueAbnormality = true;
          break;
        }
      }
    }

    let status: ExtractedMarker['status'] = 'normal';
    if (hasTrueAbnormality) {
      status = 'attention';
    } else if (!isExplicitlyNormal && lowerImp.includes('mild')) {
      status = 'borderline';
    } else {
      status = 'normal';
    }

    if (impression) {
      markers.push({
        name: 'Radiological Impression',
        value: impression.length > 90 ? impression.substring(0, 87) + '...' : impression,
        unit: 'Impression',
        status,
        referenceRange: 'Unremarkable / Normal Anatomical Study'
      });
    } else {
      markers.push({
        name: 'Study Status',
        value: status === 'normal' ? 'Unremarkable / Within Normal Limits' : 'Observation / Clinical Follow-up Needed',
        unit: 'Evaluation',
        status,
        referenceRange: 'Unremarkable Anatomical Study'
      });
    }

    return markers;
  }

  /**
   * Multimodal AI extraction using Gemini
   */
  private async extractWithGemini(input: string | Buffer, mimeType: string, preExtractedText: string, filename: string): Promise<OcrProcessingResult | null> {
    if (!this.genAI) return null;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a strict, expert Clinical OCR and Healthcare Document Analysis Assistant.
Analyze this uploaded file carefully.

Rules:
1. FIRST check if this is an actual medical/healthcare document (e.g. lab report, blood test, radiology MRI/CT/X-ray scan, prescription, discharge summary).
   - If it is NOT a medical document (e.g. an electricity bill, resume, receipt, invoice, code, general document), return "isMedical": false, "detectedCategory": "Other", "summary": "This document does not contain medical test results, clinical records, or radiology findings.", "extractedMarkers": [].
   - DO NOT hallucinate or make up fake medical markers for non-medical files!

2. If it IS an IMAGING / RADIOLOGY report (MRI, X-Ray, CT, Ultrasound, ECG, ECHO):
   - Set "detectedCategory": "Imaging"
   - Extract structured radiology parameters:
     - Name: "Imaging Modality" (e.g. MRI Lumbar Spine, Chest X-Ray PA View, USG Whole Abdomen)
     - Name: "Anatomical Target" (e.g. Lumbar Spine, Lungs & Thorax, Brain)
     - Name: "Radiological Impression" (the radiologist's conclusion, status: normal, borderline, or attention)
     - Name: Any specific clinical findings (e.g. "L4-L5 disc protrusion", "Clear lung fields")

3. If it IS a LAB REPORT / BLOOD TEST:
   - Extract ONLY biomarkers that actually appear in the text with genuine numbers and units.
   - Do NOT assume or invent values!

Return ONLY a valid JSON object in this exact schema (no markdown fences, no code blocks):
{
  "isMedical": true | false,
  "detectedCategory": "Lab Report" | "Imaging" | "Prescription" | "Vaccination" | "Discharge Summary" | "Other",
  "summary": "Accurate 1-3 sentence clinical summary with findings.",
  "extractedMarkers": [
    {
      "name": "Parameter Name",
      "value": "Measured numeric or clinical observation value",
      "unit": "Unit or category",
      "status": "normal" | "borderline" | "high" | "low" | "attention",
      "referenceRange": "Normal reference interval"
    }
  ]
}

Document Text (if extracted):
${preExtractedText.substring(0, 3500)}`;

      let responseText = '';

      if (mimeType.startsWith('image/')) {
        const imageBuffer = Buffer.isBuffer(input) ? input : fs.readFileSync(input);
        const imagePart = {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType
          }
        };
        const result = await model.generateContent([prompt, imagePart]);
        responseText = result.response.text();
      } else {
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      }

      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        rawText: preExtractedText || 'Extracted via Gemini Multimodal OCR',
        isMedical: parsed.isMedical !== false,
        extractedMarkers: Array.isArray(parsed.extractedMarkers) ? parsed.extractedMarkers : [],
        summary: parsed.summary || 'Medical document analyzed.',
        detectedCategory: parsed.detectedCategory || 'Lab Report'
      };
    } catch (err) {
      console.warn('Gemini direct OCR analysis skipped:', err);
      return null;
    }
  }

  /**
   * Comprehensive regex & NER biomarker parser (STRICT: extracts ONLY real values present in text)
   */
  public extractBiomarkers(text: string): ExtractedMarker[] {
    const markers: ExtractedMarker[] = [];

    // Helper to avoid duplicate markers
    const addMarker = (m: ExtractedMarker) => {
      if (!markers.some(existing => existing.name.toLowerCase() === m.name.toLowerCase())) {
        markers.push(m);
      }
    };

    // 1. HbA1c (Glycated Hemoglobin)
    const hba1cMatch = text.match(/(?:hba1c|glycated\s*hemoglobin|glycosylated\s*hb|a1c)[^\d\n:]*?[:\s-]*(\d+\.?\d*)\s*(%)/i);
    if (hba1cMatch && hba1cMatch[1]) {
      const val = parseFloat(hba1cMatch[1]);
      if (!isNaN(val) && val > 3 && val < 20) {
        let status: ExtractedMarker['status'] = 'normal';
        if (val >= 6.5) status = 'high';
        else if (val >= 5.7) status = 'borderline';
        addMarker({
          name: 'HbA1c',
          value: `${val}`,
          unit: '%',
          status,
          referenceRange: '< 5.7% (Normal), 5.7-6.4% (Pre-diabetes)'
        });
      }
    }

    // 2. Fasting Blood Glucose (FBS)
    const fbsMatch = text.match(/(?:fasting\s*glucose|fasting\s*blood\s*sugar|fbs|fasting\s*plasma\s*glucose)[^\d\n:]*?[:\s-]*(\d{2,3}(?:\.\d+)?)\s*(mg\/dl|mmol\/l)?/i);
    if (fbsMatch && fbsMatch[1]) {
      const val = parseFloat(fbsMatch[1]);
      if (!isNaN(val) && val > 30 && val < 600) {
        let status: ExtractedMarker['status'] = 'normal';
        if (val >= 126) status = 'high';
        else if (val >= 100) status = 'borderline';
        else if (val < 70) status = 'low';
        addMarker({
          name: 'Fasting Blood Glucose',
          value: `${val}`,
          unit: fbsMatch[2] || 'mg/dL',
          status,
          referenceRange: '70 - 99 mg/dL'
        });
      }
    }

    // 3. Postprandial Glucose (PPBS) or Random Glucose
    const ppbsMatch = text.match(/(?:postprandial\s*glucose|ppbs|random\s*blood\s*sugar|rbs)[^\d\n:]*?[:\s-]*(\d{2,3}(?:\.\d+)?)\s*(mg\/dl)?/i);
    if (ppbsMatch && ppbsMatch[1]) {
      const val = parseFloat(ppbsMatch[1]);
      if (!isNaN(val) && val > 30 && val < 600) {
        addMarker({
          name: 'Postprandial Blood Glucose',
          value: `${val}`,
          unit: 'mg/dL',
          status: val >= 140 ? (val >= 200 ? 'high' : 'borderline') : 'normal',
          referenceRange: '< 140 mg/dL'
        });
      }
    }

    // 4. Hemoglobin (Hb) - ensure it does not match Glycated Hemoglobin
    const hbMatch = text.match(/(?:(?<!glycated\s*)(?<!glycosylated\s*)(?<!\()\b(?:hemoglobin|haemoglobin)\b|\bserum\s*hb\b)[^\d\n:]*?[:\s-]*(\d{1,2}(?:\.\d+)?)\s*(g\/dl|gm\/dl|g\/l)/i);
    if (hbMatch && hbMatch[1]) {
      const val = parseFloat(hbMatch[1]);
      if (!isNaN(val) && val >= 5 && val <= 25) {
        let status: ExtractedMarker['status'] = 'normal';
        if (val < 13.0) status = 'low';
        else if (val > 17.5) status = 'high';
        addMarker({
          name: 'Hemoglobin',
          value: `${val}`,
          unit: 'g/dL',
          status,
          referenceRange: '13.0 - 17.5 g/dL'
        });
      }
    }

    // 5. Total Cholesterol
    const cholMatch = text.match(/(?:total\s*cholesterol|serum\s*cholesterol)[^\d\n:]*?[:\s-]*(\d{2,3})\s*(mg\/dl)?/i);
    if (cholMatch && cholMatch[1]) {
      const val = parseInt(cholMatch[1]);
      if (val >= 80 && val <= 500) {
        addMarker({
          name: 'Total Cholesterol',
          value: `${val}`,
          unit: 'mg/dL',
          status: val >= 240 ? 'high' : (val >= 200 ? 'borderline' : 'normal'),
          referenceRange: '< 200 mg/dL'
        });
      }
    }

    // 6. LDL Cholesterol
    const ldlMatch = text.match(/(?:ldl(?:\s*cholesterol)?|low\s*density\s*lipoprotein)[^\d\n:]*?[:\s-]*(\d{2,3})\s*(mg\/dl)?/i);
    if (ldlMatch && ldlMatch[1]) {
      const val = parseInt(ldlMatch[1]);
      if (val >= 30 && val <= 400) {
        addMarker({
          name: 'LDL Cholesterol',
          value: `${val}`,
          unit: 'mg/dL',
          status: val >= 160 ? 'high' : (val >= 100 ? 'borderline' : 'normal'),
          referenceRange: '< 100 mg/dL'
        });
      }
    }

    // 7. HDL Cholesterol
    const hdlMatch = text.match(/(?:hdl(?:\s*cholesterol)?|high\s*density\s*lipoprotein)[^\d\n:]*?[:\s-]*(\d{2,3})\s*(mg\/dl)?/i);
    if (hdlMatch && hdlMatch[1]) {
      const val = parseInt(hdlMatch[1]);
      if (val >= 15 && val <= 150) {
        addMarker({
          name: 'HDL Cholesterol',
          value: `${val}`,
          unit: 'mg/dL',
          status: val < 40 ? 'low' : 'normal',
          referenceRange: '> 40 mg/dL (Desirable > 50)'
        });
      }
    }

    // 8. Triglycerides
    const trigMatch = text.match(/(?:triglycerides|serum\s*triglyceride)[^\d\n:]*?[:\s-]*(\d{2,3})\s*(mg\/dl)?/i);
    if (trigMatch && trigMatch[1]) {
      const val = parseInt(trigMatch[1]);
      if (val >= 30 && val <= 1000) {
        addMarker({
          name: 'Triglycerides',
          value: `${val}`,
          unit: 'mg/dL',
          status: val >= 200 ? 'high' : (val >= 150 ? 'borderline' : 'normal'),
          referenceRange: '< 150 mg/dL'
        });
      }
    }

    // 9. Serum Creatinine (Kidney)
    const creatMatch = text.match(/(?:creatinine|serum\s*creatinine)[^\d\n:]*?[:\s-]*(\d{1,2}(?:\.\d+)?)\s*(mg\/dl)?/i);
    if (creatMatch && creatMatch[1]) {
      const val = parseFloat(creatMatch[1]);
      if (val >= 0.2 && val <= 15) {
        addMarker({
          name: 'Serum Creatinine',
          value: `${val}`,
          unit: 'mg/dL',
          status: val > 1.3 ? 'high' : (val < 0.6 ? 'low' : 'normal'),
          referenceRange: '0.7 - 1.3 mg/dL'
        });
      }
    }

    // 10. Vitamin D (25-OH)
    const vitDMatch = text.match(/(?:vitamin\s*d(?:\s*\(25-oh\))?|25-hydroxy\s*vitamin\s*d|25-oh\s*vit)[^\d\n:]*?[:\s-]*(\d{1,3}(?:\.\d+)?)\s*(ng\/ml)?/i);
    if (vitDMatch && vitDMatch[1]) {
      const val = parseFloat(vitDMatch[1]);
      if (val >= 1 && val <= 200) {
        addMarker({
          name: 'Vitamin D (25-OH)',
          value: `${val}`,
          unit: 'ng/mL',
          status: val < 20 ? 'low' : (val < 30 ? 'borderline' : 'normal'),
          referenceRange: '30 - 100 ng/mL'
        });
      }
    }

    // 11. Vitamin B12
    const vitB12Match = text.match(/(?:vitamin\s*b12|b12|cyanocobalamin)[^\d\n:]*?[:\s-]*(\d{2,4})\s*(pg\/ml)?/i);
    if (vitB12Match && vitB12Match[1]) {
      const val = parseInt(vitB12Match[1]);
      if (val >= 50 && val <= 3000) {
        addMarker({
          name: 'Vitamin B12',
          value: `${val}`,
          unit: 'pg/mL',
          status: val < 200 ? 'low' : 'normal',
          referenceRange: '200 - 900 pg/mL'
        });
      }
    }

    // 12. Thyroid Stimulating Hormone (TSH)
    const tshMatch = text.match(/(?:tsh|thyroid\s*stimulating\s*hormone)[^\d\n:]*?[:\s-]*(\d{1,2}(?:\.\d+)?)\s*(µiu\/ml|uiu\/ml|miu\/l)?/i);
    if (tshMatch && tshMatch[1]) {
      const val = parseFloat(tshMatch[1]);
      if (val >= 0.01 && val <= 50) {
        addMarker({
          name: 'TSH',
          value: `${val}`,
          unit: 'µIU/mL',
          status: val > 4.5 ? 'high' : (val < 0.4 ? 'low' : 'normal'),
          referenceRange: '0.4 - 4.5 µIU/mL'
        });
      }
    }

    // 13. Platelet Count
    const pltMatch = text.match(/(?:platelet\s*count|platelets)[^\d\n:]*?[:\s-]*(\d{2,4}(?:\.\d+)?)\s*(k\/µl|k\/ul|lakhs?\/cumm|\/cumm)?/i);
    if (pltMatch && pltMatch[1]) {
      const val = parseFloat(pltMatch[1]);
      addMarker({
        name: 'Platelet Count',
        value: `${val}`,
        unit: 'K/µL',
        status: val < 150 ? 'low' : (val > 450 ? 'high' : 'normal'),
        referenceRange: '150 - 450 K/µL'
      });
    }

    // 14. White Blood Cells (WBC)
    const wbcMatch = text.match(/(?:wbc\s*count|total\s*leukocyte\s*count|tlc)[^\d\n:]*?[:\s-]*(\d{3,6}(?:\.\d+)?)\s*(\/cumm|k\/µl)?/i);
    if (wbcMatch && wbcMatch[1]) {
      const val = parseFloat(wbcMatch[1]);
      addMarker({
        name: 'Total WBC Count',
        value: `${val}`,
        unit: '/cumm',
        status: (val < 4000) ? 'low' : ((val > 11000) ? 'high' : 'normal'),
        referenceRange: '4,000 - 11,000 /cumm'
      });
    }

    // 15. Blood Pressure
    const bpMatch = text.match(/(?:bp|blood\s*pressure)[^\d\n:]*?[:\s-]*(\d{2,3})\s*\/\s*(\d{2,3})\s*(mmhg)?/i);
    if (bpMatch && bpMatch[1] && bpMatch[2]) {
      const sys = parseInt(bpMatch[1]);
      const dia = parseInt(bpMatch[2]);
      if (sys >= 60 && sys <= 250 && dia >= 40 && dia <= 150) {
        addMarker({
          name: 'Blood Pressure',
          value: `${sys}/${dia}`,
          unit: 'mmHg',
          status: (sys >= 130 || dia >= 85) ? 'borderline' : 'normal',
          referenceRange: '< 120/80 mmHg'
        });
      }
    }

    return markers;
  }

  public generateClinicalSummary(text: string, markers: ExtractedMarker[], category: string, filename = ''): string {
    if (category === 'Imaging') {
      const mod = markers.find(m => m.name === 'Imaging Modality')?.value || 'Diagnostic Imaging';
      const reg = markers.find(m => m.name === 'Anatomical Region')?.value || 'Target Area';
      const imp = markers.find(m => m.name === 'Radiological Impression' || m.name === 'Study Status');

      if (imp?.status === 'attention' || imp?.status === 'borderline') {
        return `${mod} for ${reg} completed. Impression: ${imp.value}. Clinical correlation and consultation recommended.`;
      }
      return `${mod} for ${reg} completed. Findings appear within normal radiological limits.`;
    }

    if (markers.length === 0) {
      if (category === 'Prescription') {
        return `Clinical prescription archived. Prescribed medications and dosage captured.`;
      }
      if (category === 'Vaccination') {
        return `Immunization and vaccination record archived in health vault.`;
      }
      if (category === 'Discharge Summary') {
        return `Hospital clinical discharge summary recorded with diagnosis and inpatient course.`;
      }
      return `Medical ${category.toLowerCase()} archived. No standard numerical lab biomarkers detected in this specific document.`;
    }

    const borderlineOrHigh = markers.filter(m => m.status === 'borderline' || m.status === 'high' || m.status === 'low' || m.status === 'attention');
    const highlights = markers.map(m => `${m.name}: ${m.value} ${m.unit}`).join(', ');

    if (borderlineOrHigh.length > 0) {
      const flagged = borderlineOrHigh.map(m => `${m.name} (${m.value} ${m.unit}, ${m.status.toUpperCase()})`).join(', ');
      return `Extracted lab biomarkers: ${highlights}. Parameters flagged: ${flagged}. Please review with your doctor.`;
    }

    return `Extracted ${markers.length} physiological biomarkers: ${highlights}. All parameters appear within normal physiological ranges.`;
  }
}

export const ocrService = new OcrService();
