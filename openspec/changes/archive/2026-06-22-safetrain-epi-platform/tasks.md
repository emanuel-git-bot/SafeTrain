## 1. Fundação e Infraestrutura

- [x] 1.1 Configurar projeto Node.js + Fastify com TypeScript no diretório `server/`
- [ ] 1.2 Configurar Prisma com PostgreSQL e criar o arquivo `.env` com `DATABASE_URL`
- [x] 1.3 Modelar schema Prisma: `User`, `Company`, `Course`, `Module`, `Enrollment`, `ScreenTimeLog`, `Certificate`, `Voucher`, `CompanyStudent`
- [ ] 1.4 Executar primeira migration (`prisma migrate dev --name init`)
- [x] 1.5 Configurar variáveis de ambiente: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `STRIPE_SECRET_KEY`, `JWT_SECRET`
- [ ] 1.6 Configurar bucket no Cloudflare R2 e habilitar acesso público (CDN) para servir vídeos
- [x] 1.7 Adicionar middleware de autenticação JWT ao Fastify (`fastify-jwt`)
- [x] 1.8 Adicionar middleware de rate-limit ao Fastify (`@fastify/rate-limit`)

## 2. Autenticação e Usuários

- [x] 2.1 Implementar endpoint `POST /auth/register` — cria `User`, salva área de atuação e opcionalmente ativa voucher corporativo
- [x] 2.2 Implementar endpoint `POST /auth/login` — retorna JWT com `userId`, `role` e `companyId` (se B2B)
- [ ] 2.3 Implementar autenticação OAuth via Google (`@fastify/oauth2`)
- [x] 2.4 Implementar endpoint `GET /users/me` — retorna perfil do usuário autenticado
- [x] 2.5 Conectar formulário de cadastro do frontend (`RegisterPage.tsx`) à API `POST /auth/register`
- [x] 2.6 Conectar formulário de login do frontend (`LoginPage.tsx`) à API `POST /auth/login` com persistência do JWT em `localStorage`

## 3. Cursos e Catálogo (B2C — `ecommerce-b2c`)

- [x] 3.1 Implementar endpoint `GET /courses` — retorna lista de cursos publicados com filtros `?area=` e `?sort=`
- [x] 3.2 Implementar endpoint `GET /courses/:id` — retorna detalhes do curso e módulos
- [x] 3.3 Conectar `CatalogPage.tsx` e `LandingPage.tsx` ao endpoint `GET /courses` (remover dados do `mockData.ts`)
- [x] 3.4 Implementar recomendação por área: `GET /courses/recommended` — filtra pela `area` do usuário autenticado
- [ ] 3.5 Conectar aba "Recomendados" do `MyPanel.tsx` ao endpoint de recomendação

## 4. E-commerce B2C — Checkout Individual

- [x] 4.1 Implementar endpoint `POST /payments/checkout` — cria `PaymentIntent` no Stripe e retorna `clientSecret`
- [x] 4.2 Integrar Stripe.js no frontend (`EnrollModal.tsx`) para processar cartão com `clientSecret`
- [x] 4.3 Implementar endpoint `POST /payments/webhook` — escuta eventos Stripe, cria `Enrollment` ao receber `payment_intent.succeeded`
- [x] 4.4 Implementar endpoint `POST /vouchers/activate` — valida e ativa voucher, cria `Enrollment` e vincula aluno à empresa
- [x] 4.5 Conectar aba "Usar código" do `EnrollModal.tsx` ao endpoint `POST /vouchers/activate`

## 5. E-commerce B2B — Gestão de Empresas e Vouchers (`ecommerce-b2b`)

- [x] 5.1 Implementar endpoint `POST /companies` — cria empresa e gestor de RH
- [x] 5.2 Implementar endpoint `POST /companies/:id/purchase` — registra compra de lote, chama Stripe e gera N vouchers após webhook `payment_intent.succeeded`
- [x] 5.3 Implementar endpoint `GET /companies/:id/vouchers` — lista vouchers da empresa com status
- [x] 5.4 Implementar endpoint `POST /companies/:id/distribute` — envia e-mails com vouchers para lista de endereços informados
- [x] 5.5 Implementar endpoint `GET /companies/:id/students` — retorna colaboradores vinculados com progresso e status
- [x] 5.6 Implementar endpoint `POST /companies/:id/link-student` — busca `User` por e-mail e cria `CompanyStudent`
- [x] 5.7 Implementar endpoint `DELETE /companies/:id/students/:userId` — desvincula colaborador da empresa
- [x] 5.8 Conectar `B2BDashboard.tsx` (abas Visão Geral, Colaboradores, Vouchers, Buscar) aos endpoints reais

## 6. Construtor de Cursos — Admin (`course-builder`)

