## Context

O sistema atual SafeTrain possui o banco de dados baseado em SQLite via Prisma, e um frontend focado nas visualizações primárias. Após o estabelecimento de roles e um admin master, identificou-se a necessidade de:
1. Um perfil autogerenciável pelos usuários (com dados adicionais como CPF e telefone).
2. Otimização de formulários B2B (validação de CNPJ automática consumindo Brasil API).
3. Uma base de ecommerce para aquisição de Vouchers pelas empresas e uso de Cupons promocionais no checkout B2B.

## Goals / Non-Goals

**Goals:**
- Implementar as views e API para que o usuário gerencie seu perfil (My Profile) com troca de senha dependente do conhecimento da senha antiga.
- Integrar os formulários B2B com a Brasil API para busca automática de CNPJ e formatar visualmente Telefone e CNPJ com máscaras.
- Corrigir a tela do "B2B Dashboard" ("Para Empresas") para que ela liste/filtre corretamente os funcionários.
- Adicionar entidades de `Coupon`, `Plan` e a lógica de simulação de Checkout para o plano B2B.

**Non-Goals:**
- Integração real com gateway de pagamento (Stripe, Pagar.me etc). A transação no B2B será concluída sem cobrança real neste momento ("checkout simulado"), apenas ativando os Vouchers de forma administrativa.
- Perfis customizados extremamente complexos (por enquanto apenas campos adicionais).

## Decisions

- **Busca CNPJ:** Utilizaremos a `https://brasilapi.com.br/api/cnpj/v1/{cnpj}`. Faremos um fetch direto do lado do cliente (`useEffect` com debounce ou botão "Buscar" ou um `onBlur` no campo) para preencher os campos.
- **Campos adicionais (User):** A tabela `User` será estendida. O campo `avatarUrl` salvará inicialmente um texto simples, `cpf` e `phone` serão strings limpas (sem pontuação no DB, mascaradas no frontend).
- **Ecommerce B2B:** Serão criados modelos no Prisma: `Plan` (para pacotes de vouchers, ex: 10, 50, personalizado), `Coupon` (códigos de desconto), e `Order` para registrar as compras de vouchers pelas empresas.
- **Frontend Masks:** Utilizaremos Regex simples nativa ou uma pequena lib/função local de máscara na camada de controle do formulário para o CPF/CNPJ/Telefone.

## Risks / Trade-offs

- [Integração Externa Instável] → A `Brasil API` ou qualquer outra API pública pode ficar fora do ar. Mitigação: Em caso de falha silenciosa (`catch`), o sistema permite o preenchimento manual do Nome da Empresa e não trava a submissão.
- [Complexidade da tabela Order vs Transaction] → Manteremos a tabela Order simples, referenciando CompanyId, PlanId e CouponId, contendo o valor pago total em Reais.
