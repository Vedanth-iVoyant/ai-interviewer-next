// ── Session list view (GET /api/v1/sessions/) ─────────────────────────────
export interface InterviewSession {
  id: number;
  candidate_name: string;
  candidate_email: string;
  domain: string;
  topics: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'evaluated';
  created_at: string;
  completed_at: string | null;
  technical_score: number | null;
  communication_score: number | null;
  overall_score: number | null;
  result: 'pass' | 'fail' | null;
  total_questions: number;
  answered_questions: number;
}

// ── Question (shared between list + results views) ────────────────────────
export interface InterviewQuestion {
  id: number;
  question_number: number;
  topic: string;
  question_text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answer_text: string | null;
  answered_at: string | null;
  technical_accuracy: number | null;
  answer_feedback: string | null;
  key_points_covered: string[];
  key_points_missed: string[];
  clarity_score: number | null;
  confidence_score: number | null;
  structure_score: number | null;
}

// ── Soft skills evaluation ────────────────────────────────────────────────
export interface SoftSkillsEvaluation {
  communication_clarity: number;
  vocabulary_richness: number;
  answer_structure: number;
  confidence_level: number;
  conciseness: number;
  overall_communication: number;
  communication_feedback: string;
  strengths: string[];
  improvements: string[];
  created_at?: string;
}

// ── Evaluation report (parsed object returned by results endpoint) ────────
export interface EvaluationReport {
  overall_score: number;
  result: 'pass' | 'fail';
  summary: string;
  technical_highlights: string[];
  communication_highlights: string[];
  recommendation: string;
}

// ── Full results detail (GET /api/v1/sessions/<id>/results/) ──────────────
export interface SessionDetail {
  id: number;
  candidate_name: string;
  candidate_email: string;
  domain: string;
  topics: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'evaluated';
  created_at: string;
  completed_at: string | null;
  technical_score: number | null;
  communication_score: number | null;
  overall_score: number | null;
  result: 'pass' | 'fail' | null;
  evaluation_report: EvaluationReport | null;
  questions: InterviewQuestion[];
  soft_skills: SoftSkillsEvaluation | null;
}

// ── Interview flow ────────────────────────────────────────────────────────
export interface NextQuestionResponse {
  done: false;
  question_id: number;
  question_number: number;
  total_questions: number;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  think_time: number;
  answer_time: number;
}

export interface DoneResponse {
  done: true;
  message: string;
}

// ── Create session ────────────────────────────────────────────────────────
export interface CreateSessionRequest {
  candidate_name: string;
  candidate_email: string;
  domain: string;
  topics: string[];
}

export interface CreateSessionResponse {
  session_id: number;
  status: string;
  candidate_name: string;
  domain: string;
  topics: string[];
  total_questions: number;
  think_time: number;
  answer_time: number;
}

// ── Submit answer ─────────────────────────────────────────────────────────
export interface SubmitAnswerRequest {
  sessionId: number;
  question_id: number;
  answer_text: string;
  audio_base64?: string;
}

export interface SubmitAnswerResponse {
  status: string;
  question_id: number;
}

// ── Finish interview ──────────────────────────────────────────────────────
export interface FinishInterviewResponse {
  status: string;
  session_id: number;
  result?: 'pass' | 'fail';
  overall_score?: number;
  technical_score?: number;
  communication_score?: number;
}

// ── Domains ───────────────────────────────────────────────────────────────
export interface DomainsResponse {
  domains: string[];
  domain_topics: Record<string, string[]>;
}

// ── Session questions list ────────────────────────────────────────────────
export interface SessionQuestionsResponse {
  session_id: number;
  total: number;
  questions: InterviewQuestion[];
}

// ── Auth ──────────────────────────────────────────────────────────────────
export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  role?: string;
}

// ── Stored session info (localStorage) ───────────────────────────────────
export interface StoredSessionInfo {
  id: number;
  candidate_name: string;
  candidate_email: string;
  domain: string;
  topics: string[];
}
