## ADDED Requirements

### Requirement: Compra de lote de acessos por empresa
O sistema SHALL permitir que uma empresa adquira um lote de N acessos (vagas) via pagamento único. O sistema SHALL gerar automaticamente N vouchers de uso único associados à empresa após confirmação do pagamento.

#### Scenario: Empresa compra lote de 50 vagas
- **WHEN** o gestor de RH completa a compra de 50 vagas
- **THEN** o sistema SHALL criar 50 registros de voucher com status `available` vinculados à `Company` da empresa e ao(s) curso(s) adquirido(s)

#### Scenario: Empresa tenta usar mais vagas do que comprou
- **WHEN** o RH tenta distribuir um voucher mas o lote já está esgotado (`available = 0`)
- **THEN** o sistema SHALL exibir mensagem "Sem vagas disponíveis" e bloquear a distribuição

### Requirement: Distribuição de vouchers pelo RH
O sistema SHALL permitir que o gestor de RH distribua vouchers para funcionários via e-mail diretamente pelo painel B2B. O sistema SHALL enviar um e-mail com o código de voucher para cada endereço informado.

#### Scenario: RH distribui vouchers por e-mail
- **WHEN** o RH informa uma lista de e-mails e clica em "Enviar"
- **THEN** o sistema SHALL enviar um e-mail para cada endereço com o código de voucher exclusivo e instruções de cadastro

#### Scenario: RH tenta distribuir mais vouchers do que vagas disponíveis
- **WHEN** o número de e-mails informados excede as vagas disponíveis
- **THEN** o sistema SHALL exibir erro indicando a quantidade disponível e bloquear o envio

### Requirement: Vinculação automática de funcionário à empresa via voucher
O sistema SHALL vincular automaticamente o aluno à empresa responsável pelo voucher no momento da ativação. O gestor de RH SHALL ter acesso ao progresso e certificados do funcionário vinculado a partir desse momento.

#### Scenario: Funcionário ativa voucher corporativo no cadastro
- **WHEN** um funcionário insere um voucher corporativo durante o cadastro
- **THEN** o sistema SHALL criar o registro `CompanyStudent` vinculando o usuário à empresa e liberar visibilidade do progresso no painel B2B

#### Scenario: Funcionário tenta ativar voucher de outra empresa
- **WHEN** o funcionário já está vinculado à empresa A e tenta usar um voucher da empresa B
- **THEN** o sistema SHALL exibir mensagem informando o conflito e não criar o vínculo

### Requirement: Painel B2B — visão geral de conformidade
O sistema SHALL fornecer ao gestor de RH um dashboard com métricas de conformidade da equipe: número de colaboradores certificados, em andamento e pendentes, vagas disponíveis e gráfico de conclusões por mês.

#### Scenario: RH visualiza dashboard de conformidade
- **WHEN** o gestor de RH acessa a aba "Visão Geral" do painel B2B
- **THEN** o sistema SHALL exibir os KPIs de conformidade da equipe vinculada à empresa, atualizados em tempo real

### Requirement: Painel B2B — gestão de colaboradores
O sistema SHALL permitir que o gestor de RH visualize todos os colaboradores vinculados, com informações de progresso, status (certificado/em andamento/pendente) e última atividade. O sistema SHALL permitir busca por nome ou cargo.

#### Scenario: RH busca colaborador por nome
- **WHEN** o RH digita o nome de um colaborador no campo de busca
- **THEN** o sistema SHALL filtrar a tabela exibindo apenas o(s) colaborador(es) cujo nome corresponda

#### Scenario: RH baixa certificado de um colaborador
- **WHEN** o RH clica em "Cert." na linha de um colaborador certificado
- **THEN** o sistema SHALL gerar e baixar o PDF do certificado do colaborador para aquele curso

### Requirement: Painel B2B — busca e vinculação de funcionário existente
O sistema SHALL permitir que o RH pesquise um funcionário que já tenha conta na plataforma por e-mail ou nome e o vincule manualmente à empresa, sem necessidade de voucher.

#### Scenario: RH encontra e vincula funcionário existente
- **WHEN** o RH pesquisa por e-mail de um usuário cadastrado e clica em "Vincular"
- **THEN** o sistema SHALL criar o registro `CompanyStudent` e o funcionário aparecerá na tabela de colaboradores

#### Scenario: RH pesquisa por e-mail inexistente
- **WHEN** o RH pesquisa por um e-mail que não possui conta cadastrada
- **THEN** o sistema SHALL exibir mensagem "Nenhum funcionário encontrado" e sugerir o envio de voucher por e-mail
