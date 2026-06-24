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

webhookRoutes.post('/webhooks/nubank', async (c) => {
  const prisma = getPrisma(c.env);
  const body = await c.req.json();
  
  // BACEN standard for Pix webhooks
  const pixEvents = body?.pix;
  
  if (!Array.isArray(pixEvents)) {
    return c.json({ error: 'Invalid payload' }, 400);
  }

  for (const event of pixEvents) {
    const txid = event.txid; // gatewayId
    if (!txid) continue;

    const order = await prisma.order.findFirst({ where: { gatewayId: txid } });
    if (!order) continue;

    if (order.status === 'paid') {
      continue;
    }

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
        console.log(`[NF-e Trigger] Emitindo Nota Fiscal B2B para o pedido ${order.id} após webhook Nubank...`);
      }
    } else if (order.userId && order.courseId) {
      // B2C: Create Enrollment
      await prisma.enrollment.create({
        data: { userId: order.userId, courseId: order.courseId, status: 'in_progress', progress: 0 }
      });
      console.log(`[NF-e Trigger] Emitindo Nota Fiscal B2C para o pedido ${order.id} após webhook Nubank...`);
    }
  }

  return c.json({ received: true });
});