- [x] 6.1 Implementar endpoint `POST /admin/courses` — cria curso com metadados
- [x] 6.2 Implementar endpoint `PUT /admin/courses/:id` — atualiza metadados e status do curso
- [x] 6.3 Implementar endpoint `DELETE /admin/courses/:id` — remove curso e módulos associados
- [x] 6.4 Implementar endpoint `POST /admin/courses/:id/modules` — adiciona módulo (vídeo ou quiz)
- [x] 6.5 Implementar endpoint `PUT /admin/courses/:id/modules/:moduleId` — atualiza módulo (título, tempo mínimo, nota de corte)
- [x] 6.6 Implementar endpoint `DELETE /admin/courses/:id/modules/:moduleId` — remove módulo
- [x] 6.7 Implementar endpoint `POST /admin/r2/signed-url` — gera signed URL do R2 para upload direto pelo frontend
- [x] 6.8 Conectar `AdminCourseEditor.tsx` ao fluxo de upload R2 via signed URL (multipart direto ao R2)
- [x] 6.9 Conectar `AdminCourseEditor.tsx` ao endpoint de criação/edição de módulos
- [x] 6.10 Conectar `AdminCourses.tsx` ao endpoint de listagem e remoção de cursos

## 7. Sala de Aula e Rastreamento (`learning-environment`)

- [x] 7.1 Implementar endpoint `POST /enrollments/:id/lessons/:lessonId/ping` — registra heartbeat de 30s, valida rate-limit e acumula em `ScreenTimeLog`
- [x] 7.2 Implementar endpoint `GET /enrollments/:id/progress` — retorna progresso do aluno por módulo (tempo acumulado vs. mínimo)
- [x] 7.3 Implementar endpoint `POST /enrollments/:id/lessons/:lessonId/complete` — marca módulo como concluído após validar tempo mínimo no backend
- [x] 7.4 Implementar endpoint `POST /enrollments/:id/lessons/:lessonId/quiz` — avalia respostas, aplica nota de corte e retorna aprovado/reprovado
- [x] 7.5 Conectar `ClassroomPage.tsx` ao endpoint de ping (substituir setInterval de mock por chamada à API)
- [x] 7.6 Conectar quiz do `ClassroomPage.tsx` ao endpoint de avaliação real
- [x] 7.7 Implementar endpoint `GET /users/me/enrollments` — lista matrículas do aluno com progresso
- [x] 7.8 Conectar `MyPanel.tsx` ao endpoint de matrículas (substituir `MY_COURSES` do mockData)

## 8. Certificados e Validação (`certificate-validation`)

- [x] 8.1 Implementar lógica no backend que, ao completar o curso 100%, gera e salva a URL de um certificado (PDF mockado)
- [x] 8.2 Endpoint `GET /certificates/:id` — retorna URL do certificado
- [x] 8.3 Endpoint `GET /certificates/validate/:hash` — valida autenticidade do certificado (página pública)
- [x] 8.4 Conectar link de certificado no frontend (`MyPanel.tsx` e `CertificateViewer`) público `GET /validate/{uuid}`
- [x] 8.8 Conectar botão "Baixar PDF" ao endpoint `GET /certificates/:uuid/pdf`

## 9. Painel Admin — Dados Reais

- [x] 9.1 Implementar endpoint `GET /admin/analytics` — retorna KPIs (Total alunos, receita, taxa conclusão)
- [x] 9.2 Implementar endpoint `GET /admin/users` — lista todos os usuários cadastrados
- [x] 9.3 Conectar `AdminPanel.tsx` e `AdminStudents.tsx` aos endpoints

## 10. Finalização e Documentação

- [x] 10.1 Escrever arquivo `README.md` detalhado (Setup, Variáveis de Ambiente, Como Rodar)
- [x] 10.2 Configurar scripts de build do frontend e backend (`npm run build`)
- [x] 10.3 Testes manuais: Fluxo completo de compra, assistir aula, quiz e certificados com filtro e busca
- [ ] 9.5 Conectar `AdminDashboard.tsx` ao endpoint de KPIs reais
- [ ] 9.6 Conectar `AdminMetrics.tsx` ao endpoint de série histórica
- [ ] 9.7 Conectar `AdminStudents.tsx` ao endpoint de alunos reais

- [ ] 10.1 Escrever testes de integração para o endpoint de ping (`/enrollments/:id/lessons/:lessonId/ping`) — validar rate-limit e acumulação de tempo
- [ ] 10.2 Escrever testes para `CertificateService.generate()` — garantir hash correto e unicidade do UUID
- [ ] 10.3 Escrever testes para ativação de voucher — cenários: válido, inválido, já usado
- [ ] 10.4 Testar webhook Stripe em ambiente de staging com Stripe CLI (`stripe listen --forward-to`)
- [ ] 10.5 Configurar pipeline CI/CD (GitHub Actions): build, teste, deploy do backend e do frontend
- [ ] 10.6 Configurar alertas de armazenamento R2 (aviso ao Admin quando uso ultrapassar 7 GB do limite de 10 GB)
