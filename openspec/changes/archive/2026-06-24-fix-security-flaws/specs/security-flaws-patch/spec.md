## ADDED Requirements

### Requirement: Voucher validation must query the database
The system SHALL validate all submitted vouchers, including those starting with the `VTC-` prefix, against the database `voucher` table. Any hardcoded bypass logic that grants immediate enrollment without checking the voucher's validity MUST be removed.

#### Scenario: Valid voucher activation
- **WHEN** a user submits a valid `VTC-` voucher that exists in the database with an `active` status
- **THEN** the system marks the voucher as `used`, updates the user's `companyStudent` association if necessary, creates an enrollment, and returns a success response.

#### Scenario: Invalid voucher activation
- **WHEN** a user submits a `VTC-` code that does not exist in the database or has a status other than `active`
- **THEN** the system rejects the request with a 400 Bad Request error stating "Invalid or already used voucher", and no enrollment is created.

### Requirement: Admin routes must enforce admin role
The system SHALL ensure that all routes under `/admin/*` (with exceptions only for clearly defined public or self-service logic if any, though none are expected for admin endpoints) explicitly enforce the `admin` role authorization. The generic `authenticate` middleware is insufficient for admin operations; the `requirePermission` or an equivalent role-checking middleware MUST be applied to prevent Privilege Escalation.

#### Scenario: Unauthorized access attempt by student
- **WHEN** an authenticated user with a `student` role attempts to access `PUT /admin/settings` or `POST /admin/courses`
- **THEN** the system denies the request with a 403 Forbidden error stating "Acesso negado: Requer privilégios de administrador."

#### Scenario: Authorized access attempt by admin
- **WHEN** an authenticated user with the `admin` role (and appropriate permissions if required) attempts to access `PUT /admin/settings`
- **THEN** the system allows the request and successfully updates the settings.
