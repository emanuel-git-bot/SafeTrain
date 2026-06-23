import { FastifyInstance } from 'fastify';
import { prisma } from '../plugins/prisma.js';
import bcrypt from 'bcryptjs';
import { generateCertificatePDF } from '../utils/pdfGenerator.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import util from 'util';
import { pipeline } from 'stream';
import { createWriteStream } from 'fs';

const pump = util.promisify(pipeline);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function adminRoutes(server: FastifyInstance) {
  server.addHook('preValidation', server.authenticate);

  // We will use specific requirePermission on the routes, or keep this general one for routes without specific permissions
  server.addHook('onRequest', async (request, reply) => {
    const user = request.user as any;
    if (user && user.role !== 'admin') {
      return reply.status(403).send({ error: 'Forbidden. Admin access required.' });
    }
  });

  server.post('/admin/users/:id/reset-password', {
    preValidation: [server.requirePermission('view_clients')]
  }, async (request, reply) => {
    const { id } = request.params as any;
    // Generate a temporary 6-digit password
    const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    await prisma.user.update({
      where: { id: Number(id) },
      data: { password: hashedPassword }
    });

    return { success: true, tempPassword };
  });

  // Areas CRUD
  server.get('/admin/areas', {
    preValidation: [server.requirePermission('view_areas')]
  }, async () => {
    return prisma.area.findMany();
  });

  server.post('/admin/areas', {
    preValidation: [server.requirePermission('view_areas')]
  }, async (request, reply) => {
    const data = request.body as any;
    return prisma.area.create({ data });
  });

  server.put('/admin/areas/:id', {
    preValidation: [server.requirePermission('view_areas')]
  }, async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    return prisma.area.update({ where: { id: Number(id) }, data });
  });

  server.delete('/admin/areas/:id', {
    preValidation: [server.requirePermission('view_areas')]
  }, async (request, reply) => {
    const { id } = request.params as any;
    await prisma.area.delete({ where: { id: Number(id) } });
    return { success: true };
  });

  // Courses
  server.get('/admin/courses', async (request, reply) => {
    return prisma.course.findMany({
      include: {
        _count: {
          select: { modules: true, enrollments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  });
  server.post('/admin/courses', async (request, reply) => {
    const data = request.body as any;
    const course = await prisma.course.create({ data });
    return course;
  });

  server.put('/admin/courses/:id', async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    const course = await prisma.course.update({ where: { id: Number(id) }, data });
    return course;
  });

  server.delete('/admin/courses/:id', async (request, reply) => {
    const { id } = request.params as any;
    
    try {
      // Manual cascade deletion for foreign key constraints
      await prisma.screenTimeLog.deleteMany({
        where: { module: { courseId: Number(id) } }
      });
      await prisma.certificate.deleteMany({
        where: { courseId: Number(id) }
      });
      await prisma.enrollment.deleteMany({
        where: { courseId: Number(id) }
      });
      await prisma.module.deleteMany({
        where: { courseId: Number(id) }
      });
      await prisma.courseSection.deleteMany({
        where: { courseId: Number(id) }
      });
      
      await prisma.course.delete({ where: { id: Number(id) } });
      return { success: true };
    } catch (error: any) {
      console.error("ERRO AO DELETAR CURSO:", error);
      return reply.status(500).send({ error: error.message });
    }
  });

  // Course Sections
  server.post('/admin/courses/:id/sections', async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    const section = await prisma.courseSection.create({
      data: { ...data, courseId: Number(id) }
    });
    return section;
  });

  server.put('/admin/courses/:id/sections/:sectionId', async (request, reply) => {
    const { sectionId } = request.params as any;
    const data = request.body as any;
    const section = await prisma.courseSection.update({
      where: { id: Number(sectionId) },
      data
    });
    return section;
  });

  server.delete('/admin/courses/:id/sections/:sectionId', async (request, reply) => {
    const { sectionId } = request.params as any;
    await prisma.courseSection.delete({ where: { id: Number(sectionId) } });
    return { success: true };
  });

  // Modules
  server.post('/admin/courses/:id/modules', async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    const module = await prisma.module.create({
      data: { ...data, courseId: Number(id) }
    });
    return module;
  });

  server.put('/admin/courses/:id/modules/:moduleId', async (request, reply) => {
    const { moduleId } = request.params as any;
    const data = request.body as any;
    const module = await prisma.module.update({
      where: { id: Number(moduleId) },
      data
    });
    return module;
  });

  server.delete('/admin/courses/:id/modules/:moduleId', async (request, reply) => {
    const { moduleId } = request.params as any;
    await prisma.module.delete({ where: { id: Number(moduleId) } });
    return { success: true };
  });

  // R2 Signed URL
  server.post('/admin/r2/signed-url', async (request, reply) => {
    // Mocking signed URL generation since user requested mocks
    const { filename, contentType } = request.body as any;
    return {
      uploadUrl: `https://mock-upload-url.local?file=${filename}`,
      publicUrl: `https://cdn.safetrain.local/${filename}`
    };
  });

  // Local Image Upload
  server.post('/admin/upload', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const timestamp = Date.now();
    const ext = path.extname(data.filename) || '.png';
    const newFilename = `${timestamp}-${Math.random().toString(36).substring(7)}${ext}`;
    const uploadPath = path.join(__dirname, '../../uploads', newFilename);

    await pump(data.file, createWriteStream(uploadPath));

    return { url: `/uploads/${newFilename}` };
  });

  // Certificate Templates
  server.get('/admin/certificate-templates', async (request, reply) => {
    return prisma.certificateTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
  });

  server.post('/admin/certificate-templates', async (request, reply) => {
    const data = request.body as any;
    return prisma.certificateTemplate.create({ data });
  });

  server.post('/admin/certificate-templates/preview', async (request, reply) => {
    const data = request.body as any; // { backgroundImageUrl: string, elements: string }
    
    // Mock user and course
    const mockUser = { name: 'João da Silva', cpf: '000.000.000-00' };
    const mockCourse = { title: 'Curso de Exemplo', duration: '40 horas' };
    const mockCert = { issuedAt: new Date(), code: 'PREVIEW-1234' };

    try {
      const pdfBuffer = await generateCertificatePDF(mockCert, data, mockUser, mockCourse);
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', 'inline; filename="preview.pdf"');
      return reply.send(pdfBuffer);
    } catch (err: any) {
      return reply.status(500).send({ error: 'Error generating PDF: ' + err.message });
    }
  });

  server.put('/admin/certificate-templates/:id', async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    return prisma.certificateTemplate.update({
      where: { id: Number(id) },
      data
    });
  });

  server.delete('/admin/certificate-templates/:id', async (request, reply) => {
    const { id } = request.params as any;
    await prisma.certificateTemplate.delete({ where: { id: Number(id) } });
    return { success: true };
  });

  // Plans
  server.get('/admin/plans', async (request, reply) => {
    return prisma.plan.findMany({ orderBy: { price: 'asc' } });
  });

  server.post('/admin/plans', async (request, reply) => {
    const data = request.body as any;
    data.price = Number(data.price);
    data.voucherCount = Number(data.voucherCount);
    return prisma.plan.create({ data });
  });

  server.put('/admin/plans/:id', async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.voucherCount !== undefined) data.voucherCount = Number(data.voucherCount);
    return prisma.plan.update({ where: { id: Number(id) }, data });
  });

  server.delete('/admin/plans/:id', async (request, reply) => {
    const { id } = request.params as any;
    await prisma.plan.delete({ where: { id: Number(id) } });
    return { success: true };
  });

  // Metrics
  server.get('/admin/metrics', {
    preValidation: [server.requirePermission('view_metrics')]
  }, async () => {
    const courses = await prisma.course.findMany({
      include: {
        _count: { select: { enrollments: true } },
        enrollments: true
      }
    });

    const perf = courses.map(c => {
      const completed = c.enrollments.filter(e => e.status === 'completed').length;
      const total = c.enrollments.length;
      const taxa = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        name: c.title,
        alunos: total,
        taxa
      };
    });

    const orders = await prisma.order.findMany({ where: { status: 'completed' } });
    const enrollments = await prisma.enrollment.findMany();
    
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyMap: Record<string, { month: string, matriculas: number, concluidos: number, receita: number }> = {};
    
    enrollments.forEach(e => {
      const m = months[e.createdAt.getMonth()];
      if (!monthlyMap[m]) monthlyMap[m] = { month: m, matriculas: 0, concluidos: 0, receita: 0 };
      monthlyMap[m].matriculas++;
      if (e.status === 'completed') monthlyMap[m].concluidos++;
    });
    
    orders.forEach(o => {
      const m = months[o.createdAt.getMonth()];
      if (!monthlyMap[m]) monthlyMap[m] = { month: m, matriculas: 0, concluidos: 0, receita: 0 };
      monthlyMap[m].receita += o.finalPrice;
    });

    const monthly = Object.values(monthlyMap);
    if (monthly.length === 0) {
      monthly.push({ month: "Jan", matriculas: 0, concluidos: 0, receita: 0 });
    }

    return {
      monthly,
      coursesPerf: perf
    };
  });

  // Certificates List
  server.get('/admin/certificates', {
    preValidation: [server.requirePermission('view_certificates')]
  }, async () => {
    const certs = await prisma.certificate.findMany({
      include: {
        user: {
          include: { companyStudent: { include: { company: true } } }
        },
        course: true
      },
      orderBy: { issuedAt: 'desc' }
    });

    return certs.map(c => ({
      id: c.id,
      code: c.code,
      student: c.user.name,
      course: c.course.title,
      type: c.user.companyStudent ? 'b2b' : 'b2c',
      company: c.user.companyStudent?.company?.name || null,
      issued: c.issuedAt.toLocaleDateString(),
      expires: c.expiresAt ? c.expiresAt.toLocaleDateString() : null
    }));
  });
  // Settings
  server.get('/admin/settings', async (request, reply) => {
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({ data: { activeGateway: 'pagbank' } });
    }
    return {
      activeGateway: settings.activeGateway,
      hasToken: !!settings.gatewayToken
    };
  });

  server.put('/admin/settings', async (request, reply) => {
    const { activeGateway, gatewayToken } = request.body as any;
    let settings = await prisma.systemSettings.findFirst();
    
    const data: any = { activeGateway };
    if (gatewayToken && gatewayToken.trim() !== '') {
       const { encrypt } = await import('../utils/crypto.js');
       data.gatewayToken = encrypt(gatewayToken);
    }
    
    if (settings) {
      await prisma.systemSettings.update({ where: { id: settings.id }, data });
    } else {
      await prisma.systemSettings.create({ data });
    }
    return { success: true };
  });
}
