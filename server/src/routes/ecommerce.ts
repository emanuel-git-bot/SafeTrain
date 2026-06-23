import { FastifyInstance } from 'fastify';
import { prisma } from '../plugins/prisma.js';
import { PagBankProvider } from '../services/payments/pagbank.js';
import { decrypt } from '../utils/crypto.js';

async function getProvider() {
  const settings = await prisma.systemSettings.findFirst();
  const token = settings?.gatewayToken ? decrypt(settings.gatewayToken) : 'mock-token';
  return new PagBankProvider(token);
}

export async function ecommerceRoutes(server: FastifyInstance) {
  server.get('/plans', async (request, reply) => {
    const plans = await prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });
    return plans;
  });

  server.post('/orders/simulate', {
    preValidation: [server.authenticate]
  }, async (request, reply) => {
    const { planId, couponCode } = request.body as any;
    
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return reply.status(404).send({ error: 'Plano não encontrado' });

    let discount = 0;
    let coupon = null;

    if (couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon) {
        if (coupon.validUntil && new Date() > coupon.validUntil) {
          return reply.status(400).send({ error: 'Cupom expirado' });
        }
        discount = (plan.price * coupon.discount) / 100;
      } else {
        return reply.status(400).send({ error: 'Cupom inválido' });
      }
    }

    const finalPrice = Math.max(0, plan.price - discount);

    return {
      planPrice: plan.price,
      discount,
      finalPrice,
      coupon: coupon ? { id: coupon.id, code: coupon.code, discount: coupon.discount } : null
    };
  });

  server.post('/orders/checkout', {
    preValidation: [server.authenticate]
  }, async (request, reply) => {
    const jwtUser = request.user as any;
    const { planId, couponId, paymentMethod, cardDetails } = request.body as any;

    if (!paymentMethod) {
      return reply.status(400).send({ error: 'Método de pagamento é obrigatório' });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return reply.status(404).send({ error: 'Plano não encontrado' });

    // Validate that user is a company manager
    const companyStudent = await prisma.companyStudent.findUnique({
      where: { userId: jwtUser.id },
      include: { company: true }
    });

    if (!companyStudent || jwtUser.role !== 'company') {
      return reply.status(403).send({ error: 'Apenas empresas podem comprar vouchers.' });
    }

    let discount = 0;
    let coupon = null;

    if (couponId) {
      coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
      if (coupon) {
        if (coupon.validUntil && new Date() > coupon.validUntil) {
          return reply.status(400).send({ error: 'Cupom expirado' });
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

    const provider = await getProvider();
    const paymentResponse = await provider.processPayment({
      orderId: order.id,
      amount: finalPrice,
      method: paymentMethod,
      customer: {
        name: companyStudent.company.name,
        email: jwtUser.email,
        document: companyStudent.company.cnpj || undefined
      },
      cardDetails
    });

    if (!paymentResponse.success) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'failed' } });
      return reply.status(400).send({ error: paymentResponse.errorMessage || 'Falha no pagamento' });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: paymentResponse.status,
        gatewayId: paymentResponse.gatewayId,
        paymentUrl: paymentResponse.paymentUrl
      }
    });

    // If paid immediately (like credit card mock)
    if (paymentResponse.status === 'paid') {
      const vouchersToCreate = Array.from({ length: plan.voucherCount }).map(() => ({
        code: `VTC-${companyStudent.companyId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        companyId: companyStudent.companyId,
        status: 'active'
      }));
      await prisma.voucher.createMany({ data: vouchersToCreate });
      console.log(`[NF-e Trigger] Emitindo Nota Fiscal B2B para o pedido ${order.id}...`);
    }

    return { 
      success: true, 
      orderId: order.id, 
      paymentStatus: paymentResponse.status,
      paymentUrl: paymentResponse.paymentUrl,
      qrCodeUrl: paymentResponse.qrCodeUrl
    };
  });
}
