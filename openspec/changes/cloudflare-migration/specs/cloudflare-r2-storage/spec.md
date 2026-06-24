## ADDED Requirements

### Requirement: Cloudflare R2 Uploads
The system SHALL upload files (like course assets and user profile images) to a Cloudflare R2 bucket instead of the local filesystem.

#### Scenario: File Upload
- **WHEN** a multipart form containing a file is submitted
- **THEN** the system must pipe the file stream directly to `env.BUCKET.put()`.

### Requirement: R2 Asset Serving
The system SHALL serve uploaded files via a public R2 domain or signed URLs.

#### Scenario: File Retrieval
- **WHEN** the frontend requests a previously uploaded asset
- **THEN** the asset is served from the Cloudflare R2 edge network.
