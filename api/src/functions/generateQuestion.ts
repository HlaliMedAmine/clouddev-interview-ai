import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from "@azure/functions";
import { requestStructuredCompletion } from "../services/foundryClient.js";

interface GenerateQuestionInput {
  mode: "certification" | "interview" | "scenario";
  exam: string | null;
  role: string | null;
  scenario: string | null;
  difficulty: string | null;
}

interface GeneratedQuestion {
  question: string;
  domain: string;
  expectedTopics: string[];
}

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["question", "domain", "expectedTopics"],
  properties: {
    question: { type: "string" },
    domain: { type: "string" },
    expectedTopics: { type: "array", items: { type: "string" } },
  },
};

function isInput(value: unknown): value is GenerateQuestionInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  return ["certification", "interview", "scenario"].includes(String(input.mode));
}

async function handler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const input = await request.json();
    if (!isInput(input)) return { status: 400, jsonBody: { error: "Invalid generation request." } };

    const output = await requestStructuredCompletion<GeneratedQuestion>(
      "You are a senior Microsoft Azure examiner and technical interviewer. Generate exactly one original, technically accurate Azure question appropriate to the supplied track and difficulty. Do not reveal the answer. expectedTopics must be concise concepts used later for evaluation. Return only the requested JSON object.",
      input,
      "azure_question",
      schema,
    );
    return { status: 200, jsonBody: output };
  } catch (error) {
    context.error("Question generation failed", error);
    return { status: 502, jsonBody: { error: "Unable to generate an Azure question right now." } };
  }
}

app.http("generate-question", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "generate-question",
  handler,
});
