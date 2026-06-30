## ADDED Requirements

### Requirement: Generate PIX charge via Mercado Pago
The system SHALL generate a PIX charge using the Mercado Pago API when a user selects PIX at checkout.

#### Scenario: Successful PIX generation
- **WHEN** the user finalizes the checkout selecting PIX as the payment method
- **THEN** the system generates a charge in Mercado Pago and returns the QR Code image URL and copy-paste code to the user

### Requirement: Process Mercado Pago Webhooks
The system SHALL receive HTTP notifications from Mercado Pago when a payment is processed.

#### Scenario: Payment approved
- **WHEN** Mercado Pago sends a webhook indicating a payment is approved
- **THEN** the system updates the corresponding Order status to "paid" and fulfills the purchase (enrolls user or generates B2B vouchers)

#### Scenario: Payment ignored if not approved
- **WHEN** Mercado Pago sends a webhook for a status other than "approved"
- **THEN** the system logs the event but does not fulfill the purchase
