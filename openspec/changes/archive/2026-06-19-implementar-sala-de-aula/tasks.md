## 1. Rotas de Matrícula (Backend)

- [x] 1.1 Criar rota `POST /enrollments` para registrar o início de um curso (verificando se o usuário já não possui matrícula ativa) e inicializar `progress` com 0.
- [x] 1.2 Criar rota `GET /users/me/enrollments` para listar as matrículas ativas e concluídas de um usuário, populando os dados do `Course` via relação.
- [x] 1.3 Atualizar as chamadas de banco de dados (`prisma.enrollment`) para suportar a criação e listagem.

## 2. Ações de Progresso e Quiz (Backend)

- [x] 2.1 Criar rota `POST /enrollments/:id/ping` que receba `moduleId` para atualizar o `timeSpent` na tabela `ScreenTimeLog` via operação upsert/update, e retorne o status (se atingiu tempo mínimo).
- [x] 2.2 Criar rota `POST /enrollments/:id/quiz` que avalie as respostas recebidas comparando com a estrutura JSON do módulo, calcule a nota, e valide se é maior ou igual ao `passingScore`.
- [x] 2.3 Criar rota `POST /enrollments/:id/complete` que valide se todas as dependências do curso foram cumpridas, gere um hash de certificado e grave na tabela `Certificate`, além de alterar o status da matrícula para `completed`.

## 3. Integração Frontend - Catálogo e Modal

- [x] 3.1 Em `CatalogPage` e `LandingPage`, ao clicar em "Matricular", passar as informações do curso real para o `EnrollModal`.
- [x] 3.2 Em `EnrollModal`, implementar o callback `onSuccess` chamando a nova rota `POST /enrollments` com o `courseId`, e repassando o `enrollmentId` para a navegação da `ClassroomPage`.

## 4. Integração Frontend - Sala de Aula (ClassroomPage)

- [x] 4.1 Modificar `ClassroomPage` para receber e gerenciar via estado o `enrollmentId`.
- [x] 4.2 Fazer fetch dos dados da matrícula e dos módulos (`GET /courses/:courseId`) quando a página carrega.
- [x] 4.3 Adaptar a renderização da barra lateral de módulos para mapear os módulos retornados da API.
- [x] 4.4 Modificar a visualização de "Vídeo" para disparar a função de `ping` periódica baseada no ID do módulo selecionado.
- [x] 4.5 Modificar a visualização de "Quiz" para extrair as questões do JSON do módulo, e enviar as respostas do usuário para a rota `/quiz`.
- [x] 4.6 Implementar transição suave de aprovação para criação do certificado após sucesso no quiz, disparando a rota `/complete` e mostrando o resultado.

## 5. Verificação Final

- [x] 5.1 Fazer uma matrícula completa simulando um usuário comum e garantir que o tempo de tela é contabilizado adequadamente.
- [x] 5.2 Realizar o teste final errando questões do quiz (para ser barrado) e acertando (para aprovar).
- [x] 5.3 Validar que o certificado é gerado no banco de dados e pode ser visualizado ou rastreado.
