## ADDED Requirements

### Requirement: Gerenciamento de acesso aos Planos B2B
O sistema DEVE permitir que administradores concedam ou revoguem o acesso à seção de Planos B2B para outros administradores através do modal de permissões.

#### Scenario: Editando acessos de um admin
- **WHEN** o usuário (admin) edita as permissões de acesso de outro administrador
- **THEN** a opção "Planos B2B" aparece na lista de seções marcáveis e, ao ser selecionada, o alvo passa a ter visibilidade dessa página.
