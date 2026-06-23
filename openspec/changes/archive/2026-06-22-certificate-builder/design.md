## Context

Currently, the platform generates a unique certificate record (with hash/code) when a student finishes a course, but does not provide an actual visual Certificate document. To provide professional value, we need a visual Certificate Builder where admins can define the layout, and an engine that generates PDFs based on these layouts for students.

## Goals / Non-Goals

**Goals:**
- Provide a WYSIWYG drag-and-drop editor for admins to position text and QR codes over a background image.
- Generate high-quality PDF certificates for students matching the admin's layout exactly.
- Provide a public `/validar` route where anyone can check the authenticity of a certificate using its code.

**Non-Goals:**
- Cryptographic digital signatures (e.g., ICP-Brasil).
- Complex vector editing (we rely on uploaded raster images for backgrounds).

## Decisions

### 1. Coordinate System & Canvas
**Decision:** The editor will use a fixed absolute coordinate system based on A4 Landscape dimensions in PostScript points (842 x 595 pt). 
**Rationale:** By standardizing the coordinate space in the React editor, we avoid complex math when translating the layout to the PDF generation library. The React canvas will use CSS `transform: scale(...)` to fit into smaller screens while keeping the internal drag coordinates strictly bounded to `[0, 842]` and `[0, 595]`.

### 2. PDF Generation Engine
**Decision:** Use `pdf-lib` on the Node.js Fastify Backend.
**Rationale:** We considered using `html2canvas` + `jspdf` on the frontend, but it produces image-based PDFs (heavy file size, text isn't selectable, blurry on retina displays). `pdf-lib` allows us to programmatically execute `drawText` and `drawImage` directly into a PDF document using the JSON coordinates saved by the admin. This produces perfectly crisp, vector-text PDFs.

### 3. Editor Library
**Decision:** Use `react-rnd` (React Resize and Drag) for the admin editor.
**Rationale:** It provides seamless bounding-box constraints, dragging, and resizing out-of-the-box, saving development time compared to writing custom mouse event handlers.

## Risks / Trade-offs

- **Risk:** Font matching between Web and PDF. Custom web fonts might look different from the standard fonts embedded in the PDF.
  - **Mitigation:** We will restrict the editor to standard PDF fonts (Helvetica, Times Roman, Courier) for the MVP, or embed specific TTF fonts using `pdf-lib` if custom fonts are required.
- **Risk:** QR Code generation.
  - **Mitigation:** We will use a library like `qrcode` on the backend to generate the QR code as a PNG buffer, which is then embedded via `drawImage` in `pdf-lib`.
