## ADDED Requirements

### Requirement: Public Certificate Verification
The system SHALL provide a public page allowing anyone to verify a certificate's authenticity using its unique code.

#### Scenario: Valid certificate verification
- **WHEN** a user enters a valid certificate code on the `/validar` page
- **THEN** the system displays the certificate details (Student Name, Course, Workload, Completion Date) confirming its validity

#### Scenario: Invalid certificate verification
- **WHEN** a user enters an invalid or non-existent certificate code
- **THEN** the system displays an error indicating the certificate is not found or invalid
