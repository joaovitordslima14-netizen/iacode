# Documentação técnica

## Visão geral

IAcode é uma extensão TypeScript para VS Code. A extensão possui dois fluxos:

- `iacode.createProject`: fluxo guiado para gerar um conjunto inicial de arquivos.
- `iacode.openChat`: janela Webview independente para conversar com o agente.

A janela independente não usa a API de Chat do Copilot. Ela chama diretamente uma API compatível com OpenAI.

## Componentes

### `src/extension.ts`

Registra os comandos, coleta dados do fluxo guiado e grava arquivos gerados pelo gerador inicial.

### `src/chat.ts`

Cria a Webview do chat, mantém o histórico da sessão em memória, lista arquivos do workspace, chama o provedor e executa ações de arquivo.

### `src/generator.ts`

Implementa o fluxo inicial de geração por formulário e valida o formato de resposta `{ "files": [...] }`.

### `package.json`

Declara os comandos, configurações, versão SemVer e scripts de compilação e empacotamento.

## Contrato do provedor

A extensão envia:

```http
POST {providerUrl}/chat/completions
Content-Type: application/json
Authorization: Bearer {apiKey}
```

O modelo deve retornar conteúdo JSON. Para o chat:

```json
{
  "message": "Resumo em Markdown",
  "actions": [
    {
      "type": "write_file",
      "path": "src/example.ts",
      "content": "export const example = true;"
    }
  ]
}
```

Tipos de ação suportados:

- `write_file`: cria ou substitui um arquivo.
- `read_file`: lê um arquivo para validação interna.

## Segurança atual

- Apenas a primeira pasta do workspace é usada como raiz.
- Caminhos absolutos são rejeitados.
- Caminhos contendo `..` são rejeitados.
- Arquivos binários não fazem parte do contrato.
- O chat não executa comandos do sistema.

## Compilação e pacote

```powershell
npm.cmd install
npm.cmd run compile
npm.cmd run package
```

O resultado é `iacode-0.3.0.vsix`.

## Versionamento

- `PATCH`: correção compatível, como ajuste de validação.
- `MINOR`: novo recurso compatível, como suporte a uma nova ação.
- `MAJOR`: mudança incompatível no contrato ou configuração.

A cada release, atualize `package.json`, `CHANGELOG.md`, documentação e gere um novo VSIX. Commits e tags recomendados:

```text
git add .
git commit -m "release: v0.3.0"
git tag v0.3.0
git push origin main --tags
```
