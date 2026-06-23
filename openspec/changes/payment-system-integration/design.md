## Context
A plataforma precisa cobrar pelos cursos (B2C) e planos (B2B) oferecidos, hoje processados apenas de forma simulada. O fluxo de pagamento precisa ser agnóstico para poder trocar de gateway (PagBank, Neon, etc) via interface de Admin e suportar webhooks para aprovação assíncrona. Também é preciso criar a fundação para a geração automática de Notas Fiscais de Serviços.

## Goals / Non-Goals

**Goals:**
- Implementar o padrão Strategy para processamento de pagamentos.
- Expandir o model `Order` para registrar compras de cursos (B2C) e planos (B2B).
- Criar tabela `SystemSettings` para salvar os tokens das APIs criptografados.
- Criar rotas para checkout B2C/B2B com opções de PIX e Cartão de Crédito.
- Implementar webhook do PagBank para atualizar o status e liberar o acesso.

**Non-Goals:**
- Não implementaremos um "carrinho de compras" (multi-produtos) para o B2C; a compra é feita curso por curso.
- A integração *real* via código com sistemas de NFS-e (eNotas, FocusNFe) não será feita agora, apenas deixaremos o acionador (`event`/callback) pronto.

## Decisions

- **Model Order Único:** Usaremos a mesma tabela `Order` referenciando ou `companyId/planId` (B2B) ou `userId/courseId` (B2C). O campo `couponId` será opcional. Isso simplifica a extração de relatórios financeiros e a lógica de webhook.
- **Armazenamento de Tokens:** O Token configurado pelo Admin será salvo no banco usando AES-256 (criptografia simétrica), baseada em uma variável de ambiente `ENCRYPTION_KEY`.
- **Arquitetura Strategy:** Teremos uma interface `IPaymentProvider` com métodos `processPix`, `processCreditCard` e `handleWebhook`. O provedor ativo será resolvido através da consulta a `SystemSettings`.

## Risks / Trade-offs
- **Risco:** Perda da `ENCRYPTION_KEY` torna os tokens salvos inúteis.
  *Mitigação:* As chaves devem estar persistidas nos secrets do ambiente (Vercel/AWS/Heroku).
- **Risco:** Processamento duplicado de Webhooks (ex: PagBank mandando o mesmo aviso 2 vezes).
  *Mitigação:* Garantir que a lógica de liberação de curso/plano seja idempotente, verificando se o status do `Order` já está como `paid` antes de gerar a matrícula/voucher.
