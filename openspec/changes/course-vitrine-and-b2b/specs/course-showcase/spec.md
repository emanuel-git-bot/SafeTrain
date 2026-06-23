## ADDED Requirements

### Requirement: Exibir Modal Vitrine do Curso
O sistema MUST exibir uma tela modal ou drawer contendo os detalhes estendidos do curso quando o aluno clica no botão "Ver Curso" no catálogo.

#### Scenario: Aluno quer ver os detalhes antes de matricular
- **WHEN** o aluno clica em "Ver Curso" no card do catálogo
- **THEN** o sistema abre um Modal (Vitrine) com as informações do curso
- **THEN** a Vitrine exibe Carga horária, quantidade de Aulas/Módulos, Nível, Validade e Conteúdo Programático.

### Requirement: Exibir Conteúdo Programático agrupado
Na vitrine, o sistema MUST exibir os módulos organizados por seções se existirem, mostrando a duração de cada módulo.

#### Scenario: Visualizando as seções do curso
- **WHEN** o aluno rola para a sessão de Conteúdo Programático
- **THEN** o sistema lista as Seções do Curso (ex: "Módulo 1 - Fundamentos")
- **THEN** abaixo de cada seção, lista as aulas e durações.
