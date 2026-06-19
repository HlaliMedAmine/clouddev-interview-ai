import type { AnswerEvaluation, Question, SessionState } from "@/types/assessment";

interface GenerateQuestionResponse {
  question: string;
  domain: string;
  expectedTopics: string[];
}

interface EvaluateAnswerResponse {
  score: number;
  strengths: string[];
  weaknesses: string[];
  idealAnswer: string;
  learningRecommendations: string[];
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok || !payload) {
    throw new Error(payload?.error ?? "Azure AI Coach could not complete the request.");
  }
  return payload;
}

function generationInput(state: SessionState) {
  return {
    mode: state.mode,
    exam: state.config.certification ?? null,
    role: state.config.role ?? null,
    scenario: state.config.topic ?? null,
    difficulty: state.config.difficulty ?? state.config.experience ?? null,
  };
}

async function generateQuestion(state: SessionState): Promise<Question> {
  const generated = await postJson<GenerateQuestionResponse>(
    "/api/generate-question",
    generationInput(state),
  );
  return {
    id: crypto.randomUUID(),
    prompt: generated.question,
    topic: generated.domain,
    expectedTopics: generated.expectedTopics,
  };
}

export async function startSession(state: SessionState): Promise<Question[]> {
  return [await generateQuestion(state)];
}

export async function getQuestion(state: SessionState): Promise<Question> {
  return generateQuestion(state);
}

export async function evaluateAnswer(
  question: Question,
  answer: string,
  mode: SessionState["mode"],
): Promise<AnswerEvaluation> {
  const evaluated = await postJson<EvaluateAnswerResponse>("/api/evaluate-answer", {
    question: question.prompt,
    answer,
    mode,
  });
  return evaluated;
}
