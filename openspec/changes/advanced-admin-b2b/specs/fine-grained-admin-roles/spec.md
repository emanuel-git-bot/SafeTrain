## ADDED Requirements

### Requirement: Admin Permissions Array
O sistema DEVE permitir que contas com a role `admin` possuam um array de permissões granulares (`permissions`) para restringir o acesso a diferentes seções do painel administrativo.

#### Scenario: Admin sem permissões completas
- **WHEN** um admin faz login com permissões limitadas (ex: `["view_courses"]`)
- **THEN** ele só vê o menu de "Cursos" no sidebar e não pode acessar "Clientes" ou "Configurações".

#### Scenario: Acesso bloqueado via Backend
- **WHEN** um admin tenta chamar a API `/admin/users` mas não possui a permissão `view_clients`
- **THEN** a API retorna 403 Forbidden.
