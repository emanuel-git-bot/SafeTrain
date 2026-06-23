## Why

A plataforma precisa de melhorias fundamentais de usabilidade para usuários B2B e B2C, além de abrir caminho para a monetização. O perfil do usuário precisa ser editável para garantir autonomia (reduzindo a carga de suporte). Na frente B2B, a experiência de cadastro precisa ser robusta (validação e busca automática de CNPJ), e o dashboard B2B precisa permitir a gestão eficiente de funcionários. Além disso, a capacidade de empresas comprarem e utilizarem vouchers (com cupons de desconto) é o próximo passo lógico para o modelo de negócios SaaS da plataforma.

## What Changes

- Criação da central "Meu Perfil" onde o usuário pode alterar nome, foto, CPF (opcional), telefone (opcional) e trocar a senha de forma segura (fornecendo a atual).
- Adição de máscaras e formatação automática para inputs de CNPJ e Telefone no Frontend.
- Integração de busca automática de dados da empresa na Brasil API a partir do CNPJ no cadastro corporativo.
- Correção da busca de funcionários na view do B2B Dashboard que atualmente não está conectada/funcionando adequadamente com o backend.
- Remoção do botão de "Login como Admin (demo)" da interface pública.
- Construção de infraestrutura para Planos B2B e venda de Vouchers (Vitrine e Simulador).
- Criação de entidade e gestão de Cupons de Desconto (Coupons) geridos pelo painel Administrativo Master e aplicados no Checkout B2B.

## Capabilities

### New Capabilities
- `user-profile`: Gerenciamento das informações de usuário (Meu Perfil) incluindo avatar, cpf, phone e alteração segura de senha.
- `cnpj-validation`: Ferramental para validar e buscar dados de empresa através do CNPJ em APIs públicas.
- `b2b-ecommerce`: Processo de seleção de planos, simulação de custos para empresas adquirirem vouchers e inserção de cupons.

### Modified Capabilities
- N/A

## Impact

- **Schema Prisma:** Expansão do modelo `User` (cpf, phone, avatarUrl). Criação de novos modelos para monetização como `Coupon`, `Plan` e relacionamento de compra/faturamento no B2B (ex: `Transaction` ou estendido no voucher).
- **Backend:** Novas rotas para edição de perfil (`PUT /users/me`, `POST /users/me/password`), rotas de cupons (`/admin/coupons`), e simulação de checkout.
- **Frontend:** Formulários com UX enriquecida (máscaras, debounce na busca de API externa), novas views para perfil, checkout corporativo e gestão de cupons no painel do administrador master.
