## Why

A tela de Sala de Aula (ClassroomPage) atualmente exibe dados estáticos mockados e não reflete o estado real da matrícula do aluno nem os módulos do curso selecionado. Precisamos implementar o fluxo de sala de aula real, desde a criação da matrícula até o registro do progresso e validação do quiz, finalizando com a geração de certificados para fechar o ciclo de aprendizagem do aluno na plataforma.

## What Changes

- Criação da funcionalidade de Matrícula (Enrollment) via `POST /enrollments` (Backend e Frontend).
- Conexão do `ClassroomPage` com a API para buscar a matrícula e as lições do curso real (`GET /courses/:id`).
- Implementação de um ping/heartbeat de progresso (`POST /enrollments/:id/ping`) para contabilizar o tempo mínimo de tela do módulo atual antes de liberar a avaliação final.
- Validação dinâmica do quiz (`POST /enrollments/:id/quiz`), usando as questões cadastradas no backend.
- Conclusão da matrícula e direcionamento para a geração de certificado (`POST /enrollments/:id/complete`).
- Navegação dinâmica: Ao clicar em "Matricular" num curso do catálogo, o usuário aceita e é direcionado para a sua sala de aula vinculada ao `enrollmentId`.

## Capabilities

### New Capabilities
- `course-enrollment`: Criação de matrícula, inicialização e rastreamento de progresso por módulo no LMS.
- `classroom-experience`: Player de vídeo, transição entre módulos, acompanhamento de tempo de tela (NR-35 compliance) e interface do Quiz.
- `quiz-evaluation`: Processamento de respostas do quiz, cálculo da nota, validação com nota de corte.

### Modified Capabilities
Nenhuma modificação de requisito de spec anterior.

## Impact

- Frontend: `CatalogPage`, `LandingPage`, `ClassroomPage`, `App.tsx` (rotas), modais de confirmação.
- Backend: Criação de rotas do grupo `enrollments` (`POST /enrollments`, `POST /enrollments/:id/ping`, `POST /enrollments/:id/quiz`, `POST /enrollments/:id/complete`). Modificação nos modelos de banco de dados para progresso, se faltarem relacionamentos ou campos específicos de status.
