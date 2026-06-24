## Context

Atualmente o sistema (SafeTrain) roda um backend Fastify Node.js com SQLite local. Isso restringe o deploy a servidores VPS tradicionais ou containers rodando persistentemente. O usuário criou um repositório no GitHub (`emanuel-git-bot/SafeTrain`), vinculou ao Cloudflare Pages/Workers (`safetrain.safetrain2026.workers.dev`) e deseja que o banco de dados seja o Cloudflare D1 (Serverless SQLite) e os arquivos (como imagens e vídeos de cursos) sejam hospedados no Cloudflare R2. O objetivo é adotar o modelo Edge computing para reduzir custos, maximizar escalabilidade global e manter-se no "free tier" da Cloudflare o máximo possível.

## Goals / Non-Goals

**Goals:**
- Portar todas as rotas e validações do backend Fastify para o framework Hono.js.
- Conectar o Prisma ORM ao Cloudflare D1 usando o `@prisma/adapter-d1`.
- Criar a camada de abstração de Storage apontando para os Buckets R2 (S3 API).
- Manter as funcionalidades de autenticação (JWT) com uma lib compatível com Web Crypto API.
- Reutilizar a lógica de geração de PDFs (`pdf-lib`) que já é agnóstica ao Node (buffer/stream based).

**Non-Goals:**
- Mudar a linguagem (continuaremos em TypeScript).
- Mudar a lógica de negócio ou estrutura do banco de dados (o Schema do Prisma não vai mudar, apenas o provedor e adaptador).

## Decisions

- **Framework Web**: Utilizaremos **Hono.js**. O Fastify utiliza APIs fundamentais do Node (`net`, `http`) que não funcionam no runtime V8 Isolates do Cloudflare Workers, mesmo com `nodejs_compat`. Hono é construído nativamente para Edge runtimes.
- **Integração do Prisma com D1**: Manteremos o Prisma (pois a modelagem já está robusta) ativando a flag `driverAdapters` no generator do Prisma, permitindo o uso nativo do D1 binding do Cloudflare.
- **Upload de Arquivos R2**: Removido o uso de `fs/promises`. Utilizaremos a [R2 Binding API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) (`env.MY_BUCKET.put()`) para uploads diretos via multipart form-data.
- **Variáveis de Ambiente**: Transição do arquivo `.env` clássico para o arquivo `wrangler.toml` configurando Secrets e Bindings.

## Risks / Trade-offs

- **Risk: Limitações do D1 (Preview / Limites de query)**
  - *Trade-off*: D1 tem limite de tamanho por query e transações mais complexas.
  - *Mitigação*: Prisma Adapter para D1 lida com a maior parte disso via subqueries.
- **Risk: Incompatibilidade de Módulos Node (`bcrypt`, etc)**
  - *Mitigação*: Trocaremos dependências focadas em C++ nativo por alternativas JS-pure ou baseadas em Web Crypto (ex: `bcryptjs` já estamos usando e roda, mas caso dê problema de lentidão, passaremos para Crypto nativo).
- **Risk: Cold Starts**
  - *Mitigação*: Workers têm zero cold-start, contudo, a inicialização pesada do Prisma Client pode adicionar latência inicial. Validaremos o bundle via ESBuild do Wrangler.
