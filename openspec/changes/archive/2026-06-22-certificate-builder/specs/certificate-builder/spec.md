## ADDED Requirements

### Requirement: Visual Certificate Template Editor
The system SHALL provide a drag-and-drop editor for administrators to define certificate templates with background images and customizable dynamic text elements.

#### Scenario: Admin creates a template
- **WHEN** admin uploads a background image and drags dynamic elements (e.g., Student Name, Course Name) onto the canvas
- **THEN** system saves the template data including element coordinates, fonts, and colors to the database

### Requirement: Manage Certificate Templates
The system SHALL allow administrators to list, edit, and delete existing certificate templates.

#### Scenario: List templates
- **WHEN** admin accesses the certificates panel
- **THEN** system displays a list of all saved certificate templates with their names and preview thumbnails
