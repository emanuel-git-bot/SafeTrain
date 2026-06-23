## 1. Banco de Dados e API

- [x] 1.1 Atualizar `schema.prisma`: Adicionar modelo `CourseSection` e relacionar com `Course` e `Module`.
- [x] 1.2 Atualizar `schema.prisma`: Adicionar `validityMonths` no modelo `Course`.
- [x] 1.3 Rodar migrations ou db push no banco de dados.
- [x] 1.4 Criar/Atualizar rotas no backend para CRUD de `CourseSection`.
- [x] 1.5 Atualizar rotas de GET do `Course` para incluir as seções aninhadas com os módulos.
- [x] 1.6 Implementar endpoints de `Plan` (CRUD) em `/admin/plans`.
- [x] 1.7 Implementar endpoint `POST /b2b/orders` para comprar planos e gerar vouchers.

## 2. Vitrine e Melhorias no Catálogo

- [x] 2.1 Adicionar Modal "Ver Curso" (Vitrine) no botão principal da `CatalogPage`.
- [x] 2.2 Exibir na vitrine as informações gerais (duração, aulas, nível, validade).
- [x] 2.3 Exibir na vitrine a aba de "Conteúdo Programático" agrupado por seções.

## 3. Melhorias no Admin (Editor de Curso)

- [x] 3.1 Adicionar upload de imagem e campo de Validade em `AdminCourseEditor`.
- [x] 3.2 Atualizar UI de módulos no `AdminCourseEditor` para permitir criar Seções.
- [x] 3.3 Permitir associar módulos a seções criadas.

## 4. B2B Planos (Admin e Dashboard Empresa)

- [x] 4.1 Criar tela `AdminPlans` para gerenciar os pacotes de acesso para empresas.
- [x] 4.2 Incluir botão para `AdminPlans` no sidebar do Admin.
- [x] 4.3 Atualizar `B2BDashboard` adicionando a aba "Comprar Vouchers".
- [x] 4.4 Listar planos do banco na nova aba do B2B.
- [x] 4.5 Permitir simulação de compra que gera vouchers para a empresa.
