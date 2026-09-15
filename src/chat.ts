import * as vscode from "vscode";

interface AgentAction {
  type: "write_file" | "read_file";
  path: string;
  content?: string;
}

interface AgentResult {
  message: string;
  actions?: AgentAction[];
}

interface ChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

let panel: vscode.WebviewPanel | undefined;
let conversation: ChatMessage[] = [];
let projectBrief: string | undefined;

export function openStandaloneChat(context: vscode.ExtensionContext): void {
  if (panel) {
    panel.reveal(vscode.ViewColumn.Two);
    return;
  }

  panel = vscode.window.createWebviewPanel("iacode.chat", "IAcode Chat", vscode.ViewColumn.Two, {
    enableScripts: true,
    retainContextWhenHidden: true
  });
  panel.webview.html = getHtml(panel.webview);
  panel.webview.onDidReceiveMessage(async (message) => {
    if (message.type !== "send" || typeof message.content !== "string" || !message.content.trim()) {
      return;
    }
    const prompt = message.content.trim();
    if (!projectBrief) {
      projectBrief = prompt;
    }
    conversation.push({ role: "user", content: prompt });
    panel?.webview.postMessage({ type: "status", content: "IAcode está trabalhando..." });
    try {
      const result = await runAgent(prompt);
      conversation.push({ role: "assistant", content: result.message });
      panel?.webview.postMessage({ type: "answer", content: result.message, actions: result.actions?.map((action) => `${action.type}: ${action.path}`) ?? [] });
    } catch (error) {
      const detail = error instanceof Error ? error.message : "erro desconhecido";
      panel?.webview.postMessage({ type: "error", content: detail });
    }
  }, undefined, context.subscriptions);
  panel.onDidDispose(() => {
    panel = undefined;
    conversation = [];
    projectBrief = undefined;
  }, undefined, context.subscriptions);
}

