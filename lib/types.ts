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
  evaluation_report: string | null;
}

export interface InterviewQuestion {
  id: number;
  question_number: number;
  topic: string;
  question_text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answer_text: string | null;
  technical_accuracy: number | null;
  answer_feedback: string | null;
  key_points_covered: string[];
  key_points_missed: string[];
}

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
}

export interface EvaluationReport {
  summary: string;
  recommendation: string;
  overall_score: number;
  result: 'pass' | 'fail';
}

export interface SessionDetail extends InterviewSession {
  questions: InterviewQuestion[];
  soft_skills: SoftSkillsEvaluation | null;
  report: EvaluationReport | null;
}

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

export interface StoredSessionInfo {
  id: number;
  candidate_name: string;
  candidate_email: string;
  domain: string;
  topics: string[];
}
