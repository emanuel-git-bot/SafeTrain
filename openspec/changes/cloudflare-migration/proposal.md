## Why

A plataforma precisa ser escalável, barata e rodar "na borda" (Edge) para maximizar a performance e minimizar custos de infraestrutura clássica. A Cloudflare oferece um ecossistema excelente (Workers, D1, R2) que suporta nossas demandas de armazenamento de banco de dados (SQLite via D1) e de arquivos pesados como vídeos e imagens (R2).

## What Changes

- Substituição do framework backend Node.js (Fastify) pelo Hono.js para compatibilidade com Cloudflare Workers (Edge).
- Migração do banco de dados SQLite local (`dev.db`) para o Cloudflare D1, mantendo o Prisma ORM através do `@prisma/adapter-d1`.
- Substituição do salvamento de arquivos locais (FS local em `/uploads`) pela integração direta com buckets do Cloudflare R2.
- **BREAKING**: Rotas de upload, inicialização do servidor e scripts de banco de dados sofrerão alterações drásticas de ambiente. Bibliotecas incompatíveis com o V8 Isolates do Cloudflare terão que ser adaptadas ou substituídas.

## Capabilities

### New Capabilities
- `cloudflare-workers-hosting`: Refatoração da API para o Cloudflare Workers usando Hono.js.
- `cloudflare-d1-database`: Integração do Prisma ORM com o banco de dados Serverless D1.
- `cloudflare-r2-storage`: Integração com Cloudflare R2 para manipulação e persistência de arquivos.

### Modified Capabilities
- `api-routes`: Adaptação de sintaxe e retornos das rotas para o padrão Hono.js.
- `file-uploads`: Mudança na lógica de recebimento e envio de arquivos em memória.

## Impact

- **Backend / API**: Reescrita quase total dos pontos de entrada (`server.ts`, handlers). O core da lógica de negócios permanecerá, mas a camada HTTP mudará.
- **Banco de Dados**: Mudança nos scripts do Prisma (`seed.ts` e push de schema precisam apontar para D1 via Wrangler).
- **Armazenamento**: Dependência removida do sistema de arquivos local (`fs`). Uso do objeto S3/R2 para leitura/escrita.
- **Frontend**: Nenhuma mudança lógica necessária nas telas, apenas os endpoints de API mudarão sua base URL para o Worker em produção.
