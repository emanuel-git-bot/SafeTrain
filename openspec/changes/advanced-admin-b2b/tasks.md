## 1. Banco de Dados e Backend Base

- [x] 1.1 Adicionar a tabela `Area` no `schema.prisma` e criar a relação opcional `areaId` nas tabelas `User` e `Course`.
- [x] 1.2 Atualizar o script `seed.ts` para popular algumas áreas padrão (Construção Civil, Saúde, Mineração, Indústria).
- [x] 1.3 Executar migração do Prisma (`npx prisma db push` ou similar).
- [x] 1.4 Modificar a rota `POST /auth/register` no backend para aceitar os campos de registro B2B (CNPJ e dados da empresa) criando a `Company` e associando o gestor.

## 2. Permissões Granulares de Admin

- [x] 2.1 Adicionar coluna `permissions` (ex: String[]) na tabela `User` do Prisma e atualizar a migração.
- [x] 2.2 Atualizar o middleware de autenticação ou criar uma função validadora no backend para barrar acesso a rotas do admin baseado em permissão.
- [x] 2.3 Atualizar a store ou token JWT no frontend para conter a lista de permissões do admin.

## 3. Painel Administrativo (Gestão e CRM)

- [x] 3.1 Criar a view `AdminClients.tsx` para listar todos os usuários e empresas do sistema usando `GET /admin/users` (modificada para trazer mais detalhes).
- [x] 3.2 Criar botão/ação no CRM para "Recuperar Senha Manual" chamando a rota `POST /admin/users/:id/reset-password`.
- [x] 3.3 Implementar a rota `POST /admin/users/:id/reset-password` no backend (gera senha temporária, retorna via JSON para a interface do admin).
- [x] 3.4 Criar a view `AdminAreas.tsx` para listar, criar e editar "Áreas de Atuação".
- [x] 3.5 Implementar rotas de CRUD para `Area` no backend (`GET`, `POST`, `PUT`, `DELETE /admin/areas`).

## 4. B2B e Frontend Público

- [x] 4.1 Criar a página pública de registro B2B (`B2BRegisterPage.tsx`) acessível pela Landing Page.
- [x] 4.2 Alterar `LoginPage.tsx` para redirecionar corretamente para a view "B2B" (Painel da Empresa) caso o usuário tenha role `company`.
- [x] 4.3 Incorporar o seletor de "Área de Atuação" no formulário de registro de Empresas e Alunos (buscar lista via `GET /areas`).
