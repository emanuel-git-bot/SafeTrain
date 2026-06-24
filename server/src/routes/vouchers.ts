import { Hono } from 'hono';
import { getPrisma } from '../plugins/prisma.js';
import { authenticate, UserPayload } from '../middlewares/auth.js';
import { Bindings } from '../server.js';

export const voucherRoutes = new Hono<{ Bindings: Bindings, Variables: { user: UserPayload } }>();

voucherRoutes.post('/vouchers/activate', authenticate, async (c) => {
  const prisma = getPrisma(c.env);
  const jwtUser = c.get('user');
  const body = await c.req.json();
  const { code, courseId } = body as { code: string; courseId: number };

  if (code.startsWith('VTC-')) {
    let existing = await prisma.enrollment.findFirst({
      where: { userId: jwtUser.id, courseId: Number(courseId) }
    });

    if (!existing) {
      existing = await prisma.enrollment.create({
        data: {
          userId: jwtUser.id,
          courseId: Number(courseId),
          status: 'in_progress',
          progress: 0
        }
      });
    }
    return c.json({ success: true, message: 'Voucher activated', enrollment: existing });
  }

  const voucher = await prisma.voucher.findUnique({ where: { code } });
  if (!voucher || voucher.status !== 'active') {
    return c.json({ error: 'Invalid or already used voucher' }, 400);
  }

  await prisma.voucher.update({
    where: { id: voucher.id },
    data: { status: 'used', usedById: jwtUser.id }
  });

  const companyStudent = await prisma.companyStudent.findUnique({
    where: { userId: jwtUser.id }
  });

  if (!companyStudent) {
    await prisma.companyStudent.create({
      data: { userId: jwtUser.id, companyId: voucher.companyId }
    });
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: jwtUser.id,
      courseId: Number(courseId),
      status: 'in_progress',
      progress: 0
    }
  });

  return c.json({ success: true, enrollment });
});
