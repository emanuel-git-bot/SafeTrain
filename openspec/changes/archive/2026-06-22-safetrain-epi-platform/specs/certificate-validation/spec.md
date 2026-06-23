## ADDED Requirements

### Requirement: Geração de certificado digital com UUID e hash
O sistema SHALL gerar automaticamente um certificado digital quando o aluno concluir todos os módulos de um curso com aprovação. O certificado SHALL conter: nome do aluno, nome do curso, carga horária, nota obtida, data de emissão, data de validade, nome e cargo do emissor, um UUID único e um hash de validação (SHA-256 de `studentId + courseId + completedAt`).

#### Scenario: Aluno conclui curso com aprovação
- **WHEN** o aluno é aprovado no último módulo avaliativo do curso
- **THEN** o sistema SHALL gerar o registro de certificado no banco com UUID, hash, data de emissão e validade, e torná-lo acessível no painel do aluno

#### Scenario: Tentativa de geração duplicada
- **WHEN** o sistema tenta gerar um certificado para um `(studentId, courseId)` que já possui certificado
- **THEN** o sistema SHALL retornar o certificado existente sem criar duplicata

### Requirement: Visualização do certificado digital
O sistema SHALL exibir o certificado digital em uma página dedicada, com layout imprimível, contendo todos os dados do certificado e um QR Code que aponta para a URL pública de validação `/validar/{uuid}`.

#### Scenario: Aluno visualiza seu certificado
- **WHEN** o aluno acessa a página de certificado de um curso concluído
- **THEN** o sistema SHALL renderizar o certificado com todos os dados, incluindo QR Code com a URL de validação

#### Scenario: Aluno baixa certificado em PDF
- **WHEN** o aluno clica em "Baixar PDF" na página do certificado
- **THEN** o sistema SHALL gerar um arquivo PDF do certificado com fidelidade de layout e iniciará o download

### Requirement: Validação pública de autenticidade de certificado
O sistema SHALL fornecer uma página pública de verificação acessível sem autenticação em `/validar/{uuid}`. Qualquer pessoa SHALL poder inserir o UUID ou escanear o QR Code para verificar se um certificado é autêntico e está válido.

#### Scenario: Verificação de certificado válido
- **WHEN** um visitante insere um UUID válido e clica em "Verificar"
- **THEN** o sistema SHALL exibir os dados do certificado (nome do aluno, curso, emissão, validade) com indicação visual "Certificado Válido"

#### Scenario: Verificação de certificado não encontrado
- **WHEN** um visitante insere um UUID que não existe no banco
- **THEN** o sistema SHALL exibir mensagem "Não encontrado" sem revelar informações sobre outros certificados

#### Scenario: Verificação via QR Code
- **WHEN** um fiscal escaneia o QR Code impresso no certificado
- **THEN** o navegador SHALL abrir a URL `/validar/{uuid}` e exibir automaticamente o resultado da verificação

### Requirement: Identificador público de certificado no formato legível
O sistema SHALL gerar IDs de certificado no formato legível `{PREFIXO}-{ANO}-{CURSO_CODE}-{RANDOM5}` (ex: `EPI-2024-NR35-48291`) exibido no certificado e usável como alternativa ao UUID na busca de validação.

#### Scenario: Validação por ID legível
- **WHEN** o visitante insere o ID legível (ex: `EPI-2024-NR35-48291`) no campo de verificação
- **THEN** o sistema SHALL resolver o ID para o certificado correspondente e exibir os dados de autenticidade
