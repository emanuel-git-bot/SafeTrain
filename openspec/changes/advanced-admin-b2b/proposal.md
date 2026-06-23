## Why

A plataforma SafeTrain possui a infraestrutura básica, mas atualmente trata todos os administradores com acesso irrestrito, cria empresas apenas internamente, e não possui um CRM para gerenciar alunos/empresas adequadamente. Adicionar permissões granulares, gestão de clientes, auto-cadastro B2B e categorização por "Áreas de Atuação" vai transformar a plataforma de um MVP em um SaaS robusto, permitindo escalabilidade segura e venda direta para empresas.

## What Changes

- Introdução de controle de acesso (RBAC simplificado) onde um Admin Master pode definir quais seções outros admins podem acessar.
- Nova seção "Clientes" no painel Admin, permitindo listar contas B2C/B2B, filtrar dados, autorizar reset de senhas e editar informações básicas.
- Fluxo de auto-cadastro para contas empresariais (B2B) usando CNPJ. O painel B2B será exibido apenas para contas empresariais e dados/vouchers serão isolados.
- Criação do modelo "Áreas de Atuação" (ex: Construção Civil, Saúde) no Admin, com seleção disponível no cadastro de cursos, alunos e empresas.

## Capabilities

### New Capabilities
- `fine-grained-admin-roles`: Sistema de permissões que restringe acessos do admin a seções específicas (ex: suporte vs conteúdo).
- `admin-crm`: Seção para gestão de clientes no painel do administrador, com filtros e recuperação/edição de senhas.
- `b2b-self-registration`: Fluxo e regras para empresas se cadastrarem autonomamente na plataforma e isolamento de seus dados.
- `areas-of-expertise`: Entidade global de categorização utilizada em cursos, alunos e empresas.

### Modified Capabilities
- N/A

## Impact

- Modificações necessárias no modelo do Prisma (tabela `User` para suportar as arrays/strings de permissão, nova tabela `Area` ou categorização estática, relacionamento de área no `User` e `Course`).
- Novas rotas no backend para cadastro B2B, gestão de permissões e listagem do CRM.
- Atualizações no frontend para roteamento protegido baseado em permissões, novos formulários B2B e views do CRM.
