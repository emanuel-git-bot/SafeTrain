# Classroom Experience

## Purpose
Track the screen time on video modules and manage the overall progression and completion of the course enrollment.

## Requirements

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

### Requirement: Certificate Download
The system SHALL allow users to download their generated certificate after course completion.

#### Scenario: Download action
- **WHEN** user clicks to download their certificate
- **THEN** system invokes the certificate-generation engine to generate the PDF and downloads it to the user's device
