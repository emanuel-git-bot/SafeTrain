import { Hono } from 'hono';
import { getPrisma } from '../plugins/prisma.js';
import bcrypt from 'bcryptjs';
import { generateCertificatePDF } from '../utils/pdfGenerator.js';
import { authenticate, requirePermission, UserPayload } from '../middlewares/auth.js';
import { Bindings } from '../server.js';
import { encrypt } from '../utils/crypto.js';

export const adminRoutes = new Hono<{ Bindings: Bindings, Variables: { user: UserPayload } }>();

// Auth hook applied globally or per route. To keep logic simple we can apply authenticate to all admin routes.
adminRoutes.use('/admin/*', authenticate);

// We need a proxy for R2 uploads
adminRoutes.get('/uploads/:filename', async (c) => {
  const filename = c.req.param('filename');
  const object = await c.env.BUCKET.get(filename);
  
  if (object === null) {
    return c.text('Not found', 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  return new Response(object.body, { headers });
});

adminRoutes.post('/admin/users/:id/reset-password', requirePermission('view_clients'), async (c) => {
  const prisma = getPrisma(c.env);
  const id = c.req.param('id');
  const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);
  
  await prisma.user.update({
    where: { id: Number(id) },
    data: { password: hashedPassword }
  });

  return c.json({ success: true, tempPassword });
});

// Areas CRUD
adminRoutes.get('/admin/areas', requirePermission('view_areas'), async (c) => {
  const prisma = getPrisma(c.env);
  const areas = await prisma.area.findMany();
  return c.json(areas);
});

adminRoutes.post('/admin/areas', requirePermission('view_areas'), async (c) => {
  const prisma = getPrisma(c.env);
  const data = await c.req.json();
  const area = await prisma.area.create({ data });
  return c.json(area);
});

adminRoutes.put('/admin/areas/:id', requirePermission('view_areas'), async (c) => {
  const prisma = getPrisma(c.env);
  const id = c.req.param('id');
  const data = await c.req.json();
  const area = await prisma.area.update({ where: { id: Number(id) }, data });
  return c.json(area);
});

adminRoutes.delete('/admin/areas/:id', requirePermission('view_areas'), async (c) => {
  const prisma = getPrisma(c.env);
  const id = c.req.param('id');
  await prisma.area.delete({ where: { id: Number(id) } });
  return c.json({ success: true });
});

// Courses
adminRoutes.get('/admin/courses', async (c) => {
  const prisma = getPrisma(c.env);
  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: { modules: true, enrollments: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return c.json(courses);
});

adminRoutes.post('/admin/courses', async (c) => {
  const prisma = getPrisma(c.env);
  const data = await c.req.json();
  const course = await prisma.course.create({ data });
  return c.json(course);
});

adminRoutes.put('/admin/courses/:id', async (c) => {
  const prisma = getPrisma(c.env);
  const id = c.req.param('id');
  const data = await c.req.json();
  const course = await prisma.course.update({ where: { id: Number(id) }, data });
  return c.json(course);
});

adminRoutes.delete('/admin/courses/:id', async (c) => {
  const prisma = getPrisma(c.env);
  const id = c.req.param('id');
  
  try {
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
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Course Sections
adminRoutes.post('/admin/courses/:id/sections', async (c) => {
  const prisma = getPrisma(c.env);
  const id = c.req.param('id');
  const data = await c.req.json();
  const section = await prisma.courseSection.create({
    data: { ...data, courseId: Number(id) }
  });
  return c.json(section);
});

adminRoutes.put('/admin/courses/:id/sections/:sectionId', async (c) => {
  const prisma = getPrisma(c.env);
  const sectionId = c.req.param('sectionId');
  const data = await c.req.json();
  const section = await prisma.courseSection.update({
    where: { id: Number(sectionId) },
    data
  });
  return c.json(section);
});

adminRoutes.delete('/admin/courses/:id/sections/:sectionId', async (c) => {
  const prisma = getPrisma(c.env);
  const sectionId = c.req.param('sectionId');
  await prisma.courseSection.delete({ where: { id: Number(sectionId) } });
  return c.json({ success: true });
});

// Modules
adminRoutes.post('/admin/courses/:id/modules', async (c) => {
  const prisma = getPrisma(c.env);
  const id = c.req.param('id');
  const data = await c.req.json();
  const module = await prisma.module.create({
    data: { ...data, courseId: Number(id) }
  });
  return c.json(module);
});

adminRoutes.put('/admin/courses/:id/modules/:moduleId', async (c) => {
  const prisma = getPrisma(c.env);
  const moduleId = c.req.param('moduleId');
  const data = await c.req.json();
  const module = await prisma.module.update({
    where: { id: Number(moduleId) },
    data
  });
  return c.json(module);
});

adminRoutes.delete('/admin/courses/:id/modules/:moduleId', async (c) => {
  const prisma = getPrisma(c.env);
  const moduleId = c.req.param('moduleId');
  await prisma.module.delete({ where: { id: Number(moduleId) } });
  return c.json({ success: true });
});

// R2 Signed URL
adminRoutes.post('/admin/r2/signed-url', async (c) => {
  const body = await c.req.json();
  const { filename, contentType } = body;
  return c.json({
    uploadUrl: `https://mock-upload-url.local?file=${filename}`,
    publicUrl: `https://cdn.safetrain.local/${filename}`
  });
});

// Cloudflare R2 Uploads Integration
adminRoutes.post('/admin/upload', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];

  if (!file || typeof file === 'string') {
    return c.json({ error: 'No file uploaded' }, 400);
  }

  const timestamp = Date.now();
  const ext = file.name ? file.name.substring(file.name.lastIndexOf('.')) : '.png';
  const newFilename = `${timestamp}-${Math.random().toString(36).substring(7)}${ext}`;

  const buffer = await file.arrayBuffer();

  await c.env.BUCKET.put(newFilename, buffer, {
    httpMetadata: { contentType: file.type }
  });

  return c.json({ url: `/uploads/${newFilename}` });
});

// Certificate Templates
adminRoutes.get('/admin/certificate-templates', async (c) => {
  const prisma = getPrisma(c.env);
  const templates = await prisma.certificateTemplate.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return c.json(templates);
});

adminRoutes.post('/admin/certificate-templates', async (c) => {
  const prisma = getPrisma(c.env);
  const data = await c.req.json();
  const template = await prisma.certificateTemplate.create({ data });
  return c.json(template);
});

adminRoutes.post('/admin/certificate-templates/preview', async (c) => {
  const data = await c.req.json();
  const mockUser = { name: 'João da Silva', cpf: '000.000.000-00' };
  const mockCourse = { title: 'Curso de Exemplo', duration: '40 horas' };
  const mockCert = { issuedAt: new Date(), code: 'PREVIEW-1234' };

  try {
    const pdfBuffer = await generateCertificatePDF(mockCert, data, mockUser, mockCourse);
    
    // Convert Buffer to Uint8Array for Cloudflare Workers native Response
    const uint8Array = new Uint8Array(pdfBuffer);
    
    return new Response(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview.pdf"'
      }
    });
  } catch (err: any) {
    return c.json({ error: 'Error generating PDF: ' + err.message }, 500);
  }
});

adminRoutes.put('/admin/certificate-templates/:id', async (c) => {
  const prisma = getPrisma(c.env);
  const id = c.req.param('id');
  const data = await c.req.json();
  const template = await prisma.certificateTemplate.update({
    where: { id: Number(id) },
    data
  });
  return c.json(template);
});

adminRoutes.delete('/admin/certificate-templates/:id', async (c) => {
  const prisma = getPrisma(c.env);
  const id = c.req.param('id');
  await prisma.certificateTemplate.delete({ where: { id: Number(id) } });
  return c.json({ success: true });
});

// Plans
adminRoutes.get('/admin/plans', async (c) => {
  const prisma = getPrisma(c.env);
  const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } });
  return c.json(plans);
});

