## MODIFIED Requirements

### Requirement: Visual Certificate Template Editor
The system SHALL provide a drag-and-drop editor for administrators to define certificate templates with background images and customizable dynamic text elements. The editor MUST allow configuration of text color (HEX), font family (Standard PDF Fonts), and font weight (bold/normal) for each element.

#### Scenario: Admin creates a template with formatting
- **WHEN** admin uploads a background image, drags dynamic elements onto the canvas, and adjusts their color, font-family, and bold properties
- **THEN** system saves the template data including element coordinates, specific color codes, and typography settings to the database
