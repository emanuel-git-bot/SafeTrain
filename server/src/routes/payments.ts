import { FastifyInstance } from 'fastify';
import { prisma } from '../plugins/prisma.js';
import { PagBankProvider } from '../services/payments/pagbank.js';
import { decrypt } from '../utils/crypto.js';

async function getProvider() {
  const settings = await prisma.systemSettings.findFirst();
  const token = settings?.gatewayToken ? decrypt(settings.gatewayToken) : 'mock-token';
  return new PagBankProvider(token);
}

export async function paymentRoutes(server: FastifyInstance) {
  server.post('/payments/checkout', { preValidation: [server.authenticate] }, async (request, reply) => {
    const { courseId, paymentMethod, cardDetails } = request.body as any;
    const user = request.user as any;

    if (!paymentMethod) {
      return reply.status(400).send({ error: 'Método de pagamento é obrigatório' });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return reply.status(404).send({ error: 'Course not found' });

    if (course.price === 0) {
       await prisma.enrollment.create({
         data: { userId: user.id, courseId: course.id, status: 'in_progress', progress: 0 }
       });
       return { success: true, paymentStatus: 'paid' };
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        courseId: course.id,
        finalPrice: course.price,
        status: 'pending',
        paymentMethod
      }
    });

    const provider = await getProvider();
    const paymentResponse = await provider.processPayment({
      orderId: order.id,
      amount: course.price,
      method: paymentMethod,
      customer: {
        name: user.name,
        email: user.email,
        document: user.cpf || undefined
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

    if (paymentResponse.status === 'paid') {
      await prisma.enrollment.create({
        data: { userId: user.id, courseId: course.id, status: 'in_progress', progress: 0 }
      });
      console.log(`[NF-e Trigger] Emitindo Nota Fiscal B2C para o pedido ${order.id}...`);
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
