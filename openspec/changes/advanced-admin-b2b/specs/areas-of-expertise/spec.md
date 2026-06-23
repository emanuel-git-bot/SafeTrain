## ADDED Requirements

### Requirement: Gestão de Áreas de Atuação
O painel de administração DEVE permitir a criação, edição e listagem de "Áreas de Atuação" (ex: Construção Civil, Saúde, TI).

#### Scenario: Criação de nova área
- **WHEN** o admin submete uma nova área de atuação
- **THEN** a área fica disponível na base de dados e pode ser selecionada.

### Requirement: Categorização de Cursos e Empresas
Cursos e Empresas DEVEM poder ser associados a uma Área de Atuação existente.

#### Scenario: Empresa escolhe área no cadastro
- **WHEN** a empresa se registra na plataforma
- **THEN** o formulário exige a seleção de uma Área de Atuação do banco de dados.
