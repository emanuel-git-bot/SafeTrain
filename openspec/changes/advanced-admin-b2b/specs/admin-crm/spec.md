## ADDED Requirements

### Requirement: Tabela de Clientes
O painel administrativo DEVE incluir uma seção de "Clientes" onde é possível ver todos os usuários cadastrados (empresas e alunos).

#### Scenario: Visualização e Filtro
- **WHEN** o admin acessa a aba Clientes
- **THEN** ele visualiza a lista completa e pode filtrar por contas "B2B" ou "B2C".

### Requirement: Recuperação de Senha Manual
O admin DEVE ser capaz de resetar a senha de um cliente manualmente via painel para um código temporário.

#### Scenario: Reset de senha
- **WHEN** o admin clica em "Resetar Senha" para um usuário
- **THEN** a API gera uma nova senha temporária e o admin a visualiza para informar o cliente.
