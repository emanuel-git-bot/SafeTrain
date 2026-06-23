## Why

A plataforma atual não permite que os alunos visualizem os detalhes completos do curso antes da matrícula (vitrine), e a criação de cursos no painel Admin precisa de melhorias, como organizar os módulos em categorias (seções), definir imagem de capa real e a validade do certificado. Além disso, as empresas (B2B) precisam de uma funcionalidade para comprar pacotes/planos de vouchers de acesso em massa.

## What Changes

- **Catálogo de Cursos**: Exibir a foto real cadastrada no curso.
- **Vitrine do Curso**: Adição de um novo Modal de Detalhes do Curso ("Ver Curso") no Catálogo com informações como: Carga horária, Módulos, Aulas, Nota de corte, Validade, Nível, e Conteúdo Programático.
- **Admin - Criador de Curso**:
  - Adição dos campos `image` (upload) e `validityMonths` na aba de Configurações do curso.
  - Implementação do conceito de Seções (Categorias) para agrupar módulos (Opção B - Tabela nova).
- **Planos B2B**:
  - Tela no Painel Admin para criar e gerenciar Planos (ex: "Plano Ouro", "Plano Prata").
  - Interface no Painel da Empresa B2B para visualizar planos disponíveis e comprá-los, gerando os vouchers automaticamente.

## Capabilities

### New Capabilities
- `course-showcase`: Visualização estendida dos detalhes do curso (vitrine/conteúdo programático) antes da matrícula.
- `course-sections`: Suporte a agrupamento e categorização de módulos (CourseSection) no criador de cursos.
- `b2b-plans`: Fluxo completo de criação de planos pelo Admin e compra de acesso em lote pelas Empresas.

### Modified Capabilities
- Nenhuma

## Impact

- **Banco de Dados**: Novas tabelas `CourseSection`, atualização na tabela `Course` (para `validityMonths`).
- **Telas**: `CatalogPage.tsx`, `AdminCourseEditor.tsx`, `AdminPlans.tsx` (novo), e `B2BDashboard.tsx` (modificado para a aba de compras).
