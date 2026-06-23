## 1. Painel do Aluno (MyPanel)

- [x] 1.1 Substituir `MY_COURSES` importado de `mockData.ts` no arquivo `src/app/pages/MyPanel.tsx` por uma requisição `GET /users/me/enrollments` utilizando a função `apiFetch`.
- [x] 1.2 Calcular o progresso total e renderizar a lista real de cursos em andamento e concluídos.

## 2. Sala de Aula e Rastreamento (ClassroomPage)

- [x] 2.1 Modificar o hook `useEffect` em `src/app/pages/ClassroomPage.tsx` que atualmente usa `setInterval` para chamar `POST /enrollments/:id/lessons/:lessonId/ping` via `apiFetch`.
- [x] 2.2 Ao submeter o quiz, fazer um POST para `/enrollments/:id/lessons/:lessonId/quiz` e utilizar a nota/status de aprovação retornado pelo servidor.
- [x] 2.3 Após concluir um módulo ou curso, chamar o endpoint de `complete` para garantir consistência no banco.

## 3. Certificados (CertificatePage e CertificateValidator)

- [x] 3.1 Em `src/app/pages/CertificatePage.tsx`, remover o UUID hardcoded e buscar os dados reais do certificado via `GET /certificates/:id`.
- [x] 3.2 Em `src/app/pages/CertificateValidator.tsx`, ao validar um hash digitado pelo usuário, fazer a requisição pública para `GET /certificates/validate/:hash`.

## 4. Painéis Admin e B2B

- [x] 4.1 No componente `AdminDashboard.tsx`, trocar KPIs e gráficos fixos pelas métricas retornadas do endpoint `/admin/analytics`.
- [x] 4.2 Nos subcomponentes como `AdminStudents`, buscar e listar a tabela de usuários via API real.
- [x] 4.3 No componente `B2BDashboard.tsx`, alimentar a listagem de colaboradores e vouchers com requisições para a API de `/companies`.