adminRoutes.post('/admin/plans', async (c) => {
  const prisma = getPrisma(c.env);
  const data = await c.req.json();
  data.price = Number(data.price);
  data.voucherCount = Number(data.voucherCount);
  const plan = await prisma.plan.create({ data });
  return c.json(plan);
});

adminRoutes.put('/admin/plans/:id', async (c) => {
  const prisma = getPrisma(c.env);
  const id = c.req.param('id');
  const data = await c.req.json();
  if (data.price !== undefined) data.price = Number(data.price);
  if (data.voucherCount !== undefined) data.voucherCount = Number(data.voucherCount);
  const plan = await prisma.plan.update({ where: { id: Number(id) }, data });
  return c.json(plan);
});

adminRoutes.delete('/admin/plans/:id', async (c) => {
  const prisma = getPrisma(c.env);
  const id = c.req.param('id');
  await prisma.plan.delete({ where: { id: Number(id) } });
  return c.json({ success: true });
});

// Metrics
adminRoutes.get('/admin/metrics', requirePermission('view_metrics'), async (c) => {
  const prisma = getPrisma(c.env);
  const courses = await prisma.course.findMany({
    include: {
      _count: { select: { enrollments: true } },
      enrollments: true
    }
  });

  const perf = courses.map(course => {
    const completed = course.enrollments.filter(e => e.status === 'completed').length;
    const total = course.enrollments.length;
    const taxa = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      name: course.title,
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

  return c.json({
    monthly,
    coursesPerf: perf
  });
});

// Certificates List
adminRoutes.get('/admin/certificates', requirePermission('view_certificates'), async (c) => {
  const prisma = getPrisma(c.env);
  const certs = await prisma.certificate.findMany({
    include: {
      user: {
        include: { companyStudent: { include: { company: true } } }
      },
      course: true
    },
    orderBy: { issuedAt: 'desc' }
  });

  const formattedCerts = certs.map(cert => ({
    id: cert.id,
    code: cert.code,
    student: cert.user.name,
    course: cert.course.title,
    type: cert.user.companyStudent ? 'b2b' : 'b2c',
    company: cert.user.companyStudent?.company?.name || null,
    issued: cert.issuedAt.toLocaleDateString(),
    expires: cert.expiresAt ? cert.expiresAt.toLocaleDateString() : null
  }));

  return c.json(formattedCerts);
});

// Settings
adminRoutes.get('/admin/settings', async (c) => {
  const prisma = getPrisma(c.env);
  let settings = await prisma.systemSettings.findFirst();
  if (!settings) {
    settings = await prisma.systemSettings.create({ data: { activeGateway: 'pagbank' } });
  }
  return c.json({
    activeGateway: settings.activeGateway,
    hasToken: !!settings.gatewayToken,
    googleClientId: settings.googleClientId || '',
    googleClientSecret: settings.googleClientSecret || ''
  });
});

adminRoutes.put('/admin/settings', async (c) => {
  const prisma = getPrisma(c.env);
  const body = await c.req.json();
  const { activeGateway, gatewayToken, googleClientId, googleClientSecret } = body;
  let settings = await prisma.systemSettings.findFirst();
  
  const data: any = { activeGateway, googleClientId, googleClientSecret };
  if (gatewayToken && gatewayToken.trim() !== '') {
     data.gatewayToken = await encrypt(gatewayToken);
  }
  
  if (settings) {
    await prisma.systemSettings.update({ where: { id: settings.id }, data });
  } else {
    await prisma.systemSettings.create({ data });
  }
  return c.json({ success: true });
});
