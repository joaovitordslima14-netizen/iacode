# IA própria do IAcode

## Requisito

O IAcode deve funcionar como uma IA própria, sem enviar prompts para OpenAI, Copilot, Ollama ou outro provedor externo. Para isso, o motor de inferência precisa ser executado pelo próprio IAcode ou por um servidor controlado pelo projeto.

## Esclarecimento importante

O código da extensão sozinho não é um modelo de linguagem. Um agente que conversa e programa precisa de:

1. Pesos de um modelo treinado.
2. Um runtime capaz de executar esses pesos.
3. Memória e processamento suficientes.
4. Dados e avaliações para melhorar o comportamento.
5. Ferramentas controladas para ler e alterar o projeto.

Treinar um modelo de linguagem do zero é um projeto separado, caro e demorado. A primeira versão viável deve usar um modelo aberto com licença compatível e executar esse modelo localmente, sem API de terceiros.

## Arquitetura recomendada

### Modo desktop local

```text
Aplicação IAcode
  -> interface própria de chat
  -> agente e ferramentas
  -> runtime local embarcado
  -> modelo local em arquivo GGUF
  -> workspace do usuário
```

O runtime pode ser baseado em `llama.cpp` ou `node-llama-cpp`. O modelo deve ser instalado pelo próprio IAcode na primeira execução ou incluído em um instalador separado. A extensão VS Code sozinha não é o melhor formato para distribuir um modelo grande; o produto final deve ser um aplicativo desktop com instalador ou uma extensão acompanhada de um serviço local gerenciado.

### Modo online próprio

```text
Navegador ou extensão IAcode
  -> API do IAcode
  -> worker isolado
  -> runtime de inferência controlado pelo IAcode
  -> modelo hospedado pelo IAcode
```

Nesse modo o usuário não configura OpenAI nem Ollama. O servidor é responsabilidade do IAcode. Ainda existe custo de servidor, GPU, armazenamento e manutenção, mesmo sem usar um provedor de IA terceirizado.

## Opções de modelo

- Modelo pequeno: funciona em computadores comuns, mas gera código com menor qualidade.
- Modelo médio: melhor equilíbrio entre qualidade e memória.
- Modelo grande: melhor capacidade, mas normalmente exige GPU ou servidor dedicado.

O modelo escolhido precisa ter licença que permita redistribuição ou uso comercial, conforme o objetivo do IAcode. Os pesos não devem ser incluídos no GitHub sem verificar tamanho e licença.

## Plano de implementação

### Fase 1: runtime local

- Escolher um modelo aberto para código.
- Integrar `llama.cpp` ou `node-llama-cpp`.
- Adicionar download verificado do modelo pelo IAcode.
- Criar configuração `iacode.aiMode = local`.
- Remover a necessidade de `providerUrl` no modo local.
- Exibir memória disponível, modelo carregado e estado do motor.

### Fase 2: agente autônomo

- Manter o chat e histórico local.
- Implementar ferramentas de leitura e escrita.
- Adicionar diff e aprovação antes de alterar arquivos.
- Adicionar terminal em sandbox, com confirmação para ações perigosas.
- Executar testes e corrigir falhas em ciclos controlados.

### Fase 3: distribuição

- Criar instalador desktop para Windows, macOS e Linux.
- Baixar modelos por plataforma e arquitetura.
- Armazenar modelos fora do repositório Git.
- Verificar hash dos arquivos baixados.
- Permitir trocar o modelo sem reinstalar o IAcode.

### Fase 4: serviço online próprio

- Criar frontend web e API do IAcode.
- Hospedar o runtime e o modelo em infraestrutura com GPU quando necessário.
- Isolar cada workspace em container ou sandbox.
- Criar autenticação, limites de uso, logs e cobrança.
- Usar GitHub apenas para código e integração de repositórios.
- Usar Render para API/frontend/workers quando a carga permitir; inferência pesada pode exigir GPU especializada.

## O que a versão atual faz

A versão `0.3.0` ainda chama diretamente o endpoint configurado em `iacode.providerUrl`. Portanto, ela ainda não é uma IA autônoma. Este documento define a arquitetura necessária para a próxima versão, sem esconder essa dependência técnica.

## Critério de conclusão

O requisito será considerado atendido quando uma instalação limpa do IAcode conseguir:

1. Instalar ou iniciar o runtime local.
2. Carregar um modelo sem chave de API externa.
3. Responder no chat sem conexão com OpenAI, Copilot ou Ollama.
4. Criar e alterar arquivos usando as ferramentas do IAcode.
5. Funcionar offline depois que o modelo estiver instalado.
6. Exibir claramente os requisitos de memória e espaço em disco.
