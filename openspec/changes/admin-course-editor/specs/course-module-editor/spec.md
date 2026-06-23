## ADDED Requirements

### Requirement: Real-time Course Module Editor
The system SHALL allow admins to create, edit, and delete modules (video and quiz) within a course, persisting changes to the backend immediately upon saving each module.

#### Scenario: Admin adds a video module
- **WHEN** an admin clicks "+ Vídeo" in the course editor
- **THEN** a new video module is added to the module list and selected for editing

#### Scenario: Admin saves a video module
- **WHEN** an admin fills in the title, URL, and minimum screen time and clicks "Salvar módulo"
- **THEN** the system calls POST /admin/courses/:id/modules and the module is persisted

#### Scenario: Admin adds a quiz module
- **WHEN** an admin clicks "+ Quiz" in the course editor
- **THEN** a new quiz module is added and selected for editing

#### Scenario: Admin adds a question with multiple-choice options to a quiz
- **WHEN** the admin enters a question text, fills in 4 answer options, and selects the correct answer
- **THEN** the question is added to the quiz's question list

#### Scenario: Admin saves a quiz module
- **WHEN** an admin sets the cutoff score and clicks "Salvar módulo"
- **THEN** the system serializes questions to JSON and calls POST /admin/courses/:id/modules

#### Scenario: Admin edits an existing module
- **WHEN** an admin selects an existing module, modifies its content, and clicks "Salvar módulo"
- **THEN** the system calls PUT /admin/courses/:id/modules/:moduleId with the updated data

#### Scenario: Admin deletes a module
- **WHEN** an admin clicks the trash icon on a module
- **THEN** the system calls DELETE /admin/courses/:id/modules/:moduleId and removes the module from the list
