# Histórico de versões

O IAcode segue versionamento semântico: `MAJOR.MINOR.PATCH`.

## [0.3.0] - 2026-09-15

### Adicionado

- Janela própria de chat do IAcode, independente do Chat do Copilot.
- Histórico da conversa durante a sessão.
- Leitura da lista de arquivos do workspace.
- Criação e atualização de arquivos por ações estruturadas da IA.
- Validação contra caminhos absolutos e traversal com `..`.
- Comando `IAcode: Abrir chat independente`.
- Empacotamento `.vsix` automatizado.
- Documentação de uso, arquitetura e plano online.

### Alterado

- O agente não usa mais `vscode.chat.createChatParticipant`.
- A comunicação é feita diretamente com o provedor configurado em `iacode.providerUrl`.

### Limitações conhecidas

- O agente ainda não executa comandos de terminal, instala dependências ou roda testes automaticamente.
- A chave da IA deve ser configurada pelo usuário e o provedor precisa ser compatível com `/chat/completions`.

## [0.2.0] - 2026-09-15

- Primeira integração experimental com o Chat do VS Code.
- Geração de arquivos e histórico básico de solicitações.

## [0.1.0] - 2026-09-15

- Gerador inicial por formulário.
- Seleção de ideia, tipo de projeto, tecnologias e pasta de destino.
