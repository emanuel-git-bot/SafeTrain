## ADDED Requirements

### Requirement: Prisma D1 Adapter Integration
The system SHALL connect to the database using `@prisma/adapter-d1` connected to a Cloudflare D1 binding.

#### Scenario: Database Query
- **WHEN** the backend makes a query using Prisma Client
- **THEN** the query is sent through the D1 adapter using the Worker's environment binding (`env.DB`).

### Requirement: Serverless SQLite Constraints
The application SHALL NOT attempt to write or read from a local file-based `dev.db` in production.

#### Scenario: Migration Execution
- **WHEN** migrations are executed
- **THEN** they must be applied via `wrangler d1 execute` command.
