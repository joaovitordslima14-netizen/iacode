import * as vscode from "vscode";
import { openStandaloneChat } from "./chat";
import { generateProject, ProjectRequest } from "./generator";

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(vscode.commands.registerCommand("iacode.openChat", () => openStandaloneChat(context)));
  const command = vscode.commands.registerCommand("iacode.createProject", async () => {
    const idea = await vscode.window.showInputBox({
      title: "IAcode - ideia do produto",
      prompt: "Descreva o app ou site que a IA deve criar",
      placeHolder: "Ex.: plataforma para agendar consultas com painel administrativo",
      ignoreFocusOut: true,
      validateInput: (value) => value.trim() ? undefined : "Descreva a ideia do projeto."
    });
    if (!idea) {
      return;
    }

    const projectType = await vscode.window.showQuickPick(
      ["Site", "Aplicação web", "API", "Aplicativo mobile", "Projeto full-stack"],
      { title: "IAcode - tipo de projeto", placeHolder: "Escolha o formato inicial" }
    );
    if (!projectType) {
      return;
    }

    const languages = await vscode.window.showInputBox({
      title: "IAcode - tecnologias",
      prompt: "Informe as linguagens e frameworks separados por vírgula",
      value: "TypeScript, React, Node.js",
      ignoreFocusOut: true,
      validateInput: (value) => value.trim() ? undefined : "Informe pelo menos uma tecnologia."
    });
    if (!languages) {
      return;
    }

    const destination = await vscode.window.showOpenDialog({
      title: "IAcode - pasta do projeto",
      canSelectFolders: true,
      canSelectFiles: false,
      openLabel: "Criar projeto aqui"
    });
    if (!destination?.[0]) {
      return;
    }

    const request: ProjectRequest = {
      idea,
      projectType,
      languages: languages.split(",").map((item) => item.trim()).filter(Boolean)
    };

    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: "IAcode está criando seu projeto..." },
      async (progress) => {
        try {
          progress.report({ message: "Consultando o modelo de IA" });
          const files = await generateProject(request);
          progress.report({ message: `Gravando ${files.length} arquivos` });
          await writeProject(destination[0], files);
          const opened = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(destination[0], files[0].path));
          await vscode.window.showTextDocument(opened);
          vscode.window.showInformationMessage(`Projeto criado com ${files.length} arquivos.`);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erro desconhecido ao gerar o projeto.";
          vscode.window.showErrorMessage(`IAcode: ${message}`);
        }
      }
    );
  });

  context.subscriptions.push(command);
}

async function writeProject(root: vscode.Uri, files: Array<{ path: string; content: string }>): Promise<void> {
  for (const file of files) {
    const normalized = file.path.replace(/\\/g, "/");
    if (!normalized || normalized.startsWith("/") || normalized.split("/").includes("..")) {
      throw new Error(`Caminho de arquivo inválido recebido da IA: ${file.path}`);
    }
    const uri = vscode.Uri.joinPath(root, normalized);
    const parts = normalized.split("/");
    parts.pop();
    let parent = root;
    for (const part of parts) {
      parent = vscode.Uri.joinPath(parent, part);
      await vscode.workspace.fs.createDirectory(parent);
    }
    await vscode.workspace.fs.writeFile(uri, Buffer.from(file.content, "utf8"));
  }
}

export function deactivate(): void {}
