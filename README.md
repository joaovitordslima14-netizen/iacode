# IAcode

Extensão do VS Code para criar a primeira versão de apps, sites e APIs a partir de uma ideia, tipo de projeto e tecnologias escolhidas.

## Guia rápido de uso

### 1. Instalar a extensão

Para instalar a extensão como um recurso normal do VS Code:

1. Entre na pasta do projeto pelo PowerShell ou Git Bash.
2. Se estiver usando Git Bash e `npm` não for encontrado, execute `export PATH="/c/Program Files/nodejs:$PATH"`.
3. Gere o pacote com `npm.cmd install` e `npm.cmd run package`.
4. Abra o VS Code normal e pressione `Ctrl+Shift+X`.
5. Clique em `...`, escolha **Install from VSIX...** e selecione `iacode-0.3.0.vsix`.
6. Reinicie o VS Code.

Depois dessa instalação, não use `F5` nem **Extension Development Host**. Esses recursos são apenas para desenvolvimento da extensão.

### Usar como um agente de conversa independente

1. Abra a pasta do projeto no VS Code.
2. Pressione `Ctrl+Shift+P`.
3. Execute `IAcode: Abrir chat independente`.
4. O agente analisará os arquivos existentes e poderá criar ou atualizar arquivos no workspace.
5. Continue na mesma conversa para pedir ajustes, novas telas ou correções.

Exemplo:

```text
Crie um painel de vendas usando React e TypeScript. Comece pela tela
de login e pelo dashboard responsivo. Crie os arquivos necessários e me diga
o que foi feito.
```

Depois continue:

```text
Agora adicione cadastro de produtos e uma tabela com busca e filtros.
```

O agente atual trabalha com leitura e escrita de arquivos dentro da pasta aberta. Esta janela não usa o Chat do Copilot, portanto as mensagens não contam no saldo de conversa do Copilot. Ele não executa comandos do terminal automaticamente nesta versão; instalação de dependências, testes e publicação ainda devem ser executados manualmente.

### 2. Configurar o provedor de IA

Abra **Settings** (`Ctrl+,`), pesquise por `IAcode` e preencha:

- `IAcode: Provider Url`: endereço da API compatível com OpenAI.
- `IAcode: Model`: nome do modelo.
- `IAcode: Api Key`: chave do provedor, quando necessária.

Exemplo usando Ollama local:

```text
Provider Url: http://localhost:11434/v1
Model: llama3.1
Api Key: deixe vazio
```

Exemplo usando um provedor online compatível:

```text
Provider Url: https://api.openai.com/v1
Model: nome-do-modelo-do-provedor
Api Key: sua chave da API
```

O provedor precisa aceitar `POST /chat/completions`. Para usar Ollama localmente, instale o Ollama, baixe um modelo e mantenha o serviço em execução antes de criar o projeto.

### 3. Solicitar um app ou site

1. Abra o VS Code normal.
2. Pressione `Ctrl+Shift+P`.
3. Digite `IAcode: Criar projeto com IA`.
4. No primeiro campo, descreva o que o sistema deve fazer.
5. Escolha o tipo: **Site**, **Aplicação web**, **API**, **Aplicativo mobile** ou **Projeto full-stack**.
6. No campo de tecnologias, informe linguagens e frameworks separados por vírgulas.
7. Escolha a pasta onde os arquivos devem ser criados.
8. Aguarde a IA gerar os arquivos. O primeiro arquivo será aberto automaticamente.

### 4. Como escolher as linguagens

Escreva as tecnologias em uma única linha, separadas por vírgulas. Combine a linguagem principal com o framework desejado:

```text
TypeScript, React, Vite, Node.js, PostgreSQL
```

Outros exemplos:

```text
JavaScript, Vue, Express, MongoDB
Python, FastAPI, PostgreSQL
Java, Spring Boot, MySQL
C#, .NET, React, SQL Server
Dart, Flutter, Firebase
```

Se você não souber quais tecnologias escolher, escreva `escolha uma stack moderna e simples para este tipo de projeto`. A IA fará uma sugestão, mas é melhor informar restrições importantes, como hospedagem, banco de dados e autenticação.

### 5. Exemplo de solicitação completa

No campo da ideia, use algo específico:

```text
Crie uma plataforma de agendamento para uma clínica. Deve ter cadastro e login,
perfis de paciente e administrador, calendário de horários disponíveis,
agendamento e cancelamento de consultas, painel administrativo e layout
responsivo para celular. Inclua validação de formulários, tratamento de erros,
dados de exemplo e instruções para executar.
```

Tipo:

```text
Projeto full-stack
```

Tecnologias:

```text
TypeScript, React, Vite, Node.js, Express, PostgreSQL
```

### 6. Depois que o projeto for criado

Abra a pasta gerada no VS Code e leia o `README.md` criado pela IA. Execute os comandos de instalação e inicialização indicados por ele. A versão atual do IAcode escreve os arquivos e não executa automaticamente `npm install`, testes ou comandos do terminal.

Para pedir uma nova versão, execute o comando novamente em outra pasta ou solicite uma melhoria usando o Chat do VS Code sobre os arquivos já gerados.

## Instalação para criar o pacote

1. Instale o Node.js 18 ou superior apenas para gerar o pacote.
2. Execute `npm install`.
3. Execute `npm run package`.
4. No VS Code normal, abra **Extensions**, clique em `...`, escolha **Install from VSIX...** e selecione o arquivo `iacode-0.3.0.vsix`.
5. Reinicie o VS Code, pressione `Ctrl+Shift+P` e execute `IAcode: Criar projeto com IA`.

Depois da instalação, você não precisa mais abrir o projeto nem usar `F5`. Para atualizar a extensão, gere um novo `.vsix` e instale-o novamente.

## Desenvolvimento

Para testar alterações no código sem empacotar, o modo `F5` continua disponível, mas ele não é necessário para o uso normal.

## Configuração técnica da IA

Abra as configurações do VS Code e procure por `IAcode`:

- `iacode.providerUrl`: URL base compatível com OpenAI. Para Ollama, use `http://localhost:11434/v1`.
- `iacode.model`: modelo a ser usado, como `llama3.1`.
- `iacode.apiKey`: chave do provedor; pode ficar vazia para modelos locais.

O modelo deve aceitar `POST /chat/completions` e retornar uma resposta com `choices[0].message.content` contendo:

```json
{"files":[{"path":"src/index.ts","content":"..."}]}
```

## Documentação detalhada

- [Guia de uso](docs/USAGE.md)
- [Documentação técnica](docs/TECHNICAL.md)
- [Arquitetura da IA própria](docs/SELF_HOSTED_AI.md)
- [Plano para versão online independente](ONLINE_SYSTEM_PLAN.txt)
- [Histórico de versões](CHANGELOG.md)

## Próximos módulos

- Planejamento do projeto em etapas antes da escrita dos arquivos.
- Preview e aprovação de cada arquivo gerado.
- Execução automática de instalação, testes e correção de erros.
- Templates especializados para web, mobile, APIs e desktop.
- Memória do projeto e agente iterativo integrado ao terminal.
