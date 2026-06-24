INSERT INTO "User" ("id", "name", "email", "password", "role", "permissions", "createdAt", "updatedAt") VALUES (1, 'SafeTrain Admin', 'admin@safetrain.com', '$2b$10$xKBURvJ7MGqdhdLF9ly9IehMqPExGdU2Ddkct8u9Bua/RjkyqCPju', 'admin', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Area" ("id", "name", "description", "createdAt", "updatedAt") VALUES (1, 'Tecnologia da Informação', 'Cursos de TI', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO "Area" ("id", "name", "description", "createdAt", "updatedAt") VALUES (2, 'Saúde e Segurança', 'Cursos de SST', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Company" ("id", "name", "cnpj", "areaId", "createdAt", "updatedAt") VALUES (1, 'TechCorp', '12345678000199', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Course" ("id", "title", "description", "areaId", "level", "duration", "price", "validityMonths", "published", "createdAt", "updatedAt") VALUES (1, 'NR-10 Básico', 'Segurança em Instalações e Serviços em Eletricidade', 2, 'Básico', '40h', 150.00, 24, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO "Course" ("id", "title", "description", "areaId", "level", "duration", "price", "validityMonths", "published", "createdAt", "updatedAt") VALUES (2, 'NR-35', 'Trabalho em Altura', 2, 'Básico', '8h', 80.00, 24, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Plan" ("id", "name", "price", "voucherCount", "createdAt", "updatedAt") VALUES (1, 'Plano Básico B2B', 500.00, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO "Plan" ("id", "name", "price", "voucherCount", "createdAt", "updatedAt") VALUES (2, 'Plano Premium B2B', 1200.00, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "SystemSettings" ("id", "activeGateway", "updatedAt") VALUES (1, 'pagbank', CURRENT_TIMESTAMP);
