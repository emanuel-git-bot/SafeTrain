## MODIFIED Requirements

### Requirement: Generate PIX charge via Mercado Pago
The system SHALL generate a PIX charge using the Mercado Pago API when a user selects PIX at checkout.

#### Scenario: Successful PIX generation
- **WHEN** the user finalizes the checkout selecting PIX as the payment method
- **THEN** the system generates a charge in Mercado Pago and returns the QR Code image URL and copy-paste code to the user

## ADDED Requirements

### Requirement: Process Credit Card Payment via Mercado Pago
The system SHALL process credit card payments via Mercado Pago when the user provides card details during checkout.

#### Scenario: Successful Credit Card Payment (Simulated)
- **WHEN** the user finalizes checkout selecting Credit Card and provides details
- **THEN** the system processes the payment (or simulates it) via Mercado Pago provider and updates the order status to paid or pending.
