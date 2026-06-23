# Admin Certificates Spec

## Purpose
TBD

## Requirements

### Requirement: Listagem de certificados emitidos
O sistema DEVE listar na visão do Admin todos os certificados emitidos para os alunos, consultando a API real.

#### Scenario: Acesso à aba de certificados
- **WHEN** o administrador clica na seção de Certificados
- **THEN** o sistema exibe a lista real contendo o nome do aluno, curso, código UUID do certificado e a data de emissão.
