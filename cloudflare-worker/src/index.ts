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

const fileFormatInstruction = "Formato obrigatório: responda com blocos no formato <<<FILE: caminho/arquivo>>> seguido do conteúdo literal e finalize cada bloco com <<<END FILE>>>. Exemplo: <<<FILE: README.md>>>\n# Título\n<<<END FILE>>>. Não use JSON, markdown externo ou explicações fora dos blocos.";

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

    let result: AiResponse;
    try {
      result = await env.AI.run(env.MODEL, {
        messages: body.messages,
        temperature: body.temperature ?? 0.15,
        max_tokens: Math.min(body.max_tokens ?? 8192, 8192)
      }) as AiResponse;
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Workers AI failed";
      return json({ error: { message: `Workers AI: ${detail}` } }, 502);
    }
    let content = normalizeModelResponse(result.response ?? "");
    if (!isJson(content)) {
      try {
        const repaired = await env.AI.run(env.MODEL, {
          messages: [
            { role: "system", content: `Converta a resposta abaixo para blocos de arquivos. ${fileFormatInstruction}` },
            { role: "user", content: result.response ?? "" }
          ],
          temperature: 0,
          max_tokens: 8192
        }) as AiResponse;
        content = parseFileBlocks(repaired.response ?? "");
      } catch {
        return json({ error: { message: "Workers AI não conseguiu estruturar os arquivos. Tente enviar um pedido menor." } }, 502);
      }
    }
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

function normalizeModelResponse(content: string): string {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const candidate = cleaned.slice(start, end + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch {
        return cleaned;
      }
    }
    return cleaned;
  }
}

function isJson(content: string): boolean {
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}

function parseFileBlocks(content: string): string {
  const files = [...content.matchAll(/<<<FILE:\s*([^>]+?)>>>\s*([\s\S]*?)<<<END FILE>>>/gi)]
    .map((match) => ({ path: match[1].trim(), content: match[2].replace(/^\r?\n/, "") }));
  if (files.length === 0) {
    throw new Error("Nenhum bloco de arquivo encontrado");
  }
  return JSON.stringify({ files });
}

function corsHeaders(): Record<string, string> {
  return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Authorization, Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
}
