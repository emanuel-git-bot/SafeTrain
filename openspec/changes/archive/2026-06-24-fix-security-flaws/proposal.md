## Why

We discovered two severe security vulnerabilities in the backend API that could allow users to bypass payments or escalate their privileges to take full control of the platform. These flaws pose an immediate risk to the platform's revenue and data integrity and must be patched immediately.

## What Changes

- **Voucher Validation Fix**: Remove the insecure `VTC-` bypass in `vouchers.ts` that grants free course access to anyone who submits a code starting with that prefix.
- **Admin Authorization Enforcement**: Implement proper role-based access control (RBAC) across all sensitive endpoints in `admin.ts` using the `requirePermission` or a new `requireAdmin` middleware, ensuring that only users with the `admin` role can access or modify platform data.

## Capabilities

### New Capabilities
- `security-flaws-patch`: Patch critical vulnerabilities related to voucher bypass and missing admin authorization checks.

### Modified Capabilities
<!-- No modified capabilities at the spec level, just security fixes. -->

## Impact

- **Affected Code**: `server/src/routes/vouchers.ts`, `server/src/routes/admin.ts`.
- **System**: Backend API security.
- **Dependencies**: No external dependencies affected.
