# Como usar o IAcode

> **Estado atual:** a versão `0.3.0` ainda precisa de um provedor compatível com OpenAI. A IA própria, executada pelo IAcode sem OpenAI, Copilot ou Ollama, está definida em [SELF_HOSTED_AI.md](SELF_HOSTED_AI.md) e exige a integração de um runtime e de um modelo local.

## O que é

O IAcode é uma extensão que abre um chat próprio dentro do VS Code. Você descreve o sistema e a IA cria ou altera arquivos na pasta aberta. As mensagens desse chat não usam o saldo do Chat do Copilot.

## Antes de começar

Você precisa de:

- VS Code 1.90 ou superior.
- A extensão instalada a partir do arquivo `iacode-0.3.0.vsix`.
- Uma IA local ou online compatível com a API OpenAI.
- Uma pasta aberta no VS Code.

## Instalar a extensão

1. Abra o VS Code.
2. Pressione `Ctrl+Shift+X` para abrir Extensions.
3. Clique em `...` no topo do painel.
4. Clique em **Install from VSIX...**.
5. Selecione `iacode-0.3.0.vsix`.
6. Reinicie o VS Code.

Não abra o **Extension Development Host**. Ele só é necessário para quem está programando a extensão.

## Configurar a IA

1. Pressione `Ctrl+,` para abrir Settings.
2. Pesquise por `IAcode`.
3. Preencha `Provider Url`, `Model` e, se necessário, `Api Key`.

### Opção A: IA local com Ollama

Use estes valores:

```text
Provider Url: http://localhost:11434/v1
Model: llama3.1
Api Key: deixe vazio
```

O Ollama precisa estar instalado, com o modelo baixado e o serviço em execução.

### Opção B: IA online

Use a URL HTTPS e o modelo fornecidos pelo seu provedor:

```text
Provider Url: https://seu-provedor.example/v1
Model: nome-do-modelo
Api Key: sua chave
```

O provedor precisa aceitar `POST /chat/completions`. A chave pode gerar custos conforme o uso. Nunca compartilhe sua chave no chat ou no GitHub.

## Criar o primeiro projeto

1. Abra uma pasta vazia no VS Code.
2. Pressione `Ctrl+Shift+P`.
3. Execute **IAcode: Abrir chat independente**.
4. Cole um pedido detalhado.
5. Aguarde a resposta e confira os arquivos criados.
6. Continue pedindo alterações na mesma janela.

Pedido pronto para copiar:

```text
Crie um sistema de agendamento para uma clínica.

Tecnologias:
- Frontend: React, TypeScript e Vite
- Backend: Node.js, Express e TypeScript
- Banco: PostgreSQL

Funcionalidades:
- Cadastro e login
- Perfis de paciente e administrador
- Agenda com horários disponíveis
- Agendamento e cancelamento
- Painel administrativo
- Layout responsivo para celular
- Validação de formulários e tratamento de erros

Comece criando a estrutura funcional, os arquivos de configuração,
dados de exemplo e um README com instruções para executar.
Explique quais arquivos foram criados.
```

## Como escolher linguagens e tecnologias

Escreva tudo na solicitação, separando as tecnologias por vírgulas ou organizando por função:

```text
TypeScript, React, Vite, Node.js, Express, PostgreSQL
```

Stacks comuns:

```text
JavaScript, Vue, Express, MongoDB
Python, FastAPI, PostgreSQL
Java, Spring Boot, MySQL
C#, .NET, React, SQL Server
Dart, Flutter, Firebase
```

Se não souber qual stack escolher, diga:

```text
Escolha uma stack moderna, simples de manter e adequada para publicar no Render.
Explique a escolha antes de criar os arquivos.
```

## Como continuar o desenvolvimento

Depois que a primeira versão for criada, envie pedidos pequenos e objetivos:

```text
Adicione uma tela de login com validação de e-mail e senha.
```

```text
Crie o painel administrativo com busca, filtros e paginação.
```

```text
Revise os arquivos criados e corrija inconsistências entre frontend e backend.
```

