## 1. AdminCourses — Conectar ao Backend

- [x] 1.1 Substituir a importação de `COURSES` (mock) por `useEffect` que faz `GET /courses` (sem filtro `published: true`) para listar todos os cursos no admin
- [x] 1.2 Exibir status real de publicação (`published`) em vez de sempre "Publicado"
- [x] 1.3 Implementar botão "Novo Curso": chamar `POST /admin/courses` com `{ title: "Novo Curso", published: false }` e navegar ao editor com o `courseId` retornado
- [x] 1.4 Implementar botão "Editar": chamar `onEdit(course.id)` passando o ID real do curso
- [x] 1.5 Implementar botão "Deletar": chamar `DELETE /admin/courses/:id` após confirmação e recarregar a lista

## 2. AdminPanel — Prop courseId

- [x] 2.1 Adicionar estado `editingCourseId: number | null` ao `AdminPanel.tsx`
- [x] 2.2 Alterar `onEdit` para receber o `courseId` e armazená-lo em `editingCourseId`
- [x] 2.3 Passar `courseId={editingCourseId}` ao `AdminCourseEditor` quando renderizado

## 3. AdminCourseEditor — Dados Reais do Curso

- [x] 3.1 Alterar a assinatura de `AdminCourseEditor` para receber `courseId: number` como prop
- [x] 3.2 Ao montar, fazer `GET /courses/:id` e preencher os estados de título, área, preço, descrição, carga horária e lista de módulos com dados reais
- [x] 3.3 Remover toda dependência de `MODULES_BUILDER` e `AREAS` (mock) do editor
- [x] 3.4 Implementar campos inline editáveis para título do curso, preço, carga horária e área (com select carregado de `GET /areas`)
- [x] 3.5 Implementar botão "Salvar curso" que chama `PUT /admin/courses/:id` com título, preço, descrição, carga horária e areaId
- [x] 3.6 Implementar botão "Publicar / Despublicar" que chama `PUT /admin/courses/:id` com `{ published: !current }`

## 4. Editor de Módulos — Vídeo

- [x] 4.1 Ao clicar "+ Vídeo", chamar `POST /admin/courses/:id/modules` com `{ title: "Novo vídeo", type: "video" }` e adicionar o módulo retornado à lista (com ID real do banco)
- [x] 4.2 Substituir a área de drag-and-drop por campo de texto "URL do Vídeo" (YouTube, Vimeo ou link direto)
- [x] 4.3 Manter campo "Tempo Mínimo (min)" para `minScreenTime`
- [x] 4.4 Botão "Salvar módulo" (vídeo): chamar `PUT /admin/courses/:id/modules/:moduleId` com `{ title, videoUrl, minScreenTime, type: "video" }`
- [x] 4.5 Botão de deletar módulo: chamar `DELETE /admin/courses/:id/modules/:moduleId` e remover da lista

## 5. Editor de Módulos — Quiz

- [x] 5.1 Ao clicar "+ Quiz", chamar `POST /admin/courses/:id/modules` com `{ title: "Nova avaliação", type: "quiz" }` e adicionar à lista
- [x] 5.2 Implementar lista de questões com estado local (array de `{ id, text, options: [A,B,C,D], correctIndex }`)
- [x] 5.3 Implementar formulário "Adicionar questão": campo de texto para a pergunta, 4 inputs para as alternativas e seletor de resposta correta (radio ou select)
- [x] 5.4 Permitir deletar questões individualmente da lista
- [x] 5.5 Manter slider de "Nota de Corte" (`passingScore`)
- [x] 5.6 Botão "Salvar módulo" (quiz): serializar questões em JSON e chamar `PUT /admin/courses/:id/modules/:moduleId` com `{ title, questions: JSON.stringify([...]), passingScore, type: "quiz" }`
- [x] 5.7 Ao carregar um módulo de quiz existente, desserializar `questions` JSON e preencher a lista de questões no editor

## 6. Verificação Final

- [x] 6.1 Criar um curso novo do zero no admin, adicionar um módulo de vídeo e um quiz com questões, publicar e verificar que aparece no catálogo público
- [x] 6.2 Recarregar o editor de um curso existente e confirmar que os dados (título, módulos, questões) carregam corretamente do banco
