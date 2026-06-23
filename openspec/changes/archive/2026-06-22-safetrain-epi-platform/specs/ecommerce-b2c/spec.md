## ADDED Requirements

### Requirement: Vitrine de cursos com filtro por área
O sistema SHALL exibir uma listagem de cursos disponíveis filtráveis por área de atuação (Construção Civil, Indústria, Logística, Saúde, Elétrica, Química). A vitrine SHALL mostrar título, duração, nível (Obrigatório/Recomendado/Básico), avaliação, número de alunos e preço de cada curso.

#### Scenario: Aluno filtra cursos por área
- **WHEN** o aluno seleciona uma área de atuação na vitrine
- **THEN** a listagem SHALL exibir apenas os cursos pertencentes à área selecionada

#### Scenario: Aluno busca curso por texto
- **WHEN** o aluno digita um termo na barra de busca da vitrine
- **THEN** a listagem SHALL filtrar em tempo real, exibindo apenas cursos cujo título contenha o termo

#### Scenario: Aluno ordena cursos
- **WHEN** o aluno seleciona um critério de ordenação (mais populares, menor preço, maior preço)
- **THEN** a listagem SHALL reordenar os cards de acordo com o critério escolhido

### Requirement: Onboarding com seleção de área de atuação
O sistema SHALL coletar a área de atuação do aluno no momento do cadastro. O sistema SHALL usar essa informação para exibir cursos recomendados na aba "Recomendados" do painel do aluno.

#### Scenario: Aluno se cadastra com área de atuação
- **WHEN** o aluno completa o cadastro selecionando uma área de atuação
- **THEN** o sistema SHALL salvar a área no perfil do usuário e redirecionar para o painel com cursos recomendados daquela área

#### Scenario: Aluno sem área definida acessa recomendados
- **WHEN** um aluno sem área de atuação cadastrada acessa a aba "Recomendados"
- **THEN** o sistema SHALL exibir os cursos mais populares da plataforma

### Requirement: Checkout individual de curso (B2C)
O sistema SHALL permitir que um aluno autenticado adquira um curso individual via cartão de crédito. O sistema SHALL processar o pagamento via gateway (Stripe) e liberar o acesso ao curso imediatamente após confirmação do webhook `payment_intent.succeeded`.

#### Scenario: Aluno compra curso com cartão
- **WHEN** o aluno preenche os dados do cartão e confirma o pagamento
- **THEN** o sistema SHALL criar um `Enrollment` para o aluno no curso e redirecionar para a sala de aula

#### Scenario: Pagamento recusado
- **WHEN** o gateway recusa o cartão
- **THEN** o sistema SHALL exibir mensagem de erro com o motivo e manter o aluno na tela de checkout

#### Scenario: Aluno tenta acessar curso sem ter comprado
- **WHEN** um aluno não matriculado tenta acessar a sala de aula de um curso
- **THEN** o sistema SHALL redirecionar para a tela de checkout do curso

### Requirement: Ativação de acesso via voucher (B2C/B2B)
O sistema SHALL permitir que um aluno use um código de voucher para obter acesso a um curso sem pagamento direto. O voucher SHALL ser de uso único: ao ser ativado, SHALL ser marcado como `used` e associado ao aluno.

#### Scenario: Aluno usa voucher válido
- **WHEN** o aluno insere um código de voucher válido e disponível
- **THEN** o sistema SHALL criar o `Enrollment`, marcar o voucher como `used` e redirecionar para a sala de aula

#### Scenario: Aluno usa voucher inválido ou já utilizado
- **WHEN** o aluno insere um código de voucher inexistente ou com status `used`
- **THEN** o sistema SHALL exibir mensagem "Código inválido ou já utilizado" e não criar matrícula

### Requirement: Vitrine de empresas parceiras
O sistema SHALL exibir uma seção na landing page com os logotipos/nomes das empresas parceiras para agregar credibilidade.

#### Scenario: Usuário visualiza parceiros na landing page
- **WHEN** qualquer visitante acessa a landing page
- **THEN** o sistema SHALL exibir a seção de empresas parceiras com os nomes/logos configurados pelo Admin
