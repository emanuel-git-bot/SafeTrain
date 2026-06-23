## Context

O backend foi implementado utilizando SQLite, Prisma e Fastify, englobando todas as funcionalidades cruciais (Autenticação, B2B, B2C, Analytics, Certificates e Classroom). O frontend possui um arquivo centralizado `api.ts` contendo a função `apiFetch` que lida com a injeção do JWT nas chamadas HTTP. Contudo, páginas vitais como a Sala de Aula (`ClassroomPage.tsx`), o Painel Principal (`MyPanel.tsx`) e os dashboards administrativos continuam operando com dados mockados.

## Goals / Non-Goals

**Goals:**
- Substituir o mockData.ts no `MyPanel.tsx` e `ClassroomPage.tsx` pelas chamadas de API reais através da função `apiFetch`.
- Conectar os fluxos de certificado e validação para usarem o backend.
- Conectar dashboards administrativos e de B2B.

**Non-Goals:**
- Modificar o layout ou a UI (Tailwind) já aprovados no protótipo.
- Adicionar novas tabelas ou rotas no backend, que já está 100% pronto.

## Decisions

- **Uso do `apiFetch` existente:** Manter a consistência na forma como as chamadas são feitas no React, sem introduzir Axios ou bibliotecas como SWR/React Query nesta etapa, a fim de manter a simplicidade do protótipo que o cliente já aprovou em `CatalogPage`.
- **Tratamento de Estado:** Utilizar os hooks padrões (`useState`, `useEffect`) nas páginas para orquestrar o loading state e os dados recebidos da API.

## Risks / Trade-offs

- **Risk:** Formulários ou tabelas que esperavam o esquema antigo do mockData (ex: `c.title` vs `c.course.title`) podem quebrar na tela.
  - **Mitigation:** Adaptar as propriedades do JSON retornado pelo backend dentro do componente para bater exatamente com a renderização que já existe.
