## Context

A plataforma utiliza um padrão de "Payment Providers" que implementam a interface `IPaymentProvider`. Tentamos usar Nubank/PagBank, porém esbarramos em complexidades de rede (Cloudflare Workers IPs) e mTLS. A migração para Mercado Pago simplifica isso, pois a API v2 deles exige apenas um `Access Token` via Bearer Header para gerar cobranças PIX, e o SDK oficial (v2) utiliza `fetch` nativamente, sendo totalmente compatível com Cloudflare Workers.

## Goals / Non-Goals

**Goals:**
- Implementar a geração de PIX dinâmicos usando Mercado Pago (SDK Oficial Node.js).
- Processar webhooks (Notificações IPN ou Webhooks padrão) para identificar o pagamento.
- Facilitar a configuração do administrador (apenas 1 Access Token necessário).

**Non-Goals:**
- Implementar checkout transparente com cartão de crédito via Mercado Pago neste momento (o foco inicial é substituir o PIX).

## Decisions

- **Uso do SDK Oficial:** Vamos instalar `mercadopago` via npm (`npm install mercadopago`). A versão 2.x suporta ambientes modernos (usando `globalThis.fetch`).
- **Padrão de Provider:** Criaremos `MercadoPagoProvider` em `server/src/services/payments/mercadopago.ts`.
- **Webhook Endpoint:** Criaremos `/webhooks/mercadopago`. O Mercado Pago envia notificações com o formato `?data.id=12345&type=payment`. Vamos receber esse ID, buscar os dados reais do pagamento com o SDK e, caso o status seja `approved`, atualizar o pedido no banco.
- **Configuração:** Em `AdminSettings.tsx`, vamos ajustar o campo para aceitar o Access Token diretamente, descartando a complexidade do JSON que havia no Nubank.

## Risks / Trade-offs

- **Risco:** Incompatibilidade pontual do SDK do Mercado Pago com Cloudflare Workers (ex: módulos do Node.js).
- **Mitigação:** O SDK v2 usa `fetch`. Se houver qualquer falha de resolução de dependências, podemos facilmente reverter para chamadas REST puras via `fetch` apontando para `https://api.mercadopago.com/v1/payments`. O PIX é um POST simples.