```text
Prepare um README com os comandos de instalação e execução.
```

## Conferir o resultado

Leia o `README.md` criado pela IA, revise o código e execute manualmente os comandos indicados. A versão `0.3.0` ainda não instala dependências, executa terminal, roda testes ou publica no Render automaticamente.

## Problemas comuns

**O comando não aparece:** confirme que a extensão foi instalada pelo VSIX e reinicie o VS Code.

**A IA retorna erro HTTP:** confira `Provider Url`, `Model`, a chave e se o serviço está ativo.

**A IA não retorna JSON válido:** tente novamente ou use um modelo com melhor seguimento de instruções.

**Nenhum arquivo é criado:** abra uma pasta no VS Code antes de abrir o chat.

**O npm não é encontrado no Git Bash:** feche e abra o Git Bash novamente ou execute `export PATH="/c/Program Files/nodejs:$PATH"`.

## Privacidade

O IAcode não envia mensagens para o Chat do Copilot. O conteúdo do pedido e a lista de arquivos são enviados diretamente ao provedor definido em `iacode.providerUrl`. Não envie senhas, tokens, dados pessoais ou código confidencial sem avaliar a política do provedor.
# Guia de uso

## Pré-requisitos

- VS Code 1.90 ou superior.
- A extensão IAcode instalada a partir de `iacode-0.3.0.vsix`.
- Um provedor de IA local ou online compatível com OpenAI.
- Uma pasta de projeto aberta no VS Code.

## Instalação

1. Abra Extensions com `Ctrl+Shift+X`.
2. Abra o menu `...`.
3. Selecione **Install from VSIX...**.
4. Escolha `iacode-0.3.0.vsix`.
5. Reinicie o VS Code.

Não é necessário usar `F5` ou **Extension Development Host**.

## Configuração

Abra Settings com `Ctrl+,` e procure por `IAcode`.

| Configuração | Exemplo | Finalidade |
|---|---|---|
| `iacode.providerUrl` | `http://localhost:11434/v1` | URL base do provedor |
| `iacode.model` | `llama3.1` | Modelo utilizado |
| `iacode.apiKey` | chave do provedor | Autenticação, quando exigida |

Para Ollama, mantenha o serviço local ativo e use um modelo instalado. Para um serviço online, informe a URL HTTPS e a chave correspondente.

## Criar um projeto

1. Abra uma pasta vazia ou um projeto existente.
2. Pressione `Ctrl+Shift+P`.
3. Execute **IAcode: Abrir chat independente**.
4. Descreva o produto, público, funcionalidades e restrições.
5. Informe as tecnologias desejadas na mensagem.
6. Aguarde a resposta e confira os arquivos alterados.
7. Continue na mesma janela para pedir novas telas, APIs ou correções.

Exemplo:

```text
Crie um sistema de pedidos para uma cafeteria.
Use TypeScript, React, Vite, Node.js, Express e PostgreSQL.
Inclua login, catálogo, carrinho, checkout, painel administrativo,
validação, tratamento de erros e README de execução.
```

## Boas solicitações

Informe sempre:

- Objetivo do sistema.
- Tipos de usuário.
- Funcionalidades principais.
- Linguagens e frameworks.
- Banco de dados.
- Necessidade de autenticação.
- Regras de negócio.
- Forma de publicação.

Se a resposta não estiver adequada, peça uma alteração específica. Evite solicitar todo o produto novamente quando apenas uma tela precisa ser modificada.

## Privacidade e custos

A janela própria não envia mensagens ao Chat do Copilot. As solicitações vão diretamente para o provedor definido em `iacode.providerUrl`; provedores online podem cobrar por uso e processar o conteúdo enviado. Não coloque senhas, tokens ou dados pessoais nos pedidos.

## Limitações da versão 0.3.0

O IAcode cria e atualiza arquivos, mas não instala dependências, executa terminal, roda testes ou publica deploy automaticamente. Faça essas etapas manualmente e valide o código antes de colocá-lo em produção.
