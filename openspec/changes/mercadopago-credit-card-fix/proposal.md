## Why

Atualmente o backend falha na compilação (`npm run build`) devido à falta das tipagens do Cloudflare Workers (`D1Database`, `R2Bucket`) no `tsconfig.json`, o que faz com que o ambiente continue rodando código antigo (Nubank). Além disso, a opção de Cartão de Crédito foi escondida do usuário durante a migração anterior e não foi implementada no provedor atual do Mercado Pago, forçando os usuários a usar apenas PIX.

## What Changes

- Inclusão de `"types": ["@cloudflare/workers-types"]` no `server/tsconfig.json` para corrigir a compilação.
- Descomentar a opção de Cartão de Crédito (`credit_card`) no modal de checkout do frontend (`EnrollModal.tsx`).
- Atualizar a classe `MercadoPagoProvider` no backend para aceitar pagamentos com `method === 'credit_card'` usando a API do Mercado Pago e passando o `payment_method_id` e tokenização corretos (se aplicável, ou via API transparente).

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
- `mercadopago-payments`: O provedor agora deve aceitar requisições de pagamento via cartão de crédito além do PIX.

## Impact

- `server/tsconfig.json`
- `server/src/services/payments/mercadopago.ts`
- `src/app/components/modals/EnrollModal.tsx`
