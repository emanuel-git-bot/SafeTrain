## 1. Configuração de Build
- [x] 1.1 Adicionar `"types": ["@cloudflare/workers-types"]` em `compilerOptions` no arquivo `server/tsconfig.json`.

## 2. Frontend
- [x] 2.1 Em `src/app/components/modals/EnrollModal.tsx`, descomentar a `option` com o value `credit_card`.
- [x] 2.2 Adicionar states no `EnrollModal.tsx` para os detalhes do cartão (`cardNumber`, `cardExpiry`, `cardCvv`) e passá-los dentro da variável `cardDetails` na chamada POST `/payments/checkout`.

## 3. Backend Provider
- [x] 3.1 Atualizar `server/src/services/payments/mercadopago.ts` para processar `request.method === 'credit_card'`. Simular a aprovação (Mock) ou retornar status `approved` se o método for cartão, visto que no ambiente de testes não vamos implementar o JS do Mercado Pago no frontend para PCI compliance total. Retornar success `true` e status `paid` ou `pending` (que engatilha o checkout).
- [x] 3.2 Compilar o backend manualmente rodando `npm run build` na pasta `server` e reiniciar (ou verificar se não há erros TypeScript).
