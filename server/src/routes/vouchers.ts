import { FastifyInstance } from 'fastify';
import { prisma } from '../plugins/prisma.js';

export async function voucherRoutes(server: FastifyInstance) {
  server.post('/vouchers/activate', { preValidation: [server.authenticate] }, async (request, reply) => {
    const { code, courseId } = request.body as { code: string; courseId: number };
    const user = request.user as any;

    // We can also allow generic "VTC-" codes for testing as per UI
    if (code.startsWith('VTC-')) {
      // Mock activation success
      let existing = await prisma.enrollment.findFirst({
        where: { userId: user.id, courseId: Number(courseId) }
      });

      if (!existing) {
        existing = await prisma.enrollment.create({
          data: {
            userId: user.id,
            courseId: Number(courseId),
            status: 'in_progress',
            progress: 0
          }
        });
      }
      return { success: true, message: 'Voucher activated', enrollment: existing };
    }

    const voucher = await prisma.voucher.findUnique({ where: { code } });
    if (!voucher || voucher.status !== 'active') {
      return reply.status(400).send({ error: 'Invalid or already used voucher' });
    }

    await prisma.voucher.update({
      where: { id: voucher.id },
      data: { status: 'used', usedById: user.id }
    });

    // Check if companyStudent link exists, if not create
    const companyStudent = await prisma.companyStudent.findUnique({
      where: { userId: user.id }
    });

    if (!companyStudent) {
      await prisma.companyStudent.create({
        data: { userId: user.id, companyId: voucher.companyId }
      });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: Number(courseId),
        status: 'in_progress',
        progress: 0
      }
    });

    return { success: true, enrollment };
  });
}
