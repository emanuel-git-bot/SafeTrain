## Why

Existe forte demanda por treinamentos e certificações obrigatórias na área de segurança do trabalho (EPI). Atualmente, falta uma plataforma moderna que atenda tanto clientes individuais (B2C) quanto empresas (B2B), simplificando a venda, a gestão de treinamentos e a comprovação de certificações através de uma experiência unificada e flexível.

## What Changes

- Criação de uma vitrine de cursos EPI com recomendação inteligente baseada na área de atuação do aluno (B2C).
- Implementação de sistema de e-commerce: checkout individual (B2C) e venda em lote via vouchers para empresas (B2B).
- Painel B2B exclusivo para gestores de RH: acompanhar progresso e baixar certificados de funcionários.
- Construtor de cursos (Admin) com suporte a módulos de vídeo (Cloudflare R2 ou link externo) e quizzes nativos, com nota de corte configurável por curso.
- Sala de aula virtual com rastreamento de tempo mínimo de tela por módulo (heartbeat/ping).
- Sistema de avaliação, geração de certificado digital e validação pública via QR Code.
- Vitrine de empresas parceiras na landing page para agregar credibilidade.

## Capabilities

### New Capabilities

- `ecommerce-b2c`: Vitrine de cursos, onboarding com seleção de área de atuação, recomendação personalizada e checkout de cursos individuais.
- `ecommerce-b2b`: Venda de lotes de acesso, geração e distribuição de vouchers (códigos únicos), painel de RH para acompanhamento de progresso e download de certificados em lote.
- `course-builder`: Ferramenta Admin para montar módulos de curso (vídeo via R2 ou link externo, quizzes nativos), configurar tempo mínimo de aula e nota de corte por avaliação.
- `learning-environment`: Ambiente do aluno para consumir conteúdo com controle de tempo mínimo de tela (heartbeat/ping à API) e responder avaliações.
- `certificate-validation`: Emissão de certificados digitais com UUID e hash de validação, QR Code apontando para URL pública de verificação de autenticidade.

### Modified Capabilities

*(Novo Projeto — sem specs existentes para modificar.)*

## Impact

- **Banco de dados**: Novo modelo com suporte a multi-tenant (B2B/B2C), entidades `Company`, `Voucher`, `Enrollment`, `ScreenTimeLog`, `Certificate`.
- **Storage**: Integração com Cloudflare R2 para upload e servir vídeos de cursos.
- **API**: Endpoints para heartbeat de rastreamento, geração/validação de certificado, gestão de vouchers.
- **Pagamentos**: Integração com gateway (Stripe/PagSeguro/Mercado Pago) para checkout B2C e compra de lotes B2B.
- **Frontend**: Novas páginas e seções já prototipadas no repositório (SafeTrain).
