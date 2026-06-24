import { Hono } from 'hono';
import { getPrisma } from '../plugins/prisma.js';
import { generateCertificatePDF } from '../utils/pdfGenerator.js';
import { authenticate, UserPayload } from '../middlewares/auth.js';
import { Bindings } from '../server.js';

export const certificateRoutes = new Hono<{ Bindings: Bindings, Variables: { user: UserPayload } }>();

certificateRoutes.get('/validar/:code', async (c) => {
  const prisma = getPrisma(c.env);
  const code = c.req.param('code');
  
  const cert = await prisma.certificate.findUnique({
    where: { code },
    include: {
      user: { select: { name: true, cpf: true } },
      course: { select: { title: true, duration: true } }
    }
  });

  if (!cert) {
    return c.json({ valid: false }, 404);
  }

  return c.json({
    valid: true,
    issuedTo: cert.user.name,
    document: cert.user.cpf,
    course: cert.course.title,
    duration: cert.course.duration,
    issuedAt: cert.issuedAt
  });
});

certificateRoutes.get('/enrollments/:id/certificate', authenticate, async (c) => {
  const prisma = getPrisma(c.env);
  const id = c.req.param('id');
  const jwtUser = c.get('user');

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: Number(id) },
    include: {
      user: true,
      course: {
        include: {
          certificateTemplate: true
        }
      },
      certificates: true
    }
  });

  if (!enrollment || enrollment.userId !== jwtUser.id) {
    return c.json({ error: 'Enrollment not found' }, 404);
  }

  if (enrollment.status !== 'completed') {
    return c.json({ error: 'Course not completed' }, 400);
  }

  let certificate = enrollment.certificates[0];
  
  if (!certificate) {
    const code = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    certificate = await prisma.certificate.create({
      data: {
        userId: jwtUser.id,
        courseId: enrollment.courseId,
        enrollmentId: enrollment.id,
        code,
        hash: code
      }
    });
  }

  try {
    const pdfBuffer = await generateCertificatePDF(certificate, enrollment.course.certificateTemplate, enrollment.user, enrollment.course);
    
    // Cloudflare Workers requires Uint8Array/ArrayBuffer for binary responses
    const uint8Array = new Uint8Array(pdfBuffer);
    
    return new Response(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Certificado_${certificate.code}.pdf"`
      }
    });
  } catch (err: any) {
    return c.json({ error: 'Error generating PDF: ' + err.message }, 500);
  }
});
