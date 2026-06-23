import { FastifyInstance } from 'fastify';
import { prisma } from '../plugins/prisma.js';

export async function companyRoutes(server: FastifyInstance) {
  server.addHook('preValidation', server.authenticate);

  server.post('/companies', async (request, reply) => {
    const { name, cnpj } = request.body as any;
    const company = await prisma.company.create({ data: { name, cnpj } });
    return company;
  });

  server.get('/b2b/plans', async (request, reply) => {
    return prisma.plan.findMany({ orderBy: { price: 'asc' } });
  });

  server.post('/b2b/orders/simulate', async (request, reply) => {
    const { planId, couponCode } = request.body as any;
    const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });
    if (!plan) return reply.status(404).send({ error: 'Plano não encontrado' });
    
    // Simplification: No coupon logic for now, just return plan price
    return {
      planPrice: plan.price,
      discount: 0,
      finalPrice: plan.price,
      coupon: null
    };
  });

  server.post('/b2b/orders', async (request, reply) => {
    const user = request.user as any;
    const { planId } = request.body as any;

    if (!user.companyId) {
      return reply.status(403).send({ error: 'Acesso negado: Usuário não pertence a uma empresa.' });
    }

    const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });
    if (!plan) return reply.status(404).send({ error: 'Plano não encontrado' });

    const order = await prisma.order.create({
      data: {
        companyId: user.companyId,
        planId: plan.id,
        finalPrice: plan.price,
        status: 'completed'
      }
    });

    const vouchers = [];
    for (let i = 0; i < plan.voucherCount; i++) {
      vouchers.push({
        companyId: user.companyId,
        code: `VTC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      });
    }

    await prisma.voucher.createMany({ data: vouchers });

    return { success: true, orderId: order.id, vouchersGenerated: plan.voucherCount };
  });

  server.post('/companies/:id/purchase', async (request, reply) => {
    const { id } = request.params as any;
    const { quantity } = request.body as any;
    
    // Mocking Stripe purchase -> Generate Vouchers immediately
    const vouchers = [];
    for (let i = 0; i < quantity; i++) {
      vouchers.push({
        companyId: Number(id),
        code: `VTC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      });
    }

    await prisma.voucher.createMany({ data: vouchers });
    return { success: true, count: quantity };
  });

  server.get('/companies/:id/vouchers', async (request, reply) => {
    const { id } = request.params as any;
    return prisma.voucher.findMany({ where: { companyId: Number(id) } });
  });

  server.post('/companies/:id/distribute', async (request, reply) => {
    // Mock distribution via email
    return { success: true, message: 'Emails sent successfully' };
  });

  server.get('/companies/:id/students', async (request, reply) => {
    const { id } = request.params as any;
    const { search } = request.query as any;
    
    const students = await prisma.companyStudent.findMany({
      where: { 
        companyId: Number(id),
        ...(search ? {
          user: {
            name: {
              contains: search
            }
          }
        } : {})
      },
      include: {
        user: {
          include: {
            enrollments: true,
            certificates: true
          }
        }
      }
    });

    return students.map(cs => {
      const u = cs.user;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        status: u.enrollments.length > 0 ? (u.certificates.length > 0 ? 'certified' : 'in_progress') : 'pending',
        progress: u.enrollments.length > 0 ? u.enrollments[0].progress : 0,
        courses: u.enrollments.length,
        cert: u.certificates.length > 0
      };
    });
  });

  server.delete('/companies/:id/students/:userId', async (request, reply) => {
    const { id, userId } = request.params as any;
    await prisma.companyStudent.delete({
      where: { userId: Number(userId) }
    });
    return { success: true };
  });
}
