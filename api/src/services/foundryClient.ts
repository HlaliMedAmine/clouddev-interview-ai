const MODEL = "gpt-4.1-mini";

interface FoundryResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

function chatCompletionsUrl(endpoint: string): string {
  const normalized = endpoint.replace(/\/+$/, "");
  return normalized.includes("/chat/completions")
    ? normalized
    : `${normalized}/openai/v1/chat/completions`;
}

export async function requestStructuredCompletion<T>(
  systemPrompt: string,
  userPayload: unknown,
  schemaName: string,
  schema: Record<string, unknown>,
): Promise<T> {
  const endpoint = process.env.AZURE_AI_FOUNDRY_ENDPOINT;
  const apiKey = process.env.AZURE_AI_FOUNDRY_API_KEY;
  if (!endpoint || !apiKey) {
    throw new Error("Azure AI Foundry server configuration is incomplete.");
  }

  const response = await fetch(chatCompletionsUrl(endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
      temperature: 0.4,
      response_format: {
        type: "json_schema",
        json_schema: { name: schemaName, strict: true, schema },
      },
    }),
    signal: AbortSignal.timeout(45_000),
  });

  const result = (await response.json()) as FoundryResponse;
  if (!response.ok) {
    throw new Error(result.error?.message ?? `Azure AI Foundry returned ${response.status}.`);
  }
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error("Azure AI Foundry returned an empty response.");
  return JSON.parse(content) as T;
}
