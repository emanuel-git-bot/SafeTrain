## Why
A plataforma atualmente realiza as matrículas em cursos (B2C) e vendas de planos (B2B) sem integração com meios de pagamento reais ou emissão de Nota Fiscal. Precisamos implementar o fluxo financeiro completo com suporte a múltiplos provedores de pagamento (iniciando pelo PagBank com estrutura preparada para o Neon), oferecer pagamentos por PIX e Cartão de Crédito, e preparar o terreno para a emissão automatizada de Notas Fiscais de Serviço (NFS-e).

## What Changes
- Configurações do administrador para selecionar o Gateway de pagamento ativo (PagBank vs Neon) e informar tokens de API.
- Tabela `Order` expandida para unificar vendas B2C (Cursos) e B2B (Planos), salvando os dados do pagamento (status, gateway_id, url do pix, e link da NFe).
- Novo Fluxo de Checkout no B2C para comprar um curso específico via PIX ou Cartão antes da matrícula.
- Modificação no fluxo de Checkout B2B (compra de planos corporativos) para processar o pagamento real (PIX/Cartão), mantendo a opção de aplicar cupons.
- Endpoint de Webhooks (`/webhooks/pagbank`) para aprovação assíncrona de pagamentos PIX.
- Estrutura assíncrona pós-pagamento para acionar integrações de Nota Fiscal (eNotas / Focus NFe).

## Capabilities

### New Capabilities
- `payment-processing`: Processamento e orquestração de pagamentos (Cartão/PIX) via Strategy Pattern, gerenciamento de tokens no banco e recepção de webhooks.
- `nf-integration`: Estrutura de acionamento para emissão de Nota Fiscal (NFS-e) e armazenamento dos links gerados para o cliente/empresa.

### Modified Capabilities
- `b2b-ecommerce`: O checkout de pacotes/vouchers corporativos passará a cobrar através das APIs de pagamento e não apenas gerar a Order.
- `course-enrollment`: A jornada de matrícula para alunos (B2C) agora exige o pagamento prévio (checkout) antes de liberar o acesso à sala de aula.

## Impact
- Frontend: Criação das telas de Checkout B2B e B2C, e da seção de Configurações do Admin.
- Backend/DB: Alterações no schema do Prisma (`Order`, `SystemSettings`), criação das controllers de pagamento, e nova rota pública para webhooks que altera os status dos cursos e planos.
