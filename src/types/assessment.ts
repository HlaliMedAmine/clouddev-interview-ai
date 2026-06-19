export type AssessmentMode = "certification" | "interview" | "scenario";

export interface SessionConfig {
  certification?: string;
  role?: string;
  experience?: string;
  topic?: string;
  difficulty?: string;
  questionCount?: number;
}

export interface Question {
  id: string;
  topic: string;
  prompt: string;
  expectedTopics: string[];
}

export interface AnswerEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  idealAnswer: string;
  learningRecommendations: string[];
}

export interface AnswerRecord {
  question: Question;
  answer: string;
  result: AnswerEvaluation;
}

export interface SessionState {
  mode: AssessmentMode | null;
  name: string;
  email: string;
  config: SessionConfig;
  questions: Question[];
  current: number;
  answers: AnswerRecord[];
}

export interface LearningPlanDay {
  day: number;
  topic: string;
  objectives: string[];
  studyTasks: string[];
}
