## ADDED Requirements

### Requirement: Integração do Painel do Aluno
O sistema SHALL listar os cursos nos quais o usuário logado está matriculado através do endpoint `/users/me/enrollments`.

#### Scenario: Visualização do MyPanel
- **WHEN** o usuário logado acessar a aba "Meu Painel"
- **THEN** o sistema exibirá seus cursos, substituindo os dados hardcoded pelos cursos retornados pela API e calculará o status e o progresso correspondente.

### Requirement: Rastreamento Real na Sala de Aula
O sistema SHALL registrar o tempo que o usuário gasta consumindo o conteúdo através do endpoint `/enrollments/:id/lessons/:lessonId/ping`.

#### Scenario: Atualização de Progresso de Vídeo
- **WHEN** o aluno estiver com o vídeo da aula ativo
- **THEN** o frontend enviará uma requisição ping periodicamente para contabilizar o tempo de tela real no backend em vez do timer estático local.

### Requirement: Validação de Quiz Real
O sistema SHALL avaliar as respostas do quiz através do endpoint `/enrollments/:id/lessons/:lessonId/quiz`.

#### Scenario: Submissão de Respostas do Quiz
- **WHEN** o aluno submeter as respostas do quiz final de módulo
- **THEN** o frontend chamará a API enviando o body com as respostas e apresentará o feedback de aprovação baseado exclusivamente no retorno da API.
