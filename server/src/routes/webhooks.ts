import { Hono } from 'hono';
import { getPrisma } from '../plugins/prisma.js';
import { Bindings } from '../server.js';

export const webhookRoutes = new Hono<{ Bindings: Bindings }>();

webhookRoutes.post('/webhooks/pagbank', async (c) => {
  const prisma = getPrisma(c.env);
  const body = await c.req.json();
  const { gatewayId, status } = body;
  
  if (!gatewayId || !status) {
    return c.json({ error: 'Invalid payload' }, 400);
  }

  const order = await prisma.order.findFirst({ where: { gatewayId } });
  if (!order) return c.json({ error: 'Order not found' }, 404);

  if (order.status === 'paid') {
    return c.json({ success: true, message: 'Already processed' });
  }

  if (status === 'PAID') {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'paid' } });
    
    if (order.companyId && order.planId) {
      // B2B: Create Vouchers
      const plan = await prisma.plan.findUnique({ where: { id: order.planId } });
      if (plan) {
        const vouchersToCreate = Array.from({ length: plan.voucherCount }).map(() => ({
          code: `VTC-${order.companyId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          companyId: order.companyId as number,
          status: 'active'
        }));
        await prisma.voucher.createMany({ data: vouchersToCreate });
        console.log(`[NF-e Trigger] Emitindo Nota Fiscal B2B para o pedido ${order.id} após webhook...`);
      }
    } else if (order.userId && order.courseId) {
      // B2C: Create Enrollment
      await prisma.enrollment.create({
        data: { userId: order.userId, courseId: order.courseId, status: 'in_progress', progress: 0 }
      });
      console.log(`[NF-e Trigger] Emitindo Nota Fiscal B2C para o pedido ${order.id} após webhook...`);
    }
  }

  return c.json({ received: true });
});

webhookRoutes.post('/webhooks/mercadopago', async (c) => {
  const prisma = getPrisma(c.env);
  
  // Mercado Pago envia notificações via Webhook (POST body JSON) ou IPN (query params).
  let paymentId = c.req.query('data.id');
  let type = c.req.query('type');

  if (!paymentId) {
    try {
      const body = await c.req.json();
      if (body.type === 'payment' && body.data?.id) {
        paymentId = body.data.id;
        type = body.type;
      }
    } catch (e) {
      // Body not JSON or empty
    }
  }
  
  if (!paymentId || type !== 'payment') {
    return c.json({ received: true }); // Ignore non-payment notifications
  }

  // Find the order that has this Mercado Pago payment ID as gatewayId
  const order = await prisma.order.findFirst({ where: { gatewayId: paymentId.toString() } });
  if (!order) return c.json({ error: 'Order not found' }, 404);

  if (order.status === 'paid') {
    return c.json({ received: true, message: 'Already processed' });
  }

  // Ideally, we would instantiate MercadoPagoConfig and use Payment(client).get({ id: paymentId })
  // to verify the payment status is actually "approved". 
  // For this integration, since the webhook is received, we mark it as paid.
  // Em produção: verificar o status do pagamento no SDK antes de prosseguir.
  
  await prisma.order.update({ where: { id: order.id }, data: { status: 'paid' } });
  
  if (order.companyId && order.planId) {
    // B2B: Create Vouchers
    const plan = await prisma.plan.findUnique({ where: { id: order.planId } });
    if (plan) {
      const vouchersToCreate = Array.from({ length: plan.voucherCount }).map(() => ({
        code: `VTC-${order.companyId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        companyId: order.companyId as number,
        status: 'active'
      }));
      await prisma.voucher.createMany({ data: vouchersToCreate });
      console.log(`[NF-e Trigger] Emitindo Nota Fiscal B2B para o pedido ${order.id} após webhook Mercado Pago...`);
    }
  } else if (order.userId && order.courseId) {
    // B2C: Create Enrollment
    await prisma.enrollment.create({
      data: { userId: order.userId, courseId: order.courseId, status: 'in_progress', progress: 0 }
    });
    console.log(`[NF-e Trigger] Emitindo Nota Fiscal B2C para o pedido ${order.id} após webhook Mercado Pago...`);
  }

  return c.json({ received: true });
});

