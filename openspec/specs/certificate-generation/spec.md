## ADDED Requirements

### Requirement: Generate PDF Certificate
The system SHALL generate a downloadable PDF certificate by merging the student's enrollment data with the mathematical layout of the assigned Certificate Template.

#### Scenario: Student downloads certificate
- **WHEN** a user requests their certificate download for a completed course
- **THEN** the system generates a PDF placing the student name, course title, and other dynamic data precisely at the coordinates defined in the template JSON
- **AND** returns the PDF file for download
