# IAcode Cloudflare Worker

Endpoint privado do IAcode usando Cloudflare Workers AI.

## Configuração

Dentro desta pasta:

```powershell
npm install
npx wrangler login
npx wrangler secret put IACODE_TOKEN
```

Quando solicitado, informe um token longo criado por você. Não salve esse token no GitHub.

O Worker publicado para este projeto é:

```text
https://iacode-lua-pequena-2cea.joaovitor-dslima14.workers.dev
```

## Publicação

```powershell
npm run deploy
```

A URL será parecida com:

```text
https://iacode-lua-pequena-2cea.<sua-conta>.workers.dev
```

No IAcode, configure:

```text
Provider Url: https://iacode-lua-pequena-2cea.<sua-conta>.workers.dev/v1
Model: @cf/meta/llama-3.2-3b-instruct
Api Key: o mesmo token usado em IACODE_TOKEN
```

O endpoint aceita apenas requisições com `Authorization: Bearer <IACODE_TOKEN>` e responde no formato `/chat/completions`.
