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

> [!WARNING]
> **Erro "whitelist access required" (PagSeguro Sandbox)**: Se ao testar pagamentos o gateway retornar o erro *whitelist access required. Contact PagSeguro*, isso significa que o PagBank está bloqueando o endereço de IP do servidor. No ambiente Cloudflare Workers, os IPs variam. Para o Sandbox, você precisa entrar em contato com o suporte ou adicionar sua faixa de IPs no painel PagSeguro. Em produção, geralmente o PagBank PIX/Cartão transparente requer autenticação mTLS ou registro prévio do Application. Para contornar no Sandbox, considere buscar documentação atualizada do PagBank Sandbox sobre "IP Whitelisting" ou desativar temporariamente o bloqueio se permitido na conta.

### Neon Bank (Em breve)
*(Instruções para quando a integração for disponibilizada no futuro)*
1. Acesse o portal Neon Pejota (para empresas).
2. Vá até a seção de **Integrações (API)**.
3. Gere um **Token de Acesso (Bearer / API Key)**.
4. Salve no painel Admin > Configurações.

## 🔐 Configuração do Login com Google

Para permitir que os usuários façam login ou cadastro usando o Google, você precisará gerar um Client ID no Google Cloud Console:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto ou selecione um existente.
3. No menu lateral de navegação, vá em **APIs e Serviços** > **Tela de consentimento OAuth**.
   - Escolha o tipo de usuário (Geralmente Externo).
   - Preencha o nome do app (ex: SafeTrain), e-mail de suporte e dados básicos solicitados. Salve.
4. Vá em **APIs e Serviços** > **Credenciais**.
5. Clique em **+ CRIAR CREDENCIAIS** e escolha **ID do cliente OAuth**.
6. Selecione o Tipo de Aplicativo: **Aplicativo da Web**.
7. Em **Origens JavaScript autorizadas**, adicione as URLs onde seu site roda (ex: `http://localhost:5173` para testes locais e `https://safetrain.com.br` para produção).
8. Em **URIs de redirecionamento autorizados**, adicione também a URL do seu site.
9. Clique em **Criar**. 
10. O Google mostrará seu **Client ID** e **Client Secret**.
11. Acesse o painel **Admin da Plataforma** > **Configurações** > **Login Social** e preencha os campos. O botão de Login com o Google usará essas credenciais.
*(Nota: a lógica de criar a conta via Google é feita no backend, que recebe o token do Google disparado pelo frontend, valida usando o Client ID configurado e, se o e-mail não existir na base, registra o aluno automaticamente antes de realizar o login).*