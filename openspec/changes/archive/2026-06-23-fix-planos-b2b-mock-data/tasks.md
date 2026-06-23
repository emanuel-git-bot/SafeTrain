## 1. Permissões e B2B

- [x] 1.1 Editar `src/app/pages/admin/AdminClients.tsx` e adicionar `{ key: "view_plans", label: "Planos B2B" }` ao array `ADMIN_SECTIONS`.

## 2. API Endpoints (Backend)

- [x] 2.1 Verificar a existência das rotas de agregação de métricas no backend e implementá-las ou ajustá-las para retornar a receita mensal e performance de cursos.
- [x] 2.2 Verificar ou ajustar a rota `/admin/certificates` no backend para listar todos os certificados emitidos da plataforma.

## 3. Frontend - Remoção de Mock Data

- [x] 3.1 Em `src/app/pages/admin/AdminDashboard.tsx`, remover `mockData.ts` e implementar `api.get('/admin/metrics')` para consumo real.
- [x] 3.2 Em `src/app/pages/admin/AdminMetrics.tsx`, remover `mockData.ts` e implementar chamada à API.
- [x] 3.3 Em `src/app/pages/admin/AdminCertificates.tsx`, remover `ALL_CERTS` e usar `api.get('/admin/certificates')`.
- [x] 3.4 Em `src/app/pages/admin/AdminStudents.tsx`, mapear a propriedade `certs` para a contagem real baseada nos dados do usuário recebidos de `/admin/users` ao invés de fixar em 0.
