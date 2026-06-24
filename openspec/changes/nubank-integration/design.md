## Context

Our application previously integrated with PagBank (PagSeguro) for payment processing. However, Cloudflare Workers' dynamic IPs were blocked by PagBank's strict IP whitelisting rules. To ensure our users can purchase courses and B2B plans reliably, we are migrating to Nubank's API. Nubank provides a modern REST API that supports Pix generation and webhooks without the rigid IP restrictions that blocked our deployment.

## Goals / Non-Goals

**Goals:**
- Implement a `NubankProvider` class conforming to the expected interface used by `ecommerce.ts` and `payments.ts`.
- Generate Pix charges and return the QR Code image and "Copia e Cola" string.
- Handle Nubank webhooks to confirm payments asynchronously.
- Update the admin settings schema/API to allow storing Nubank credentials safely.

**Non-Goals:**
- Implement credit card processing via Nubank. (Nubank's primary API for business is heavily Pix-focused, and we will restrict the checkout to Pix for now to get the MVP working and avoid PCI compliance overhead).
- Complete the NF-e integration in this specific change (it will remain as a logging placeholder as it currently is).

## Decisions

### 1. Payment Provider Architecture
**Decision**: Create `server/src/services/payments/nubank.ts` implementing the same basic `processPayment` signature as the old `PagBankProvider`, but restricted to `method === 'pix'`.
**Rationale**: Keeps the route handlers (`payments.ts`, `ecommerce.ts`) relatively clean. We will just swap `getProvider()` to return a `NubankProvider` instance.

### 2. Admin Credentials Storage
**Decision**: Nubank's API often requires a Client ID, Client Secret, and sometimes an mTLS certificate. We will update `SystemSettings` to store a generic JSON payload for the `gatewayToken` or add new fields. To minimize schema migrations if possible, we can serialize the required Nubank config as a JSON string and encrypt it using the existing `encrypt()` function before saving to `gatewayToken`.
**Rationale**: Avoids complicated Prisma schema migrations while exploring the Nubank integration.

### 3. Webhook Handling
**Decision**: Update `server/src/routes/webhooks.ts` to listen at `/webhooks/nubank` instead of `/webhooks/pagbank`.
**Rationale**: Clearer routing. The webhook will look up the `orderId` (which Nubank usually allows passing as `txid` or via metadata) and mark it as `paid`.

## Risks / Trade-offs

- **Risk**: Nubank's API usually requires mTLS (Mutual TLS) using a `.p12` or `.pem` certificate. Cloudflare Workers supports mTLS via custom fetch dispatchers or attaching certificates, but it can be tricky to configure dynamically.
  - **Mitigation**: We will need to investigate if Cloudflare Workers allows dynamic mTLS certs in `fetch()` calls. If not, we might need to use Cloudflare mTLS bindings or a proxy, or check if Nubank offers a simpler bearer-token OAuth2 flow for basic Pix generation without mTLS. 
- **Risk**: Dropping Credit Card support temporarily.
  - **Mitigation**: The UI currently has a dropdown for Pix/Credit Card. We will disable or hide the Credit Card option until a provider that supports it without IP whitelisting (like Stripe or Pagar.me) is integrated, or if Nubank provides a solution.
