import { Hono } from 'hono';
import { getPrisma } from '../plugins/prisma.js';
import { authenticate } from '../middlewares/auth.js';
export const companyRoutes = new Hono();
// All company routes seem to require authentication since they were using a preValidation hook
companyRoutes.use('*', authenticate);
companyRoutes.post('/companies', async (c) => {
    const prisma = getPrisma(c.env);
    const body = await c.req.json();
    const { name, cnpj } = body;
    const company = await prisma.company.create({ data: { name, cnpj } });
    return c.json(company);
});
companyRoutes.get('/b2b/plans', async (c) => {
    const prisma = getPrisma(c.env);
    const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } });
    return c.json(plans);
});
companyRoutes.post('/b2b/orders/simulate', async (c) => {
    const prisma = getPrisma(c.env);
    const body = await c.req.json();
    const { planId, couponCode } = body;
    const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });
    if (!plan)
        return c.json({ error: 'Plano não encontrado' }, 404);
    return c.json({
        planPrice: plan.price,
        discount: 0,
        finalPrice: plan.price,
        coupon: null
    });
});
companyRoutes.post('/b2b/orders', async (c) => {
    const prisma = getPrisma(c.env);
    const jwtUser = c.get('user');
    const body = await c.req.json();
    const { planId } = body;
    if (!jwtUser.companyId) {
        return c.json({ error: 'Acesso negado: Usuário não pertence a uma empresa.' }, 403);
    }
    const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });
    if (!plan)
        return c.json({ error: 'Plano não encontrado' }, 404);
    const order = await prisma.order.create({
        data: {
            companyId: jwtUser.companyId,
            planId: plan.id,
            finalPrice: plan.price,
            status: 'completed'
        }
    });
    const vouchers = [];
    for (let i = 0; i < plan.voucherCount; i++) {
        vouchers.push({
            companyId: jwtUser.companyId,
            code: `VTC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        });
    }
    await prisma.voucher.createMany({ data: vouchers });
    return c.json({ success: true, orderId: order.id, vouchersGenerated: plan.voucherCount });
});
companyRoutes.post('/companies/:id/purchase', async (c) => {
    const prisma = getPrisma(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    const { quantity } = body;
    const vouchers = [];
    for (let i = 0; i < quantity; i++) {
        vouchers.push({
            companyId: Number(id),
            code: `VTC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        });
    }
    await prisma.voucher.createMany({ data: vouchers });
    return c.json({ success: true, count: quantity });
});
companyRoutes.get('/companies/:id/vouchers', async (c) => {
    const prisma = getPrisma(c.env);
    const id = c.req.param('id');
    const vouchers = await prisma.voucher.findMany({ where: { companyId: Number(id) } });
    return c.json(vouchers);
});
companyRoutes.post('/companies/:id/distribute', async (c) => {
    return c.json({ success: true, message: 'Emails sent successfully' });
});
companyRoutes.get('/companies/:id/students', async (c) => {
    const prisma = getPrisma(c.env);
    const id = c.req.param('id');
    const search = c.req.query('search');
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
    const result = students.map(cs => {
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
    return c.json(result);
});
companyRoutes.delete('/companies/:id/students/:userId', async (c) => {
    const prisma = getPrisma(c.env);
    const userId = c.req.param('userId');
    await prisma.companyStudent.delete({
        where: { userId: Number(userId) }
    });
    return c.json({ success: true });
});
