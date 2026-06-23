## Context

A plataforma precisa expandir suas funcionalidades de venda B2B e melhorar a experiência de descoberta de cursos pelos alunos (Vitrine) e organização de módulos pelos admins (Seções).

## Goals / Non-Goals

**Goals:**
- Implementar modal de Vitrine do Curso com detalhes completos.
- Implementar conceito de Seções (CourseSection) para agrupamento de módulos no admin e exibição na vitrine.
- Habilitar campo de `validityMonths` na entidade `Course`.
- CRUD de Planos B2B no Admin.
- Fluxo de compra de Planos no dashboard B2B, gerando vouchers simulados.

**Non-Goals:**
- Integração real com gateway de pagamentos (manter mock).
- Automação de envio de emails com os vouchers comprados.
- Player de vídeo novo.

## Decisions

- **CourseSection Model**: 
  - Criaremos o model `CourseSection` (`id`, `title`, `courseId`, `order`).
  - O modelo `Module` receberá a FK `sectionId Int?`. 
  - Dessa forma, módulos antigos sem seção podem continuar existindo na "raiz", enquanto novos módulos podem ser associados a seções. Na UI do Admin, exibiremos blocos de Seções e uma lista de Módulos Avulsos ou todos dentro de Seções.
- **Course Validity**:
  - Adicionaremos `validityMonths Int?` no modelo `Course`. O Admin pode preencher com meses (ex: 24). Se vazio, não expira. 
  - Na tela do Certificado (futuramente), a validade poderá ser calculada somando os meses ao `issuedAt`.
- **B2B Plans Flow**: 
  - O modelo `Plan` e `Order` já existem. Vamos expor a API `GET/POST/PUT/DELETE /admin/plans`.
  - Criaremos `POST /b2b/orders` que criará a Ordem e, na hora, gerará os `N` vouchers (`Plan.voucherCount`) na tabela `Voucher` vinculados à `Company`.

## Risks / Trade-offs

- **Migração de UI de Módulos**: Modificar a reordenação (Drag & Drop) de módulos para aceitar hierarquia (Seção -> Módulo) pode ser complexo. *Mitigação*: Fazer a UI simples: Criar Seções primeiro, depois criar/editar o módulo e escolher em qual Seção ele pertence via um Select, antes de tentar um Drag & Drop nested complexo.
