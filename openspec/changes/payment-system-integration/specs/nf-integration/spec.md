## ADDED Requirements

### Requirement: Disparo para emissão de Nota Fiscal (NFS-e)
O sistema DEVE acionar a emissão da Nota Fiscal de Serviço eletrônica (NFS-e) de forma automatizada logo após a confirmação e compensação do pagamento.

#### Scenario: Integração pós-pagamento (Webhook)
- **WHEN** uma `Order` recebe o status de `paid` via Webhook ou processamento direto de cartão
- **THEN** o sistema adiciona um evento para emitir a NF na integração de notas (ex: eNotas/Focus NFe) e prepara o campo `invoiceUrl` no pedido.
