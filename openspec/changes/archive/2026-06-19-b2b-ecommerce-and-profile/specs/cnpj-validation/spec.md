## ADDED Requirements

### Requirement: Frontend Auto-Formatting
The frontend forms SHALL auto-format CNPJ and Phone inputs dynamically as the user types.

#### Scenario: Formatting CNPJ
- **WHEN** the user types 14 digits in a CNPJ field
- **THEN** the field is formatted as XX.XXX.XXX/XXXX-XX.

### Requirement: Automatic CNPJ Lookup
The system SHALL fetch company data using the Brasil API when a valid CNPJ is provided.

#### Scenario: Valid CNPJ Lookup
- **WHEN** the user types a valid CNPJ (14 digits) in the B2B Registration form
- **THEN** the system fetches data from Brasil API and auto-fills the company name.

#### Scenario: Invalid CNPJ or API Down
- **WHEN** the Brasil API is unreachable or returns 404
- **THEN** the system allows the user to manually input the company name without blocking registration.
