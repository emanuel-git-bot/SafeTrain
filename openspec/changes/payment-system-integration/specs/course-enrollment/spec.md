## MODIFIED Requirements

### Requirement: Enrollment Creation
The system SHALL require successful payment via the unified Order checkout before allowing users to enroll in a paid published course. Free courses bypass the payment phase.

#### Scenario: Successful enrollment in a paid course
- **WHEN** user requests to enroll in a paid course and completes the checkout (Order status becomes `paid`)
- **THEN** system creates an Enrollment record with status "in_progress" and progress 0
- **AND** system returns the new enrollment details

#### Scenario: Successful enrollment in a free course
- **WHEN** user requests to enroll in a course with price 0
- **THEN** system bypasses payment, creates an Enrollment record with status "in_progress" and progress 0
