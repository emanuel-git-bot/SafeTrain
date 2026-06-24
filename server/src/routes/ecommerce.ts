import { Hono } from 'hono';
import { getPrisma } from '../plugins/prisma.js';
import { PagBankProvider } from '../services/payments/pagbank.js';
import { decrypt } from '../utils/crypto.js';
import { authenticate, UserPayload } from '../middlewares/auth.js';
import { Bindings } from '../server.js';
import { PrismaClient } from '@prisma/client';

async function getProvider(prisma: PrismaClient) {
  const settings = await prisma.systemSettings.findFirst();
  const token = settings?.gatewayToken ? decrypt(settings.gatewayToken) : 'mock-token';
  return new PagBankProvider(token);
}

export const ecommerceRoutes = new Hono<{ Bindings: Bindings, Variables: { user: UserPayload } }>();

ecommerceRoutes.get('/plans', async (c) => {
  const prisma = getPrisma(c.env);
  const plans = await prisma.plan.findMany({
    orderBy: { price: 'asc' }
  });
  return c.json(plans);
});

ecommerceRoutes.post('/orders/simulate', authenticate, async (c) => {
  const prisma = getPrisma(c.env);
  const body = await c.req.json();
  const { planId, couponCode } = body;
  
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return c.json({ error: 'Plano não encontrado' }, 404);

  let discount = 0;
  let coupon = null;

  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon) {
      if (coupon.validUntil && new Date() > coupon.validUntil) {
        return c.json({ error: 'Cupom expirado' }, 400);
      }
      discount = (plan.price * coupon.discount) / 100;
    } else {
      return c.json({ error: 'Cupom inválido' }, 400);
    }
  }

  const finalPrice = Math.max(0, plan.price - discount);

  return c.json({
    planPrice: plan.price,
    discount,
    finalPrice,
    coupon: coupon ? { id: coupon.id, code: coupon.code, discount: coupon.discount } : null
  });
});

ecommerceRoutes.post('/orders/checkout', authenticate, async (c) => {
  const prisma = getPrisma(c.env);
  const jwtUser = c.get('user');
  const body = await c.req.json();
  const { planId, couponId, paymentMethod, cardDetails } = body;

  if (!paymentMethod) {
    return c.json({ error: 'Método de pagamento é obrigatório' }, 400);
  }

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) return c.json({ error: 'Plano não encontrado' }, 404);

  const companyStudent = await prisma.companyStudent.findUnique({
    where: { userId: jwtUser.id },
    include: { company: true }
  });

  if (!companyStudent || jwtUser.role !== 'company') {
    return c.json({ error: 'Apenas empresas podem comprar vouchers.' }, 403);
  }

  let discount = 0;
  let coupon = null;

  if (couponId) {
    coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (coupon) {
      if (coupon.validUntil && new Date() > coupon.validUntil) {
        return c.json({ error: 'Cupom expirado' }, 400);
      }
      discount = (plan.price * coupon.discount) / 100;
    }
  }

  const finalPrice = Math.max(0, plan.price - discount);

  const order = await prisma.order.create({
    data: {
      companyId: companyStudent.companyId,
      planId: plan.id,
      couponId: coupon?.id || null,
      finalPrice,
      status: 'pending',
      paymentMethod
    }
  });

  const provider = await getProvider(prisma as any);
  const fullUser = await prisma.user.findUnique({ where: { id: jwtUser.id } });

  const paymentResponse = await provider.processPayment({
    orderId: order.id,
    amount: finalPrice,
    method: paymentMethod,
    customer: {
      name: companyStudent.company.name,
      email: fullUser?.email || 'email@example.com',
      document: companyStudent.company.cnpj || undefined
    },
    cardDetails
  });

  if (!paymentResponse.success) {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'failed' } });
    return c.json({ error: paymentResponse.errorMessage || 'Falha no pagamento' }, 400);
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: paymentResponse.status,
      gatewayId: paymentResponse.gatewayId,
      paymentUrl: paymentResponse.paymentUrl
    }
  });

  if (paymentResponse.status === 'paid') {
    const vouchersToCreate = Array.from({ length: plan.voucherCount }).map(() => ({
      code: `VTC-${companyStudent.companyId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      companyId: companyStudent.companyId,
      status: 'active'
    }));
    await prisma.voucher.createMany({ data: vouchersToCreate });
    console.log(`[NF-e Trigger] Emitindo Nota Fiscal B2B para o pedido ${order.id}...`);
  }

  return c.json({ 
    success: true, 
    orderId: order.id, 
    paymentStatus: paymentResponse.status,
    paymentUrl: paymentResponse.paymentUrl,
    qrCodeUrl: paymentResponse.qrCodeUrl
  });
});
