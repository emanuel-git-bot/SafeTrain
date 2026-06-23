# User Profile Spec

## Purpose
Defines requirements for user profile self-management, including editing personal data and secure password changes.

## Requirements

### Requirement: Edit Profile Details
The system SHALL allow users to view and update their own name, cpf, phone and avatarUrl.

#### Scenario: User updates their profile
- **WHEN** the user edits their CPF, phone and name on the My Profile screen and submits
- **THEN** the system updates their data in the database and returns success.

### Requirement: Secure Password Change
The system SHALL allow users to change their password by providing their current password.

#### Scenario: Successful password change
- **WHEN** the user provides the correct current password and a new valid password
- **THEN** the system updates the password and logs the user out or confirms success.

#### Scenario: Incorrect current password
- **WHEN** the user provides an incorrect current password
- **THEN** the system rejects the change with an authentication error.
