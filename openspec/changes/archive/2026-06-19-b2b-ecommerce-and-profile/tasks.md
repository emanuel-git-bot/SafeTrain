## 1. Banco de Dados e Backend (Prisma)

- [x] 1.1 Atualizar `schema.prisma` adicionando colunas `cpf`, `phone` e `avatarUrl` (opcionais) ao modelo `User`.
- [x] 1.2 Criar os modelos `Plan` (id, name, price, voucherCount), `Coupon` (id, code, discount, validUntil) e `Order` (id, companyId, planId, couponId, finalPrice, status).
- [x] 1.3 Rodar migration do Prisma (`npx prisma db push` ou migrate).
- [x] 1.4 Criar rotas de Perfil no Fastify: `PUT /users/me` (update avatar/cpf/phone/name) e `POST /users/me/password` (alterar senha usando a atual).
- [x] 1.5 Criar rotas do Ecommerce B2B: `GET /plans`, `POST /orders/simulate` e `POST /orders/checkout`.
- [x] 1.6 Corrigir rota de busca de funcionários B2B: `GET /companies/:id/students` (permitindo ?search=nome).

## 2. Frontend - Central do Usuário (Meu Perfil)

- [x] 2.1 Criar componente/página `MyProfile.tsx` com formulário de edição de dados (Nome, CPF, Telefone, Avatar) e exibir na navegação dos perfis de usuário, aluno e gestor.
- [x] 2.2 Adicionar formulário de "Trocar Senha" no `MyProfile.tsx` (requer senha atual e nova senha).
- [x] 2.3 Atualizar os tipos globais (`types.ts`) para suportar os novos campos de `User`.

## 3. Frontend - Correções B2B e UX

- [x] 3.1 Remover o botão "Entrar como Admin (demo)" do `LoginPage.tsx`.
- [x] 3.2 Criar funções utilitárias de máscara (CNPJ e Telefone) e aplicá-las nos inputs de todos os formulários.
- [x] 3.3 Na página `B2BRegisterPage.tsx`, implementar a função que detecta 14 dígitos no CNPJ e faz o fetch na `https://brasilapi.com.br/api/cnpj/v1/{cnpj}`, preenchendo automaticamente a Razão Social.
- [x] 3.4 Corrigir o "Para Empresas" que estava aparecendo indevidamente ou conectá-lo corretamente à condicional de tipo de conta (`role === 'company'`) no Dashboard e Sidebar B2B/B2C.
- [x] 3.5 Refatorar a visualização do painel "Para Empresas" (`B2BDashboard`) para usar a nova rota real de busca de funcionários.

## 4. Frontend - Ecommerce B2B

- [x] 4.1 Criar a view de "Comprar Vouchers / Planos" no B2BDashboard, listando os planos obtidos de `GET /plans`.
- [x] 4.2 Criar o Simulador de Checkout (seleção de plano, campo de cupom) batendo em `POST /orders/simulate`.
- [x] 4.3 Finalizar tela de conclusão de Checkout simulando a aquisição com sucesso.
- [x] 4.4 Adicionar no Painel de Admin (`AdminPanel`) a visualização/gestão de Cupons (`AdminCoupons.tsx`).
