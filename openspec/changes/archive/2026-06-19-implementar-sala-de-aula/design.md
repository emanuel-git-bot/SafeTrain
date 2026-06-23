## Context

A tela de Sala de Aula (ClassroomPage) e a lógica de matrícula ainda estão estáticas no frontend. O backend já possui os modelos do Prisma (`Enrollment`, `ScreenTimeLog`, `Module`, `Course`, `Certificate`), mas faltam as rotas que conectam as ações do aluno (matricular-se, acompanhar vídeos e realizar o quiz final) com esses modelos. O frontend precisa ser reestruturado para carregar dinamicamente os módulos de um curso com base num `enrollmentId`.

## Goals / Non-Goals

**Goals:**
- Implementar as rotas backend necessárias para o aluno (criação e progresso de matrícula).
- Adaptar o frontend (`ClassroomPage`) para obter os módulos a partir do banco e atualizar a UI em tempo real conforme o ping de tempo de tela e a validação do quiz.
- Gerar um certificado ao concluir o último passo com sucesso.

**Non-Goals:**
- Não iremos integrar provedores de vídeo externos complexos (o vídeo ainda usará o componente visual existente, mas simulando o play/pause para o `ScreenTimeLog`).
- Não mexeremos nos fluxos de pagamento (matrícula grátis/direta nesta fase).

## Decisions

- **Heartbeat de Progresso (Ping):** Em vez de enviar apenas quando o vídeo termina, faremos requisições a cada N segundos (ex: 5s ou 10s) para a rota `/enrollments/:id/ping`. O backend atualizará a tabela `ScreenTimeLog` garantindo que o `timeSpent` vá incrementando. Isso previne perda de dados caso o navegador feche.
- **Validação de Avaliação (Quiz):** O quiz será validado no backend (`/enrollments/:id/quiz`) recebendo o array de respostas. O backend compara com o `questions` JSON do módulo correspondente, calcula a pontuação, e retorna se passou ou reprovou.
- **Conclusão de Matrícula:** Se o aluno passar no quiz, o frontend chamará `/enrollments/:id/complete` (ou o próprio `/quiz` já pode marcar como completo se for o último módulo). Decidimos que a rota `/complete` será separada para gerar o certificado e atualizar `Enrollment.status` para `completed`.
- **Certificado Hash:** Usaremos a biblioteca padrão de criptografia do Node (`crypto`) ou um UUID v4 para gerar o código/hash único do certificado.

## Risks / Trade-offs

- **Fraude no tempo de tela:** Um usuário avançado poderia chamar a API de ping manualmente.
  - *Mitigação:* Como os certificados são importantes para compliance (NRs), em uma etapa futura podemos adicionar tokens temporários ou tracking mais ofuscado. Para esta versão, assumiremos boa-fé com validação simples do incremento de tempo no backend.
- **Requisições de Ping:** Pode gerar alto volume no banco.
  - *Mitigação:* Configuraremos o intervalo de ping no frontend para cada 10-15 segundos. Podemos usar `upsert` no Prisma para otimizar a atualização do `ScreenTimeLog`.
