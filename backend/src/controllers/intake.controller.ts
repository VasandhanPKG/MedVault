import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, ClinicalInterviewSession, MedicalRecord } from '../services/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { geminiService } from '../services/gemini.service';
import { DEPARTMENT_REGISTRY } from '../services/department-ontology.service';

/**
 * Automatically sync/save completed AI Intake session as a Medical Record in patient's vault
 */
async function syncIntakeToMedicalRecord(session: ClinicalInterviewSession): Promise<string | undefined> {
  if (!session.summary) return undefined;

  try {
    const recordId = session.recordId || `rec-intake-${session.id.replace('intake-', '')}`;
    const existing = await db.getRecordById(recordId, session.userId);

    const structuredMarkers = Object.entries(session.summary.structuredFields || {}).map(([name, val]) => ({
      name,
      value: String(val),
      unit: '',
      status: 'normal'
    }));

    const rawSummaryText = `
=== MEDVAULT PRE-CONSULTATION CLINICAL INTAKE ===
Department: ${session.departmentName}
Chief Complaint: ${session.summary.chiefComplaint}
Triage Level: ${session.summary.suggestedTriageLevel}
Language: ${session.language.toUpperCase()}
Date: ${new Date(session.createdAt).toLocaleDateString()}

CLINICAL NARRATIVE:
${session.summary.clinicalNarrative}

STRUCTURED CLINICAL FINDINGS:
${Object.entries(session.summary.structuredFields || {}).map(([k, v]) => `• ${k}: ${v}`).join('\n')}

${session.redFlags && session.redFlags.length > 0 ? `CRITICAL RED FLAGS:\n${session.redFlags.map(f => `⚠️ ${f}`).join('\n')}` : ''}
`.trim();

    const recordPayload: MedicalRecord = {
      id: recordId,
      userId: session.userId,
      name: `[AI Intake] ${session.departmentName} - ${session.summary.chiefComplaint}`,
      date: (session.createdAt || new Date().toISOString()).split('T')[0],
      type: 'DOC',
      category: 'Discharge Summary',
      status: 'processed',
      size: '145 KB',
      summary: session.summary.clinicalNarrative,
      rawText: rawSummaryText,
      extractedMarkers: structuredMarkers,
      createdAt: session.createdAt || new Date().toISOString()
    };

    if (!existing) {
      await db.addRecord(recordPayload);
      session.recordId = recordId;
    }
    return recordId;
  } catch (err) {
    console.error('Failed to sync intake to medical records:', err);
    return undefined;
  }
}

/**
 * List all supported medical departments and intake metadata
 */
export const getDepartments = async (_req: AuthenticatedRequest, res: Response) => {
  const departments = Object.values(DEPARTMENT_REGISTRY).map(d => ({
    id: d.id,
    name: d.name,
    category: d.category,
    description: d.description,
    icon: d.icon,
    commonSymptoms: d.commonSymptoms,
    totalQuestions: d.questions.length,
    languagesSupported: [
      { code: "en", label: "English" },
      { code: "ta", label: "தமிழ் (Tamil)" },
      { code: "hi", label: "हिंदी (Hindi)" }
    ]
  }));

  return res.json({
    count: departments.length,
    departments
  });
};

/**
 * Start a new clinical pre-consultation interview session
 */
export const startInterviewSession = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-1';
  const { departmentId, language = 'en' } = req.body;

  const department = DEPARTMENT_REGISTRY[departmentId];
  if (!department) {
    return res.status(400).json({ error: `Department '${departmentId}' is not registered.` });
  }

  const user = await db.findUserById(userId);
  const sessionId = `intake-${Date.now()}-${uuidv4().substring(0, 6)}`;

  const firstQDef = department.questions[0];
  const langKey = (language === 'ta' || language === 'hi') ? (language as 'ta' | 'hi') : 'en';
  const qText = firstQDef.question[langKey] || firstQDef.question.en;

  const formattedOptions = firstQDef.options ? firstQDef.options.map(opt => ({
    value: opt.value,
    label: (language === 'ta' && opt.tamilLabel) ? opt.tamilLabel : (language === 'hi' && opt.hindiLabel) ? opt.hindiLabel : opt.label
  })) : undefined;

  const initialMessage = {
    role: 'assistant' as const,
    text: qText,
    slotKey: firstQDef.slotKey,
    timestamp: new Date().toISOString()
  };

  const newSession: ClinicalInterviewSession = {
    id: sessionId,
    userId,
    patientName: user?.name || "Patient",
    departmentId: department.id,
    departmentName: department.name,
    language,
    status: 'in_progress',
    currentSlotIndex: 1,
    totalSlots: department.questions.length,
    messages: [initialMessage],
    collectedData: {},
    redFlags: [],
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await db.createInterviewSession(newSession);

  return res.status(201).json({
    sessionId,
    department: {
      id: department.id,
      name: department.name,
      icon: department.icon
    },
    language,
    currentQuestion: {
      id: firstQDef.id,
      slotKey: firstQDef.slotKey,
      text: qText,
      options: formattedOptions,
      inputType: firstQDef.inputType,
      questionIndex: 1,
      totalQuestions: department.questions.length
    },
    status: 'in_progress'
  });
};

/**
 * Submit an answer to the current interview question (Voice, Text, or Touch)
 */
