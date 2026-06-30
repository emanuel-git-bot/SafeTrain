## Why

A integração via Nubank e PagBank apresentou desafios com liberação de IP e mTLS no ambiente serverless (Cloudflare Workers). O usuário solicitou a migração para o Mercado Pago, pois oferece um fluxo de integração mais simples e direto, permitindo cobrar via PIX facilmente através do seu SDK oficial (ou chamadas HTTP) usando apenas um Access Token.

## What Changes

- Implementação do provider `MercadoPagoProvider` em Node.js utilizando as chaves configuradas.
- Remoção ou desuso do `NubankProvider`.
- Ajustes na tela de configurações (`AdminSettings`) para receber e salvar o Access Token do Mercado Pago (substituindo os campos complexos de JSON do Nubank).
- Atualização dos webhooks (`/webhooks/mercadopago`) para interpretar e validar as notificações do Mercado Pago e atualizar os pedidos no banco (liberando cursos/vouchers).
- Ajuste no modal de checkout (`EnrollModal`) para utilizar os retornos do Mercado Pago (URL do QR Code e copia-e-cola).

## Capabilities

### New Capabilities
- `mercadopago-payments`: Integração principal com o Mercado Pago para geração de PIX e processamento do webhook.

### Modified Capabilities
- Nenhuma modificação no nível de regras de negócio gerais, apenas a substituição da engine de pagamento subjacente (mantendo a abstração `IPaymentProvider`).

## Impact

- `server/src/services/payments/mercadopago.ts` (novo)
- `server/src/routes/ecommerce.ts`, `server/src/routes/payments.ts` (usarão o novo provider)
- `server/src/routes/webhooks.ts` (novo webhook `mercadopago`)
- Frontend: `src/app/pages/admin/AdminSettings.tsx` e `src/app/components/modals/EnrollModal.tsx`
