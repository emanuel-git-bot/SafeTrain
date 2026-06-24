## ADDED Requirements

### Requirement: Generate Pix payment via Nubank
The system SHALL use the Nubank API to generate Pix billing charges (cobranças) for new orders instead of PagBank.

#### Scenario: Successful generation of Pix charge
- **WHEN** a user initiates a checkout via Pix
- **THEN** the system generates an order in "pending" state, communicates with the Nubank API to create a Pix charge, and returns the QR Code image and the "Copia e Cola" string to the frontend.

#### Scenario: Nubank API failure
- **WHEN** the Nubank API is unavailable or returns an error during checkout
- **THEN** the system returns a 400 or 500 error, marks the internal order as "failed", and presents a clear error message to the user.

### Requirement: Handle Nubank Webhooks
The system SHALL expose an endpoint to receive webhook callbacks from Nubank confirming Pix payments.

#### Scenario: Payment confirmation received
- **WHEN** Nubank sends a webhook payload indicating a Pix charge has been paid
- **THEN** the system verifies the payload, updates the corresponding order status to "paid", creates the user enrollment, and potentially triggers the NF-e generation.

### Requirement: Dynamic Admin Gateway Settings
The system SHALL allow admins to store Nubank-specific credentials (e.g., Client ID, Client Secret, Certificate string) securely in the `SystemSettings` table.

#### Scenario: Admin updates Nubank credentials
- **WHEN** an admin provides Nubank credentials in the settings dashboard
- **THEN** the system encrypts the credentials before saving them to the database.
