## Why

O editor de cursos do painel administrativo está completamente desconectado do backend. A lista de cursos exibe dados mock, o editor sempre abre o mesmo curso hardcoded ("NR-35"), e nenhuma ação (criar, editar, deletar curso; criar, salvar, deletar módulo) persiste no banco. O backend já possui todas as rotas necessárias — o problema é 100% no frontend.

## What Changes

- **AdminCourses**: Substituir dados mock por `GET /courses` (admin), com ações reais de editar e deletar cursos
- **AdminCourseEditor**: Refatorar para receber `courseId` (ou `null` para novo curso), carregar dados reais via `GET /courses/:id`, editar título/área/preço/descrição/carga horária inline, e publicar/despublicar via `PUT /admin/courses/:id`
- **Módulos de Vídeo**: Campo de URL do vídeo (YouTube, Vimeo ou link direto) em vez de upload; campo de tempo mínimo de tela; persistir via `POST/PUT /admin/courses/:id/modules`
- **Módulos de Quiz**: Editor completo com criação de questões com alternativas múltiplas (A/B/C/D) e gabarito definido; nota de corte configurável; persistir via `POST/PUT /admin/courses/:id/modules`
- **Deletar módulo**: Chamar `DELETE /admin/courses/:id/modules/:moduleId` ao remover módulo
- **Publicação do curso inteiro**: Botão "Publicar" altera `published: true` em `PUT /admin/courses/:id`

## Capabilities

### New Capabilities
- `course-module-editor`: Editor funcional de módulos de curso (vídeo com URL + quiz com alternativas e gabarito), conectado ao backend

### Modified Capabilities
- `course-management`: A gestão de cursos agora requer CRUD real conectado ao banco (não mais mock data)

## Impact

- **Frontend**: `AdminCourses.tsx`, `AdminCourseEditor.tsx`, `AdminPanel.tsx` (prop courseId)
- **Backend**: Rotas já existem em `admin.ts` e `courses.ts` — nenhuma alteração de backend prevista
- **Dados mock**: `COURSES` e `MODULES_BUILDER` de `mockData.ts` deixam de ser usados na área admin (mantidos para outras telas ainda dependentes)
