import { FastifyInstance } from 'fastify';
import { prisma } from '../plugins/prisma.js';

export async function analyticsRoutes(server: FastifyInstance) {
  server.addHook('preValidation', server.authenticate);

  server.get('/admin/analytics', async (request, reply) => {
    const user = request.user as any;
    if (user.role !== 'admin') return reply.status(403).send({ error: 'Forbidden' });

    const totalStudents = await prisma.user.count({ where: { role: 'student' } });
    const activeCourses = await prisma.course.count({ where: { published: true } });
    
    const enrollments = await prisma.enrollment.findMany({ 
      include: { course: true, user: true },
      orderBy: { createdAt: 'desc' }
    });
    const totalRevenue = enrollments.reduce((acc, curr) => acc + (curr.course?.price || 0), 0);

    const completionRate = enrollments.length > 0 
      ? (enrollments.filter(e => e.status === 'completed').length / enrollments.length) * 100 
      : 0;

    return {
      totalStudents,
      activeCourses,
      totalRevenue,
      completionRate: Math.round(completionRate),
      recentEnrollments: enrollments.slice(0, 5)
    };
  });

  server.get('/admin/users', {
    preValidation: [server.requirePermission('view_clients')]
  }, async (request, reply) => {
    return prisma.user.findMany({
      include: {
        enrollments: true,
        certificates: true,
        companyStudent: { include: { company: true } }
      }
    });
  });

  // Update a user's role and admin permissions
  server.put('/admin/users/:id/role-permissions', async (request, reply) => {
    const requestUser = request.user as any;
    if (requestUser.role !== 'admin') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const { id } = request.params as any;
    const { role, permissions } = request.body as any;

    // Prevent editing yourself
    if (Number(id) === requestUser.id) {
      return reply.status(400).send({ error: 'Você não pode editar suas próprias permissões.' });
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        role,
        permissions: permissions ? JSON.stringify(permissions) : null
      },
      select: { id: true, name: true, email: true, role: true, permissions: true }
    });

    return updated;
  });
}
