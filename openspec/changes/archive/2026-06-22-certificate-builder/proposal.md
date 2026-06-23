## Why

Certificates are essential for the credibility of courses. While the system currently tracks completion, administrators need a visual way to design professional certificates with customizable backgrounds and dynamic student data. This allows different courses to have unique, high-quality certificates that can be verified publicly for authenticity without requiring developer intervention for layout changes.

## What Changes

- Add a visual drag-and-drop Certificate Template Builder in the admin dashboard.
- Allow admins to upload background images for certificates.
- Allow placing dynamic variables (Student Name, Course Name, Workload, Date, Verification Code, QR Code) on the canvas with customizable fonts, sizes, colors, and alignments.
- Store template definitions mathematically in the database (JSON element coordinates).
- Add a field to the Course model to link it to a specific Certificate Template.
- Add a public verification endpoint (`/validar`) to verify certificate authenticity.
- Implement server-side or client-side PDF generation that translates the visual JSON layout into an actual downloadable PDF for students upon course completion.

## Capabilities

### New Capabilities
- `certificate-builder`: Visual editor for admins to create and manage certificate templates with drag-and-drop elements.
- `certificate-generation`: Engine that merges user enrollment data with the mathematical template JSON to generate a downloadable PDF.
- `certificate-verification`: Public-facing page and endpoint to verify the authenticity of a certificate using its unique code/hash.

### Modified Capabilities
- `admin-course-management`: Modified to allow selecting a Certificate Template when creating or editing a course.
- `classroom-experience`: Modified to provide the actual "Download Certificate" action when a course is completed.

## Impact

- **Database:** New `CertificateTemplate` model and changes to `Course`.
- **Admin UI:** New "Certificates" tab with a complex drag-and-drop canvas editor.
- **Frontend / Backend:** PDF generation library (e.g., pdf-lib on backend or html2canvas/jspdf on frontend) will be introduced.
- **Public Routes:** New public verification page.
