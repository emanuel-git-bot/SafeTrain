## ADDED Requirements

### Requirement: Module Screen Time Tracking
The system SHALL track the time a user spends on a video module to ensure minimum required screen time compliance.

#### Scenario: Ping time
- **WHEN** user watches a video and the frontend sends a ping
- **THEN** system increments the `timeSpent` in `ScreenTimeLog` for that module and enrollment
- **AND** if `timeSpent` >= `minScreenTime`, marks the module log as completed

### Requirement: Course Completion
The system SHALL allow users to mark a course as completed once all requirements are met.

#### Scenario: Completion request
- **WHEN** user requests to complete the course via `/complete` endpoint
- **THEN** system verifies all modules are completed or passed
- **AND** changes enrollment status to "completed" and progress to 100%
- **AND** generates a Certificate record for the user
