interface Env {
  AI: Ai;
  IACODE_TOKEN: string;
  MODEL: string;
}

interface ChatRequest {
  model?: string;
  messages?: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  max_tokens?: number;
}

interface AiResponse {
  response?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    if (request.method !== "POST" || new URL(request.url).pathname !== "/v1/chat/completions") {
      return json({ error: { message: "Use POST /v1/chat/completions" } }, 404);
    }
    const authorization = request.headers.get("Authorization");
    if (!env.IACODE_TOKEN || authorization !== `Bearer ${env.IACODE_TOKEN}`) {
      return json({ error: { message: "Unauthorized" } }, 401);
    }

    let body: ChatRequest;
    try {
      body = await request.json() as ChatRequest;
    } catch {
      return json({ error: { message: "Invalid JSON" } }, 400);
    }
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return json({ error: { message: "messages is required" } }, 400);
    }

    const result = await env.AI.run(env.MODEL, {
      messages: body.messages,
      temperature: body.temperature ?? 0.15,
      max_tokens: Math.min(body.max_tokens ?? 8192, 8192),
      response_format: { type: "json_object" }
    }) as AiResponse;
    const content = result.response ?? "";
    return json({
      id: `iacode-${crypto.randomUUID()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: body.model ?? env.MODEL,
      choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }]
    }, 200);
  }
};

function json(value: unknown, status: number): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() }
  });
}

function corsHeaders(): Record<string, string> {
  return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Authorization, Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
}
