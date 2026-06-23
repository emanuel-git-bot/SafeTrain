import { FastifyInstance } from 'fastify';
import { prisma } from '../plugins/prisma.js';
import { generateCertificatePDF } from '../utils/pdfGenerator.js';

export async function certificateRoutes(server: FastifyInstance) {
  server.get('/validar/:code', async (request, reply) => {
    const { code } = request.params as any;
    
    const cert = await prisma.certificate.findUnique({
      where: { code },
      include: {
        user: { select: { name: true, cpf: true } },
        course: { select: { title: true, duration: true } }
      }
    });

    if (!cert) {
      return reply.status(404).send({ valid: false });
    }

    return {
      valid: true,
      issuedTo: cert.user.name,
      document: cert.user.cpf,
      course: cert.course.title,
      duration: cert.course.duration,
      issuedAt: cert.issuedAt
    };
  });

  server.get('/enrollments/:id/certificate', { preValidation: [server.authenticate] }, async (request, reply) => {
    const { id } = request.params as any;
    const user = request.user as any;

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

    if (!enrollment || enrollment.userId !== user.id) {
      return reply.status(404).send({ error: 'Enrollment not found' });
    }

    if (enrollment.status !== 'completed') {
      return reply.status(400).send({ error: 'Course not completed' });
    }

    let certificate = enrollment.certificates[0];
    
    // Fallback generate if not exists
    if (!certificate) {
      const code = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      certificate = await prisma.certificate.create({
        data: {
          userId: user.id,
          courseId: enrollment.courseId,
          enrollmentId: enrollment.id,
          code,
          hash: code
        }
      });
    }

    // Generate PDF buffer
    try {
      const pdfBuffer = await generateCertificatePDF(certificate, enrollment.course.certificateTemplate, enrollment.user, enrollment.course);
      
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `attachment; filename="Certificado_${certificate.code}.pdf"`);
      return reply.send(pdfBuffer);
    } catch (err: any) {
      return reply.status(500).send({ error: 'Error generating PDF: ' + err.message });
    }
  });
}
