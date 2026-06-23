## Context
O painel de administrador possui telas de métricas e listagem de certificados que atualmente exibem dados mockados (importados de `mockData.ts`). Adicionalmente, a funcionalidade de gerenciamento de "Planos B2B" sumiu para usuários que não são Super Admins porque a permissão `view_plans` não está disponível na interface de gerenciamento de permissões do administrador (`AdminClients.tsx`).

## Goals / Non-Goals
**Goals:**
- Corrigir a tela de gerenciamento de permissões (`AdminClients.tsx`) para incluir `view_plans`.
- Substituir o uso de `mockData.ts` em `AdminDashboard.tsx`, `AdminMetrics.tsx` e `AdminCertificates.tsx` por requisições HTTP via `api` ou `apiFetch`.
- Ajustar `AdminStudents.tsx` para apresentar as quantidades reais de certificados dos alunos.

**Non-Goals:**
- Modificações drásticas no design ou layout das telas do painel.
- Otimizações massivas de queries no backend (se as métricas requererem queries muito longas, entregaremos algo simples que atenda aos gráficos).

## Decisions
- Para a correção dos Planos B2B: Apenas acrescentar `{ key: "view_plans", label: "Planos B2B" }` ao array de seções do admin.
- Para as métricas e gráficos: O frontend espera estruturas de arrays com labels e valores. Criaremos requisições ao `/admin/metrics` e, caso o backend ainda não as forneça de forma completa, faremos os ajustes de rota no backend para retornar a série histórica e KPIs em tempo real.
- Para `AdminCertificates.tsx`: Consumir um endpoint de `/admin/certificates` e renderizar as linhas da tabela.

## Risks / Trade-offs
- Se o backend não possuir as queries de agregação de métricas implementadas, pode ser que esse desenvolvimento se estenda levemente para incluir rotas de agregação de vendas/alunos no Fastify/Prisma.
