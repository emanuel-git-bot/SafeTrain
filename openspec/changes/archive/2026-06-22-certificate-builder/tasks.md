## 1. Database Setup

- [x] 1.1 Create `CertificateTemplate` model in Prisma schema with `id`, `name`, `backgroundImageUrl`, `elements` (JSON), and timestamps.
- [x] 1.2 Add `certificateTemplateId` relation to the `Course` model.
- [x] 1.3 Run `npx prisma db push` or create a migration.

## 2. Backend Routes

- [x] 2.1 Create REST endpoints for managing templates (`GET`, `POST`, `PUT`, `DELETE` at `/admin/certificate-templates`).
- [x] 2.2 Create `/validar/:code` endpoint to publicly verify a certificate code.
- [x] 2.3 Create `/enrollments/:id/certificate` endpoint to generate and download the PDF.

## 3. Admin Certificate Builder UI

- [x] 3.1 Create the Certificate Templates list view at `/admin/certificates`.
- [x] 3.2 Implement the editor canvas using `react-rnd` bounded to standard A4 coordinates.
- [x] 3.3 Implement the element properties sidebar (Font, Size, Color, Alignment).
- [x] 3.4 Integrate the save functionality to send JSON to the `/admin/certificate-templates` endpoint.

## 4. Admin Course Management Integration

- [x] 4.1 Update `AdminCourseEditor.tsx` to include a dropdown/selection for Certificate Templates.
- [x] 4.2 Ensure `PUT /admin/courses/:id` accepts `certificateTemplateId`.

## 5. Public Verification Page

- [x] 5.1 Update the frontend `src/app/pages/CertificateValidator.tsx` mapping to `#/validate`.
- [x] 5.2 Fetch data from `GET /validar/:code` (unauthenticated).
- [x] 5.3 Display valid/invalid status, student name, document, course name, duration, and issue date.

## 6. PDF Generation Engine (Backend)

- [x] 6.1 Install `pdf-lib` and `qrcode` libraries in the backend.
- [x] 6.2 Write a utility function that receives a `CertificateTemplate` and student data, loads the background image, and draws texts/QRCodes using `pdf-lib`.
- [x] 6.3 Integrate the utility into the `/enrollments/:id/certificate` endpoint.

## 7. Classroom Integration

- [x] 7.1 Update `src/app/pages/ClassroomPage.tsx` (or the last module completed view) to show a "Gerar Certificado" button if the course is completed and has a certificate.
- [x] 7.2 On button click, open a new tab or trigger a download from `GET /enrollments/:id/certificate`. generation endpoint.
