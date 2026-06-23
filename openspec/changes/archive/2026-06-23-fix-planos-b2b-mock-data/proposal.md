## Why

Atualmente o painel do administrador apresenta dados fictícios ("mockados") nas seções de Dashboard, Métricas e Certificados. Além disso, existe um problema no gerenciamento de permissões onde a opção "Planos B2B" (view_plans) foi omitida da tela de Clientes, fazendo com que a seção "suma" para qualquer administrador editado na plataforma. O objetivo desta mudança é conectar essas seções a dados reais da API e corrigir o bug de permissão.

## What Changes

- **Planos B2B (Bugfix)**: Adição da permissão `view_plans` no array de `ADMIN_SECTIONS` do arquivo `AdminClients.tsx` para permitir que admins concedam essa permissão.
- **Remoção de Mock Data**: Substituição do consumo de `mockData.ts` em `AdminDashboard.tsx` e `AdminMetrics.tsx` por chamadas às rotas da API que entregam as métricas reais.
- **Certificados (Admin)**: Atualização de `AdminCertificates.tsx` para listar os certificados reais consumindo a API.
- **Alunos (Admin)**: Ajuste em `AdminStudents.tsx` para apresentar a contagem real de certificados de cada aluno no lugar do valor fixo (0).

## Capabilities

### New Capabilities

- `admin-metrics`: Conexão de gráficos de Dashboard e Métricas com endpoints reais da API.
- `admin-certificates`: Listagem e consumo da API para os certificados emitidos na visão do administrador.

### Modified Capabilities

- `b2b-ecommerce`: O painel de planos B2B tem seu acesso restaurado para administradores via correção de permissão.

## Impact

- Modificações no frontend React nas telas do painel admin (`AdminClients`, `AdminDashboard`, `AdminMetrics`, `AdminCertificates`, `AdminStudents`).
- Dependência de endpoints no backend para prover as métricas (ex: `/admin/metrics` ou similares) e a listagem de certificados (`/admin/certificates`). Caso não existam no backend, deverão ser implementados.
