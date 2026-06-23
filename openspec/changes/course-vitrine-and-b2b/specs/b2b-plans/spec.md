## ADDED Requirements

### Requirement: CRUD de Planos para Empresas
O sistema MUST permitir que o Administrador crie, edite e delete Planos (nome, preço, quantidade de vouchers) na tabela `Plan`.

#### Scenario: Admin acessa a tela de Planos
- **WHEN** o admin acessa o painel de Admin
- **THEN** ele vê a aba "Planos B2B"
- **THEN** ele pode criar um novo plano especificando os atributos.

### Requirement: Empresas podem comprar Planos
O sistema MUST listar os planos disponíveis para empresas e permitir a simulação de compra, gerando os vouchers de acesso associados à empresa.

#### Scenario: Empresa compra 50 vouchers
- **WHEN** o usuário Empresa acessa seu dashboard B2B
- **THEN** ele navega até a aba "Comprar Vouchers"
- **THEN** ele seleciona o Plano e finaliza a compra, gerando 50 códigos na tabela `Voucher` para seu CNPJ.
