## ADDED Requirements

### Requirement: Quiz Evaluation
The system SHALL evaluate a set of answers submitted by a user for a quiz module.

#### Scenario: Pass quiz
- **WHEN** user submits answers where the percentage of correct answers is >= `passingScore`
- **THEN** system returns the calculated score and pass status
- **AND** updates the module's `ScreenTimeLog` as completed

#### Scenario: Fail quiz
- **WHEN** user submits answers where the percentage of correct answers is < `passingScore`
- **THEN** system returns the calculated score and fail status
- **AND** does NOT mark the module as completed
