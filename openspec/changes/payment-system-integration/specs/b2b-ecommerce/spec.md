## MODIFIED Requirements

### Requirement: B2B Plans & Checkout Simulator
The system SHALL present predefined plans and a custom plan simulator for companies to purchase vouchers, and process real payments via PIX or Credit Card at checkout.

#### Scenario: Selecting a predefined plan and checking out
- **WHEN** a company clicks to purchase a 50-voucher plan and provides payment details (Card/PIX)
- **THEN** the system generates an Order, processes the payment with the active gateway, and grants the vouchers only upon payment success (`paid` status).
