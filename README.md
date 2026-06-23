# SafeTrain EPI Platform

Uma plataforma moderna para treinamentos e certificações em Segurança do Trabalho (NRs).

## Estrutura do Projeto

- `/src` -> Frontend (React + Vite + Tailwind)
- `/server` -> Backend (Node.js + Fastify + Prisma + SQLite)

## Setup Local

### 1. Backend

O backend foi configurado para utilizar SQLite nativamente a fim de simplificar o desenvolvimento.

```bash
cd server
npm install
npx prisma migrate dev --name init

```

O servidor rodará em `http://localhost:3333`.

### 2. Frontend

O frontend é uma SPA React em Vite.

```bash
npm install
npm run dev
```

A aplicação rodará em `http://localhost:5173`.

### 3. Banco de Dados e Seed

Na pasta `/server`, você pode rodar o seed para popular o banco de dados com um Admin, um curso padrão e vouchers de teste:

```bash
npx tsx prisma/seed.ts
```

- **Voucher de Teste**: `VTC-2024-TESTE`
- **Admin**: `admin@safetrain.com` / `admin123`

## Features Implementadas

- Autenticação JWT (Login/Registro)
- Catálogo de Cursos dinâmico listando via API
- Fluxo de Compra e Ativação de Vouchers simulados via API
- Dashboard B2B com gerenciamento simulado de alunos e vouchers
- Rastreamento e logs de tempo de tela na sala de aula
- Emissão simulada de certificados
- Painel Administrativo com rotas protegidas

## 💳 Integração de Pagamento: Obtendo os Tokens

Para configurar o recebimento de pagamentos reais ou em ambiente Sandbox, você precisará do token de integração (API Token) do gateway escolhido:

### PagBank
1. Acesse o **Painel PagBank Sandbox** (para testes) ou o seu **Painel PagBank Principal**.
2. No menu lateral, navegue até **Vendas Online** > **Integrações**.
3. Na seção de Autenticação/API, clique em **Gerar Token** (ou "Gerar novo token").
4. Copie o Token gerado e cole no painel **Admin da Plataforma** > **Configurações** > **API Token do Gateway**.

### Neon Bank (Em breve)
*(Instruções para quando a integração for disponibilizada no futuro)*
1. Acesse o portal Neon Pejota (para empresas).
2. Vá até a seção de **Integrações (API)**.
3. Gere um **Token de Acesso (Bearer / API Key)**.
4. Salve no painel Admin > Configurações.