async function runAgent(prompt: string): Promise<AgentResult> {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    throw new Error("Abra uma pasta de projeto no VS Code antes de usar o IAcode.");
  }
  const files = await vscode.workspace.findFiles("**/*", "**/{node_modules,.git,out,dist}/**", 120);
  const workspaceContext = await getWorkspaceContext(files);
  const config = vscode.workspace.getConfiguration("iacode");
  const providerUrl = config.get<string>("providerUrl", "").replace(/\/$/, "");
  const model = config.get<string>("model", "");
  const apiKey = config.get<string>("apiKey", "");
  if (!providerUrl || !model) {
    throw new Error("Configure IAcode: Provider Url e IAcode: Model com o endpoint cloud do IAcode.");
  }
  const response = await fetch(`${providerUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) },
    body: JSON.stringify({
      model,
      temperature: 0.15,
      max_tokens: 8192,
      messages: [
        {
          role: "system",
          content: "Você é o IAcode, um agente de desenvolvimento. Responda SOMENTE JSON válido no formato {\"message\":\"resposta em Markdown\",\"actions\":[{\"type\":\"write_file\" ou \"read_file\",\"path\":\"caminho relativo\",\"content\":\"conteúdo quando write_file\"}]}. Você pode criar e alterar arquivos do workspace. Nunca use caminhos absolutos, .., arquivos binários ou comandos de terminal."
        },
        ...conversation,
        { role: "user", content: `Briefing inicial:\n${projectBrief}\n\nPedido atual:\n${prompt}\n\nArquivos e conteúdo atual:\n${workspaceContext}\n\nRetorne somente JSON válido. Não escreva introdução, explicação ou markdown fora do JSON. Na primeira solicitação, implemente o briefing em etapas pequenas. Nas próximas, corrija o que já existe sem recriar arquivos desnecessariamente.` }
      ]
    })
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`o provedor retornou HTTP ${response.status}: ${detail.slice(0, 400)}`);
  }
  const payload = await response.json() as ChatResponse;
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("a IA não retornou uma resposta");
  }
  let result: AgentResult;
  try {
    result = parseJson<AgentResult>(content);
  } catch {
    const preview = content.replace(/\s+/g, " ").slice(0, 180);
    throw new Error(`a IA não retornou JSON. Resposta recebida: ${preview || "vazia"}`);
  }
  for (const action of result.actions ?? []) {
    if (action.type === "write_file") {
      await writeFile(workspace.uri, action.path, action.content ?? "");
    } else if (action.type === "read_file") {
      await readFile(workspace.uri, action.path);
    }
  }
  return result;
}

async function getWorkspaceContext(files: vscode.Uri[]): Promise<string> {
  const entries: string[] = [];
  let totalSize = 0;
  for (const file of files) {
    if (totalSize >= 70000) {
      entries.push("[Arquivos restantes omitidos por limite de contexto]");
      break;
    }
    try {
      const content = Buffer.from(await vscode.workspace.fs.readFile(file)).toString("utf8");
      if (content.includes("\u0000")) {
        continue;
      }
      const relativePath = vscode.workspace.asRelativePath(file);
      const excerpt = content.slice(0, 70000 - totalSize);
      entries.push(`--- ${relativePath} ---\n${excerpt}`);
      totalSize += excerpt.length;
    } catch {
      // Ignora arquivos que não podem ser lidos.
    }
  }
  return entries.join("\n") || "workspace vazio";
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

function safePath(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  if (!normalized || normalized.startsWith("/") || normalized.split("/").includes("..")) {
    throw new Error(`caminho inválido: ${path}`);
  }
  return normalized;
}

async function writeFile(root: vscode.Uri, path: string, content: string): Promise<void> {
  const normalized = safePath(path);
  const target = vscode.Uri.joinPath(root, normalized);
  const parts = normalized.split("/");
  parts.pop();
  let parent = root;
  for (const part of parts) {
    parent = vscode.Uri.joinPath(parent, part);
    await vscode.workspace.fs.createDirectory(parent);
  }
  await vscode.workspace.fs.writeFile(target, Buffer.from(normalizeGeneratedContent(content), "utf8"));
}

function normalizeGeneratedContent(content: string): string {
  return content.replace(/\\r\\n/g, "\r\n").replace(/\\n/g, "\n").replace(/\\t/g, "\t");
}

async function readFile(root: vscode.Uri, path: string): Promise<string> {
  return Buffer.from(await vscode.workspace.fs.readFile(vscode.Uri.joinPath(root, safePath(path)))).toString("utf8");
}

function getHtml(webview: vscode.Webview): string {
  const nonce = `${Date.now()}${Math.random().toString(16).slice(2)}`;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'"><style>
body{font-family:var(--vscode-font-family);color:var(--vscode-foreground);background:var(--vscode-editor-background);padding:20px;max-width:900px;margin:auto}h1{font-size:22px}.hint{color:var(--vscode-descriptionForeground)}#messages{display:flex;flex-direction:column;gap:12px;margin:24px 0}.message{padding:12px 14px;border-radius:8px;white-space:pre-wrap;line-height:1.5}.user{background:var(--vscode-textBlockQuote-background);align-self:flex-end;max-width:80%}.assistant{background:var(--vscode-editor-inactiveSelectionBackground);align-self:flex-start;max-width:90%}form{display:flex;gap:8px;position:sticky;bottom:0;background:var(--vscode-editor-background);padding-top:10px}textarea{flex:1;resize:vertical;min-height:52px;padding:10px;color:inherit;background:var(--vscode-input-background);border:1px solid var(--vscode-input-border)}button{padding:0 18px;color:var(--vscode-button-foreground);background:var(--vscode-button-background);border:0;border-radius:4px}button:hover{background:var(--vscode-button-hoverBackground)}small{color:var(--vscode-descriptionForeground)}</style></head><body><h1>IAcode Cloud 0.4.6</h1><div class="hint">Converse diretamente com o agente cloud do IAcode. Envie o briefing completo na primeira mensagem; depois peça apenas correções ou melhorias.</div><div id="messages"></div><form><textarea id="input" placeholder="Briefing inicial: objetivo, telas, tecnologias, dados e regras..."></textarea><button>Enviar</button></form><script nonce="${nonce}">
body{font-family:var(--vscode-font-family);color:var(--vscode-foreground);background:var(--vscode-editor-background);padding:20px;max-width:900px;margin:auto}h1{font-size:22px}.hint{color:var(--vscode-descriptionForeground)}#messages{display:flex;flex-direction:column;gap:12px;margin:24px 0}.message{padding:12px 14px;border-radius:8px;white-space:pre-wrap;line-height:1.5}.user{background:var(--vscode-textBlockQuote-background);align-self:flex-end;max-width:80%}.assistant{background:var(--vscode-editor-inactiveSelectionBackground);align-self:flex-start;max-width:90%}form{display:flex;gap:8px;position:sticky;bottom:0;background:var(--vscode-editor-background);padding-top:10px}textarea{flex:1;resize:vertical;min-height:52px;padding:10px;color:inherit;background:var(--vscode-input-background);border:1px solid var(--vscode-input-border)}button{padding:0 18px;color:var(--vscode-button-foreground);background:var(--vscode-button-background);border:0;border-radius:4px}button:hover{background:var(--vscode-button-hoverBackground)}small{color:var(--vscode-descriptionForeground)}</style></head><body><h1>IAcode</h1><div class="hint">Converse diretamente com seu agente de desenvolvimento. Esta janela não usa o Chat do Copilot.</div><div id="messages"></div><form><textarea id="input" placeholder="Ex.: crie um dashboard em React e TypeScript..."></textarea><button>Enviar</button></form><script nonce="${nonce}">
const vscode=acquireVsCodeApi(),messages=document.getElementById('messages'),input=document.getElementById('input');function add(text,kind){const item=document.createElement('div');item.className='message '+kind;item.textContent=text;messages.appendChild(item);item.scrollIntoView();}document.querySelector('form').addEventListener('submit',event=>{event.preventDefault();const text=input.value.trim();if(!text)return;add(text,'user');vscode.postMessage({type:'send',content:text});input.value='';});window.addEventListener('message',event=>{const data=event.data;if(data.type==='status')add(data.content,'assistant');if(data.type==='answer'){add(data.content+(data.actions.length?'\\n\\nAções: '+data.actions.join(', '):''),'assistant');}if(data.type==='error')add('Erro: '+data.content,'assistant');});input.focus();</script></body></html>`;
}
