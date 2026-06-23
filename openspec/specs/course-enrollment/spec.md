# Course Enrollment

## Purpose
Manage user enrollment in courses and track their high-level progress.

## Requirements

### Requirement: Enrollment Creation
The system SHALL allow users to create an enrollment for a published course.

#### Scenario: Successful enrollment
- **WHEN** user requests to enroll in a course
- **THEN** system creates an Enrollment record with status "in_progress" and progress 0
- **AND** system returns the new enrollment details

### Requirement: User Enrollments List
The system SHALL allow users to list their active and completed enrollments.

#### Scenario: List enrollments
- **WHEN** user requests their enrollments
- **THEN** system returns all enrollments associated with the user, including course details and progress
