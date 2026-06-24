## 1. Setup do Ambiente Cloudflare

- [x] 1.1 Configurar o `wrangler.toml` base no diretório `server/`.
- [x] 1.2 Instalar dependências da Cloudflare (Wrangler, `@cloudflare/workers-types`, `hono`).

## 2. Migração do Banco de Dados (D1)

- [x] 2.1 Atualizar `prisma.schema` para habilitar a feature `driverAdapters`.
- [x] 2.2 Instalar pacote `@prisma/adapter-d1` e substituir a instância do Prisma Client no arquivo de plugin/config.
- [x] 2.3 Criar o banco D1 localmente (`wrangler d1 create`) e configurar a binding no `wrangler.toml`.
- [x] 2.4 Testar e adaptar o script de migração/seed (`prisma/seed.ts`) para suportar a execução via Wrangler.

## 3. Storage e Uploads (R2)

- [x] 3.1 Substituir endpoints de upload locais (baseados em `fs`) por integração direta com stream de dados (ArrayBuffer) no backend.
- [x] 3.2 Implementar salvamento usando a API de Bindings do R2 (`env.BUCKET.put`).
- [x] 3.3 Garantir que os endpoints retornem a URL pública do R2 ou implementem uma rota de proxy/leitura para servir a imagem no frontend.

## 4. Substituição do Fastify pelo Hono

- [x] 4.1 Substituir inicialização de servidor (`fastify()`) por uma instância do Hono (`new Hono()`).
- [x] 4.2 Migrar Middlewares (JWT, Autenticação, Permissões).
- [x] 4.3 Migrar rota: `auth.ts`
- [x] 4.4 Migrar rota: `users.ts`
- [x] 4.5 Migrar rota: `courses.ts`
- [x] 4.6 Migrar rota: `payments.ts`
- [x] 4.7 Migrar rota: `vouchers.ts`
- [x] 4.8 Migrar rota: `companies.ts`
- [x] 4.9 Migrar rota: `admin.ts`
- [x] 4.10 Migrar rota: `classroom.ts`
- [x] 4.11 Migrar rota: `certificates.ts`
- [x] 4.12 Migrar rota: `analytics.ts`
- [x] 4.13 Migrar rota: `ecommerce.ts`
- [x] 4.14 Migrar rota: `webhooks.ts`
- [x] 4.15 Migrar lógica da geração de PDF (`pdf-lib`) para uso nativo do Cloudflare Workers (`Response` object).

## 5. Deploy e Testes E2E

- [x] 5.1 Fazer deploy da API no Cloudflare Workers (`npm run deploy`).
- [x] 5.2 Atualizar as URLs base de API no frontend Vite (caso as origin URLs do Worker sejam diferentes).
- [x] 5.3 Testar integração completa: Login, Geração de Certificado, Upload de Imagem e Fluxo de Compra B2B.
