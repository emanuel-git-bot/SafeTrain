import { FastifyInstance } from 'fastify';
import { prisma } from '../plugins/prisma.js';

export async function webhookRoutes(server: FastifyInstance) {
  server.post('/webhooks/pagbank', async (request, reply) => {
    const { gatewayId, status } = request.body as any;
    
    if (!gatewayId || !status) {
      return reply.status(400).send({ error: 'Invalid payload' });
    }

    const order = await prisma.order.findFirst({ where: { gatewayId } });
    if (!order) return reply.status(404).send({ error: 'Order not found' });

    if (order.status === 'paid') {
      return { success: true, message: 'Already processed' };
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

    return { received: true };
  });
}
