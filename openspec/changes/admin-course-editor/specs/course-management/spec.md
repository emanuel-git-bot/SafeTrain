## MODIFIED Requirements

### Requirement: Course CRUD uses real database
The system SHALL load, create, update, and delete courses from the real database via the admin API, replacing all mock data in the admin panel.

#### Scenario: Admin views course list
- **WHEN** an admin navigates to the Courses section
- **THEN** the system fetches courses from GET /courses and displays them with real data (title, module count, price, published status)

#### Scenario: Admin creates a new course
- **WHEN** an admin clicks "Novo Curso"
- **THEN** the system calls POST /admin/courses with default values and immediately navigates to the course editor with the new courseId

#### Scenario: Admin updates course metadata
- **WHEN** an admin edits the title, area, price, description, or workload in the course editor and clicks save
- **THEN** the system calls PUT /admin/courses/:id and updates the course in the database

#### Scenario: Admin publishes a course
- **WHEN** an admin clicks "Publicar" in the course editor
- **THEN** the system calls PUT /admin/courses/:id with { published: true } and the course becomes visible in the public catalog

#### Scenario: Admin deletes a course
- **WHEN** an admin clicks the delete icon on a course row and confirms
- **THEN** the system calls DELETE /admin/courses/:id and removes the course from the list
