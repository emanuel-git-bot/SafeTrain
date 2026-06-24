## 1. Remove Voucher Bypass

- [x] 1.1 Remove the `VTC-` check block in `server/src/routes/vouchers.ts` that grants unverified course access.
- [x] 1.2 Verify that legitimate vouchers still work by ensuring the logic falls back to checking the `voucher` table in the database.

## 2. Enforce Admin Authorization

- [x] 2.1 Create a new middleware `requireAdmin` in `server/src/middlewares/auth.ts` (or reuse `requirePermission`) to strictly check if `user.role === 'admin'`.
- [x] 2.2 Apply this admin authorization middleware to all routes prefixed with `/admin/*` in `server/src/routes/admin.ts`.
- [x] 2.3 Verify that a non-admin user (e.g., student role) receives a 403 Forbidden error when attempting to call endpoints in `admin.ts`.
