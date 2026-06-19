import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from "@azure/functions";
import { requestStructuredCompletion } from "../services/foundryClient.js";

interface EvaluationInput {
  question: string;
  answer: string;
  mode: "certification" | "interview" | "scenario";
}

interface Evaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  idealAnswer: string;
  learningRecommendations: string[];
}

const stringList = { type: "array", items: { type: "string" } };
const schema = {
  type: "object",
  additionalProperties: false,
  required: ["score", "strengths", "weaknesses", "idealAnswer", "learningRecommendations"],
  properties: {
    score: { type: "integer", minimum: 0, maximum: 100 },
    strengths: stringList,
    weaknesses: stringList,
    idealAnswer: { type: "string" },
    learningRecommendations: stringList,
  },
};

function isInput(value: unknown): value is EvaluationInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  return (
    typeof input.question === "string" &&
    typeof input.answer === "string" &&
    input.answer.trim().length > 0 &&
    ["certification", "interview", "scenario"].includes(String(input.mode))
  );
}

async function handler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const input = await request.json();
    if (!isInput(input)) return { status: 400, jsonBody: { error: "Invalid evaluation request." } };

    const output = await requestStructuredCompletion<Evaluation>(
      "You are a rigorous Microsoft Azure assessor. Evaluate only the supplied answer against the supplied question. Score from 0 to 100 based on technical accuracy, completeness, Azure-specific reasoning, security, and trade-offs. Give actionable feedback and a concise expert ideal answer. Return only the requested JSON object.",
      input,
      "azure_answer_evaluation",
      schema,
    );
    return { status: 200, jsonBody: output };
  } catch (error) {
    context.error("Answer evaluation failed", error);
    return { status: 502, jsonBody: { error: "Unable to evaluate the answer right now." } };
  }
}

app.http("evaluate-answer", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "evaluate-answer",
  handler,
});
