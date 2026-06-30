## 1. Setup

- [x] 1.1 Run `npm install mercadopago` inside the `server/` directory to add the official SDK.
- [x] 1.2 Remove the file `server/src/services/payments/nubank.ts` as we are abandoning Nubank integration.

## 2. Core Provider Implementation

- [x] 2.1 Create `server/src/services/payments/mercadopago.ts` and implement the `MercadoPagoProvider` class using the `mercadopago` SDK (API v2) for PIX generation.
- [x] 2.2 Update `server/src/routes/ecommerce.ts` to import and instantiate `MercadoPagoProvider` instead of `NubankProvider`.
- [x] 2.3 Update `server/src/routes/payments.ts` to import and instantiate `MercadoPagoProvider` instead of `NubankProvider`.

## 3. Webhook & UI Updates

- [x] 3.1 Update `server/src/routes/webhooks.ts`: Replace the `/webhooks/nubank` endpoint with `/webhooks/mercadopago`. It must read the `data.id` from the query or body, fetch the payment status via Mercado Pago SDK, and update the Order.
- [x] 3.2 Update `src/app/pages/admin/AdminSettings.tsx` to set "mercadopago" as default and adjust the instructions/placeholder to request a simple Access Token instead of a JSON.
- [x] 3.3 Update `src/app/components/modals/EnrollModal.tsx` to ensure the PIX payload fields (qrCodeUrl and paymentUrl/Copia-e-Cola) match the Mercado Pago Provider response format.
