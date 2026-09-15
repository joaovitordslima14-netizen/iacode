import * as vscode from "vscode";

export interface ProjectRequest {
  idea: string;
  projectType: string;
  languages: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
}

interface ChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export async function generateProject(request: ProjectRequest): Promise<GeneratedFile[]> {
  const config = vscode.workspace.getConfiguration("iacode");
  const providerUrl = config.get<string>("providerUrl", "").replace(/\/$/, "");
  const model = config.get<string>("model", "");
  const apiKey = config.get<string>("apiKey", "");
  if (!providerUrl || !model) {
    throw new Error("Configure IAcode: Provider Url e IAcode: Model com o endpoint cloud do IAcode.");
  }
  const response = await fetch(`${providerUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 8192,
      messages: [
        {
          role: "system",
          content: "Você é um arquiteto e engenheiro de software sênior. Gere projetos pequenos, executáveis e coerentes. Responda SOMENTE com JSON válido no formato {\"files\":[{\"path\":\"relative/path\",\"content\":\"file content\"}]}. Não use markdown. Nunca inclua caminhos absolutos, .. ou arquivos binários."
        },
        {
          role: "user",
          content: `Crie a primeira versão funcional de um projeto.\nTipo: ${request.projectType}\nIdeia: ${request.idea}\nTecnologias escolhidas: ${request.languages.join(", ")}\nInclua arquivos de configuração, código principal, estilos e um README com instruções para executar. Mantenha o escopo implementável e use nomes de arquivos convencionais. Retorne somente JSON válido, sem markdown, introdução ou texto antes/depois do objeto.`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`O provedor retornou HTTP ${response.status}. Verifique iacode.providerUrl e iacode.apiKey.`);
  }

  const payload = await response.json() as ChatResponse;
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("A resposta do modelo não contém arquivos.");
  }

  let parsed: { files?: GeneratedFile[] };
  try {
    parsed = parseJson<{ files?: GeneratedFile[] }>(content);
  } catch {
    const preview = content.replace(/\s+/g, " ").slice(0, 180);
    throw new Error(`A IA não retornou JSON. Resposta recebida: ${preview || "vazia"}`);
  }

  if (!Array.isArray(parsed.files) || parsed.files.length === 0 || parsed.files.some((file) => !file.path || typeof file.content !== "string")) {
    throw new Error("A IA retornou um formato de projeto inválido.");
  }
  return parsed.files;
}

function parseJson<T>(content: string): T {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) {
      throw new Error("JSON ausente");
    }
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  }
}
