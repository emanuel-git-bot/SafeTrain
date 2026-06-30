import { Hono } from 'hono';
import { getPrisma } from '../plugins/prisma.js';
import { MercadoPagoProvider } from '../services/payments/mercadopago.js';
import { decrypt } from '../utils/crypto.js';
import { authenticate, UserPayload } from '../middlewares/auth.js';
import { Bindings } from '../server.js';
import { PrismaClient } from '@prisma/client';

async function getProvider(prisma: PrismaClient) {
  const settings = await prisma.systemSettings.findFirst();
  const token = settings?.gatewayToken ? await decrypt(settings.gatewayToken) : 'mock-token';
  return new MercadoPagoProvider(token);
}

export const paymentRoutes = new Hono<{ Bindings: Bindings, Variables: { user: UserPayload } }>();

paymentRoutes.post('/payments/checkout', authenticate, async (c) => {
  const prisma = getPrisma(c.env);
  const jwtUser = c.get('user');
  const body = await c.req.json();
  const { courseId, paymentMethod, cardDetails } = body;

  if (!paymentMethod) {
    return c.json({ error: 'Método de pagamento é obrigatório' }, 400);
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return c.json({ error: 'Course not found' }, 404);

  if (course.price === 0) {
     await prisma.enrollment.create({
       data: { userId: jwtUser.id, courseId: course.id, status: 'in_progress', progress: 0 }
     });
     return c.json({ success: true, paymentStatus: 'paid' });
  }

  const order = await prisma.order.create({
    data: {
      userId: jwtUser.id,
      courseId: course.id,
      finalPrice: course.price,
      status: 'pending',
      paymentMethod
    }
  });

  const provider = await getProvider(prisma as any);
  
  // We need to fetch the full user info to get cpf etc if we need it
  const fullUser = await prisma.user.findUnique({ where: { id: jwtUser.id } });

  const paymentResponse = await provider.processPayment({
    orderId: order.id,
    amount: course.price,
    method: paymentMethod,
    customer: {
      name: fullUser?.name || 'Customer',
      email: fullUser?.email || 'email@example.com',
      document: fullUser?.cpf || undefined
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
    await prisma.enrollment.create({
      data: { userId: jwtUser.id, courseId: course.id, status: 'in_progress', progress: 0 }
    });
    console.log(`[NF-e Trigger] Emitindo Nota Fiscal B2C para o pedido ${order.id}...`);
  }

  return c.json({ 
    success: true, 
    orderId: order.id, 
    paymentStatus: paymentResponse.status,
    paymentUrl: paymentResponse.paymentUrl,
    qrCodeUrl: paymentResponse.qrCodeUrl
  });
});
