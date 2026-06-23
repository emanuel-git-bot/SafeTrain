## 1. Banco de Dados e Configurações

- [x] 1.1 Criar a model `SystemSettings` no `schema.prisma` com os campos `activeGateway` e `gatewayToken`.
- [x] 1.2 Atualizar o model `Order` no `schema.prisma`, adicionando `userId`, `courseId` (para suportar B2C), `paymentMethod`, `gatewayId`, `paymentUrl` e tornando o `couponId` opcional.
- [x] 1.3 Rodar as migrations do Prisma (`npx prisma db push` ou `migrate dev`) para aplicar as alterações.

## 2. Backend: Padrão Strategy e Integração

- [x] 2.1 Criar classe/interface base `PaymentProvider` em `server/src/services/payments/provider.ts`.
- [x] 2.2 Implementar o `PagBankProvider` (ou Mock preparado para a API real) em `server/src/services/payments/pagbank.ts` com métodos de PIX e Cartão.
- [x] 2.3 Criar utilitário de criptografia em `server/src/utils/crypto.ts` usando a `ENCRYPTION_KEY` do `.env` para encriptar e desencriptar o Token guardado no DB.

## 3. Backend: Rotas e Webhooks

- [x] 3.1 Criar/Modificar as rotas de checkout (ex: `server/src/routes/checkout.ts`) para processar compras B2B (planos) e B2C (cursos), chamando o Provider correto.
- [x] 3.2 Criar rota `POST /webhooks/pagbank` em `server/src/routes/webhooks.ts` para receber atualizações de pagamento assíncronas (ex: PIX pago).
- [x] 3.3 Na rota de webhook, se o pagamento foi concluído, atualizar a `Order` para `paid`, realizar a entrega (criar `Enrollment` ou liberar `Vouchers`), e disparar um evento (ex: `console.log`) de "Emitir NFS-e".

## 4. Frontend: Admin Settings

- [x] 4.1 Criar tela de Configurações no Painel Admin (ex: `src/app/pages/admin/AdminSettings.tsx`).
- [x] 4.2 Adicionar formulário para escolher o Gateway (select) e informar o API Token (input tipo password) para salvar no backend.

## 5. Frontend: Checkouts

- [x] 5.1 Atualizar o checkout B2B (`PlanCheckout` / simulador) para exibir as opções "Pagar com PIX" ou "Cartão de Crédito" e processar a chamada real em vez de sucesso automático.
- [x] 5.2 Se a escolha for PIX (tanto B2B quanto B2C), exibir na UI o QR Code gerado e a chave copia-e-cola retornada pelo backend.
- [x] 5.3 Modificar o botão "Matricular-se" na vitrine de cursos (B2C) para levar a uma tela ou modal de Checkout caso o curso seja pago.
