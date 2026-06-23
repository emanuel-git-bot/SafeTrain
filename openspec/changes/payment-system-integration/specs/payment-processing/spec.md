## ADDED Requirements

### Requirement: Processamento Agnóstico de Pagamentos
O sistema DEVE processar pagamentos através de um padrão Strategy que permita trocar o provedor ativo (PagBank ou Neon) com base nas configurações salvas de forma criptografada no banco.

#### Scenario: Pagamento PIX gerado
- **WHEN** um usuário ou empresa solicita pagar por PIX no checkout
- **THEN** o sistema envia a requisição para o provedor ativo e retorna o QRCode e o código copia-e-cola

#### Scenario: Pagamento via Cartão de Crédito
- **WHEN** um usuário ou empresa envia os dados do cartão de crédito no checkout
- **THEN** o sistema processa junto ao provedor ativo e retorna a aprovação imediata ou a justificativa de recusa

#### Scenario: Recepção de Webhook PIX
- **WHEN** o PagBank ou Neon envia um POST assíncrono avisando que um PIX foi pago
- **THEN** o sistema atualiza o status da `Order` correspondente para `paid` e libera o serviço (matrícula ou vouchers)
