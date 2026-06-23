## ADDED Requirements

### Requirement: Suporte a Seções de Módulos (CourseSection)
O sistema MUST permitir que cursos possuam Seções (`CourseSection`) que agrupam os Módulos. 

#### Scenario: Administrador agrupa módulos por seções
- **WHEN** o admin edita um curso no AdminPanel
- **THEN** o admin pode criar Seções de curso
- **THEN** o admin pode mover e associar módulos a uma Seção específica.

### Requirement: Imagem Real e Validade do Curso
O sistema MUST permitir o cadastro da imagem de capa via URL/Upload e de um campo de Validade em meses.

#### Scenario: Administrador preenche informações gerais do curso
- **WHEN** o admin edita as informações gerais do curso
- **THEN** o admin tem acesso a um input de Imagem e um de "Validade do Curso (em meses)".
