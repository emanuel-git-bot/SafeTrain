## ADDED Requirements

### Requirement: Template PDF Preview
The system SHALL allow administrators to generate a real-time PDF preview of the certificate template while editing it, without persisting preview data or enrolling users.

#### Scenario: Admin clicks preview
- **WHEN** the admin clicks the "Preview" button in the Certificate Builder
- **THEN** the system generates a PDF file using the current canvas elements and mock student data, and displays it to the admin
