## 1. Backend Payment Provider

- [x] 1.1 Create `server/src/services/payments/nubank.ts` implementing a `NubankProvider` class.
- [x] 1.2 Implement the Pix generation logic (API authentication and charge creation) within `NubankProvider`.
- [x] 1.3 Update `server/src/routes/ecommerce.ts` and `server/src/routes/payments.ts` to instantiate and use `NubankProvider` instead of `PagBankProvider`.

## 2. Webhook Handling

- [x] 2.1 Update `server/src/routes/webhooks.ts` to add a new `/webhooks/nubank` endpoint.
- [x] 2.2 Implement webhook signature validation and payload parsing for Nubank callbacks.
- [x] 2.3 Ensure the webhook correctly updates the order status to `paid` and creates the course enrollment.

## 3. Configuration & UI Adjustments

- [x] 3.1 Update `server/src/routes/admin.ts` (`/admin/settings`) to accept Nubank credentials (clientId, clientSecret, certificate).
- [x] 3.2 Update `src/app/pages/admin/AdminSettings.tsx` to display inputs for Nubank configuration instead of PagBank.
- [x] 3.3 Update `src/app/components/modals/EnrollModal.tsx` to handle the Nubank Pix payload properly and hide the Credit Card option temporarily.
