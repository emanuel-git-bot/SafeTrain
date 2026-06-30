## Context
A compilação via TypeScript (usando Cloudflare Workers) está falhando por falta de declaração de tipos globais (como `D1Database`). Com o build quebrado, o backend continua rodando código desatualizado, reportando um erro antigo do Nubank. Além disso, queremos reativar a opção de pagamento com cartão de crédito via Mercado Pago, que havia sido comentada na UI.

## Goals / Non-Goals
**Goals:**
- Consertar o build do servidor adicionando `@cloudflare/workers-types` ao `tsconfig.json`.
- Permitir ao usuário escolher "Cartão de Crédito" e inserir dados (`EnrollModal.tsx`).
- Mapear os dados de `cardDetails` enviados pelo frontend em uma requisição de pagamento via cartão transparente no `MercadoPagoProvider`.

**Non-Goals:**
- Não vamos implementar fluxo complexo de verificação 3DS ou PCI compliance avançado; utilizaremos os dados diretos para gerar o token, ou, para simplificar neste MVP, como é um mock educacional, poderíamos apenas "aceitar" a compra no gateway (ou simular a tokenização). Na verdade, para uma integração com Mercado Pago via SDK backend com cartão de crédito, precisamos apenas repassar os tokens. Para simplificar, aceitaremos os detalhes no backend, criaremos um `payment_method_id` e token, ou retornaremos um link para o checkout Pro.
*Nota de design*: Como coletar os dados raw do cartão no próprio frontend e enviá-los ao backend vai contra o PCI (se não usar o CardForm do MP), vamos implementar a opção de Cartão no modal, porém o Mercado Pago possui o atributo `paymentUrl` (checkout pro link) que pode ser retornado. Mas como estamos na API v2, se o método for `credit_card` e os dados não forem suficientes para API transparente, podemos simular o sucesso ou retornar um erro se falhar, ou usar um cartão de teste. Vamos assumir que processaremos via `payment.create` passando o número de teste.

## Decisions
- **`tsconfig.json`**: Adicionar `"types": ["@cloudflare/workers-types"]` em `compilerOptions`.
- **UI (`EnrollModal.tsx`)**: Descomentar a `option` de `credit_card`. Adicionar os states para número do cartão, validade, CVV e passá-los dentro de `cardDetails` para a rota `/payments/checkout`.
- **Backend (`MercadoPagoProvider.ts`)**: Se o `request.method` for `credit_card`:
  - Utilizaremos os dados informados (ou um mock) para aprovar diretamente no Sandbox do Mercado Pago.
  - Para fins educacionais do projeto (sandbox), enviaremos um token de cartão gerado pelo painel (ou simulado) ou usaremos `payment_method_id: 'master'` passando um `token` fictício/mockado ou usaremos apenas a lógica de simulação para aprovar na hora, já que a coleta de token no frontend precisa do script oficial `sdk-js` do MP. Como o foco do projeto é a plataforma em si, vamos retornar "sucesso" simulado no Cartão de Crédito se estivermos com as credenciais de teste (ou se for o número "1234 5678...").

## Risks / Trade-offs
- Processar dados diretos do cartão no backend não é PCI-Compliant. O correto é usar Mercado Pago.js no frontend para tokenizar e mandar apenas o `token` ao backend. Faremos uma solução simplificada (mock ou bypass) para permitir que o fluxo do usuário ande sem quebrar a segurança em produção (por exemplo, rejeitar em prod se os dados não forem token).
