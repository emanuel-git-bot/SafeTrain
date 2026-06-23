## Context

A SafeTrain é uma plataforma de e-learning focada em treinamentos obrigatórios de EPI (Equipamento de Proteção Individual) para o mercado brasileiro. O protótipo frontend já foi desenvolvido em React/Vite (TypeScript) e está estruturado em pastas por feature. O backend, banco de dados e integrações externas ainda precisam ser implementados.

O frontend atual usa dados mockados (`src/app/data/mockData.ts`) e serve como contrato visual para as funcionalidades descritas neste documento.

## Goals / Non-Goals

**Goals:**
- Definir a arquitetura do sistema completo (frontend + backend + storage + pagamentos).
- Estabelecer o modelo de dados que suporte B2C, B2B (multi-tenant) e rastreamento de tempo de tela.
- Definir a estratégia de integração com Cloudflare R2 (vídeos), gateway de pagamento e sistema de certificados.
- Garantir que o heartbeat de rastreamento de tempo de tela seja seguro e não facilmente burlável.

**Non-Goals:**
- Integração com ERPs/HCMs corporativos (folha de pagamento, SSO enterprise).
- Suporte a conteúdo SCORM — apenas vídeos MP4 + quizzes nativos.
- App mobile nativo — o frontend é web responsivo.

## Decisions

**1. Armazenamento de Vídeos: Cloudflare R2**

Optou-se por Cloudflare R2 ao invés de AWS S3 pela isenção de taxas de egress (transferência de saída), que seria o principal custo em uma plataforma de vídeo. A API é compatível com S3, facilitando migrações futuras.

*Alternativas consideradas:*
- **AWS S3**: Custo de egress inviável para streaming de vídeo em escala.
- **Vimeo Pro**: Mensalidade fixa, player pronto — mantido como opção secundária via campo "link externo" no construtor de cursos.
- **Servidor próprio**: Sem CDN, alta latência para usuários distribuídos geograficamente.

**2. Rastreamento de Tempo de Tela: Heartbeat/Ping**

O frontend enviará um ping à API a cada **30 segundos** enquanto o vídeo estiver em reprodução (`playing = true`). O backend valida e persiste o tempo acumulado em `ScreenTimeLog`. A aula só é marcada como `completed` quando `totalSeconds >= requiredSeconds`.

*Alternativas consideradas:*
- **Botão "Assistido"**: Trivialmente burlável; inaceitável para requisitos normativos (NR-35, NR-10).
- **Evento `ended` do player**: Não garante que o aluno assistiu — pode avançar o seek bar.
- **Apenas timestamp de início/fim**: Detectável por pausa prolongada da aba, mas não distingue inatividade real.

*Mitigação de fraude:* O backend rejeitará pings que cheguem em intervalo < 25s (tolerância de rede) ou que acumulem mais de 70s em um período de 60s para o mesmo `(userId, lessonId)`.

**3. Modelo de Acesso B2B: Vouchers de Uso Único**

Empresas adquirem lotes de N acessos. O sistema gera N vouchers (`VTC-{YEAR}-{RANDOM8}`). O RH distribui os códigos. No cadastro/matrícula, o aluno usa o voucher, que: (a) é marcado como `used`, (b) cria o vínculo `CompanyStudent`, (c) libera o curso sem cobrança adicional.

*Alternativas consideradas:*
- **Login corporativo (SSO/SAML)**: Complexidade técnica alta; excluído como Non-Goal nesta fase.
- **Domínio de e-mail corporativo**: Não confiável — funcionários podem usar Gmail pessoal.

**4. Certificados: UUID + Hash de Validação**

Cada certificado gerado possui um `uuid` (público, no QR Code) e um `validationHash` (SHA-256 de `studentId + courseId + completedAt`). A página pública `/validar/{uuid}` consulta o banco e exibe os dados sem expor o hash. Isso garante que um certificado não possa ser fabricado sem acesso ao banco.

*Alternativas consideradas:*
- **Assinatura JWT**: Mais segura (sem banco), mas requer gerenciamento de chaves e revogação.
- **PDF com carimbo digital (ICP-Brasil)**: Nível de conformidade muito alto para fase inicial.

**5. Stack de Backend**

- **API**: Node.js + Fastify (performance, TypeScript nativo, ecosistema compatível com frontend).
- **ORM**: Prisma (type-safe, migrations declarativas, suporte a PostgreSQL).
- **Banco de dados**: PostgreSQL (suporte a UUID nativo, JSON, índices eficientes para queries de relatório B2B).
- **Pagamentos**: Stripe (SDKs maduros, suporte a BRL, webhooks para confirmar pagamento assíncrono).

## Risks / Trade-offs

- **[Risco] Limite de Armazenamento R2 (10 GB no plano free):** Facilmente atingido com vídeos em HD.
  *Mitigação:* Alertar o Admin sobre tamanho máximo por upload (ex: 500 MB). Implementar pipeline de compressão (FFmpeg) como tarefa assíncrona pós-upload no roadmap.

- **[Risco] Fraude no heartbeat:** Alunos técnicos podem automatizar requisições à API de ping.
  *Mitigação:* Rate-limit de pings no backend + futuramente, adicionar token de sessão rotativo por módulo (challenge-response leve).

- **[Risco] Consistência de pagamento:** Falha na rede após o gateway aprovar mas antes do backend confirmar pode gerar usuário que pagou mas não tem acesso.
  *Mitigação:* Usar webhooks do Stripe como fonte de verdade. O backend só libera acesso após confirmar o evento `payment_intent.succeeded` via webhook, nunca apenas pelo redirect do cliente.

- **[Trade-off] Vouchers sem SSO:** Funcionários que trocam de e-mail ou empresa perdem o histórico vinculado ao voucher anterior.
  *Decisão aceita:* SSO corporativo é Non-Goal para esta fase. O RH pode reatribuir manualmente via painel B2B.