export const submitInterviewAnswer = async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId } = req.params;
  const { answerText, inputMode = 'text', language } = req.body;

  if (!answerText || answerText.trim() === '') {
    return res.status(400).json({ error: 'answerText is required' });
  }

  const session = await db.getInterviewSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Interview session not found' });
  }

  if (session.status === 'completed' || session.status === 'verified') {
    return res.json({
      sessionId,
      isComplete: true,
      status: session.status,
      summary: session.summary,
      message: 'Interview session is already finalized.'
    });
  }

  const department = DEPARTMENT_REGISTRY[session.departmentId];
  if (!department) {
    return res.status(500).json({ error: 'Department ontology configuration not found' });
  }

  const patientLang = language || session.language || 'en';

  // Append patient's answer to dialogue history
  const lastAssistantMsg = session.messages[session.messages.length - 1];
  session.messages.push({
    role: 'user',
    text: answerText.trim(),
    slotKey: lastAssistantMsg?.slotKey,
    inputMode,
    timestamp: new Date().toISOString()
  });

  // Process answer adaptively via AI Service with Fallback
  const adaptiveResult = await geminiService.processAdaptiveIntakeStep(
    department,
    session.messages,
    answerText.trim(),
    session.collectedData,
    patientLang
  );

  // Merge extracted clinical entities and red flags
  session.collectedData = { ...session.collectedData, ...adaptiveResult.extractedEntities };
  if (adaptiveResult.redFlags && adaptiveResult.redFlags.length > 0) {
    session.redFlags = Array.from(new Set([...session.redFlags, ...adaptiveResult.redFlags]));
  }

  if (adaptiveResult.isComplete || !adaptiveResult.nextQuestion) {
    // Generate Final Structured Pre-Consultation Summary
    const summary = await geminiService.generatePreConsultationSummary(
      department,
      session.messages,
      session.collectedData,
      session.redFlags,
      patientLang
    );

    session.status = 'completed';
    session.summary = summary;
    session.updatedAt = new Date().toISOString();

    // Auto-sync completed intake directly into Medical Records
    const recordId = await syncIntakeToMedicalRecord(session);
    session.recordId = recordId;

    await db.updateInterviewSession(sessionId, session);

    return res.json({
      sessionId,
      isComplete: true,
      status: 'completed',
      collectedData: session.collectedData,
      redFlags: session.redFlags,
      summary,
      recordId
    });
  }

  // Push the next question to messages
  session.messages.push({
    role: 'assistant',
    text: adaptiveResult.nextQuestion.text,
    slotKey: adaptiveResult.nextQuestion.slotKey,
    timestamp: new Date().toISOString()
  });
  session.currentSlotIndex = session.messages.filter(m => m.role === 'assistant').length;
  session.updatedAt = new Date().toISOString();

  await db.updateInterviewSession(sessionId, session);

  return res.json({
    sessionId,
    isComplete: false,
    status: 'in_progress',
    collectedData: session.collectedData,
    redFlags: session.redFlags,
    nextQuestion: {
      id: adaptiveResult.nextQuestion.id,
      slotKey: adaptiveResult.nextQuestion.slotKey,
      text: adaptiveResult.nextQuestion.text,
      options: adaptiveResult.nextQuestion.options,
      inputType: adaptiveResult.nextQuestion.inputType,
      questionIndex: session.currentSlotIndex,
      totalQuestions: department.questions.length
    }
  });
};

/**
 * Get the summary and transcript of an intake session
 */
export const getInterviewSummary = async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId } = req.params;

  const session = await db.getInterviewSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Interview session not found' });
  }

  const department = DEPARTMENT_REGISTRY[session.departmentId];

  // If session is complete but summary wasn't generated yet, generate now
  if (!session.summary && department) {
    session.summary = await geminiService.generatePreConsultationSummary(
      department,
      session.messages,
      session.collectedData,
      session.redFlags,
      session.language
    );
    await db.updateInterviewSummary(sessionId, session.summary);
  }

  // Auto-sync if completed
  if (session.summary && (session.status === 'completed' || session.status === 'verified')) {
    const recordId = await syncIntakeToMedicalRecord(session);
    session.recordId = recordId;
  }

  return res.json({
    session,
    summary: session.summary,
    recordId: session.recordId,
    isVerified: session.isVerified,
    doctorNotes: session.doctorNotes
  });
};

/**
 * Doctor/Patient edits summary fields or adds clinical notes
 */
export const updateInterviewSummary = async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId } = req.params;
  const { summary, doctorNotes } = req.body;

  const session = await db.getInterviewSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Interview session not found' });
  }

  const updatedSummary = summary || session.summary;
  session.summary = updatedSummary;
  if (doctorNotes) session.doctorNotes = doctorNotes;

  // Re-sync updated summary to medical record
  await syncIntakeToMedicalRecord(session);

  const updated = await db.updateInterviewSummary(sessionId, updatedSummary, doctorNotes);

  return res.json({
    success: true,
    session: updated,
    recordId: session.recordId
  });
};

/**
 * Doctor verifies and attests the pre-consultation intake
 */
export const verifyInterviewSession = async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId } = req.params;
  const { doctorName = "Attending Physician", doctorNotes } = req.body;

  const session = await db.getInterviewSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Interview session not found' });
  }

  const updated = await db.verifyInterviewSession(sessionId, doctorName, doctorNotes);

  return res.json({
    success: true,
    message: 'Clinical pre-consultation interview verified and attested by clinician.',
    session: updated
  });
};

/**
 * List all past intake interviews for the logged-in patient
 */
export const getPatientInterviews = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id || 'usr-1';
  const interviews = await db.getPatientInterviews(userId);

  return res.json({
    count: interviews.length,
    interviews
  });
};
