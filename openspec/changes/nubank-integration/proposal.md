## Why

The current payment integration relies on PagBank (PagSeguro), which has introduced IP-based whitelisting restrictions that block our Cloudflare Workers environment. This results in "whitelist access required" errors and prevents the platform from processing any payments. Migrating to Nubank's API solves this infrastructure limitation and provides a robust, developer-friendly payment gateway.

## What Changes

- Replace the `PagBankProvider` with a new `NubankProvider` implementation.
- Update the payment webhook endpoint to handle Nubank's payload format.
- Adjust the checkout payload and frontend response to handle Nubank's specific QR Code and Pix copy-paste data structure.
- **BREAKING**: PagBank configuration settings (like gateway tokens) will be replaced by Nubank API credentials (client ID, client secret, and certificate).

## Capabilities

### New Capabilities
- `nubank-payments`: Integration with Nubank's API to generate Pix payments, handle webhooks, and manage order statuses.

### Modified Capabilities
<!-- No modified capabilities at the spec level, since we are replacing the payment provider entirely. -->

## Impact

- **Affected Code**: `server/src/services/payments/`, `server/src/routes/payments.ts`, `server/src/routes/ecommerce.ts`, `server/src/routes/webhooks.ts`, and frontend checkout components.
- **System**: Payments processing layer and Admin Settings.
- **Dependencies**: May require adding standard TLS certificate handling for Nubank's mTLS requirement.
