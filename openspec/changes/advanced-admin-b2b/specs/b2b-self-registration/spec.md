## ADDED Requirements

### Requirement: Auto-cadastro B2B
Empresas DEVEM ser capazes de se cadastrar na plataforma através de um fluxo público preenchendo seu CNPJ, Razão Social e dados do gestor.

#### Scenario: Empresa se registra com sucesso
- **WHEN** o usuário submete o formulário de cadastro de empresa com CNPJ válido
- **THEN** o sistema cria uma conta da empresa e vincula a role do gestor.

### Requirement: Redirecionamento Isolado B2B
O login DEVE identificar gestores de empresas e os rotear adequadamente.

#### Scenario: Login como Gestor B2B
- **WHEN** um gestor de empresa (vinculado a um Company) faz login
- **THEN** o sistema redireciona automaticamente para o Painel B2B em vez do painel de aluno padrão.
