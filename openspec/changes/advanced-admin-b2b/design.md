## Context

Com o aumento da complexidade da plataforma SafeTrain, as funcionalidades de administração começaram a demandar papéis granulares (vários tipos de admins) e suporte à modalidade de B2B (cadastro de empresas por conta própria). Hoje, o sistema suporta login apenas como role="admin" e as contas de empresa só são vinculadas no backend.

## Goals / Non-Goals

**Goals:**
- Implementar array simples de permissões para roles "admin" no banco de dados.
- Criar rotas no backend para gestão de clientes pelo admin (visualização e reset manual de senha).
- Estabelecer um fluxo de registro para empresas (CNPJ).
- Criar a tabela ou Enum `Area` para classificar usuários, cursos e empresas.

**Non-Goals:**
- Implementar ACL completo com permissões baseadas em recursos a nível de linha de DB.
- Adicionar um sistema automatizado de cobrança neste fluxo (focaremos apenas no auto-cadastro da empresa e isolamento do painel).

## Decisions

- **Permissões Granulares**: Adicionar uma coluna `permissions` (tipo JSON ou String[]) no modelo `User` do Prisma, que será verificada no frontend (para esconder menus) e no backend (middleware) para admins.
- **Isolamento B2B**: O login na plataforma irá identificar se a role do usuário é `company` e redirecionar para a view B2B. A conta B2B não faz cursos, apenas distribui vouchers.
- **Áreas de Atuação (Categorização)**: Em vez de um Enum no Prisma, criaremos um modelo `Area` (tabela) com relacionamento 1:N com Courses e Users/Companies. Isso permite que novos administradores adicionem áreas livremente via painel sem alterar o schema do DB.
- **Aprovação Manual de Senhas**: Criaremos uma rota `/admin/users/:id/reset-password` onde o admin gera uma nova senha temporária e informa o usuário, evitando depender de envio de emails transacionais nesta fase.

## Risks / Trade-offs

- **Migração do Modelo User**: A adição de um campo de relacionamento obrigatório para "Area" pode quebrar os usuários antigos. Para mitigar, a chave estrangeira (areaId) deve ser opcional (`Area?`) ou termos uma "Área Padrão" no script de seed.
- **Segurança de Vouchers**: As empresas podem tentar gerar vouchers infinitos. O endpoint de compra continuará mockado, mas a distribuição estará atrelada à quantia de vagas que o admin registrar (na próxima task de payment).
