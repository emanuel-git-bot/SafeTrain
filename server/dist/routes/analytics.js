import { Hono } from 'hono';
import { getPrisma } from '../plugins/prisma.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
export const analyticsRoutes = new Hono();
analyticsRoutes.use('*', authenticate);
analyticsRoutes.get('/admin/analytics', async (c) => {
    const prisma = getPrisma(c.env);
    const user = c.get('user');
    if (user.role !== 'admin')
        return c.json({ error: 'Forbidden' }, 403);
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
    return c.json({
        totalStudents,
        activeCourses,
        totalRevenue,
        completionRate: Math.round(completionRate),
        recentEnrollments: enrollments.slice(0, 5)
    });
});
analyticsRoutes.get('/admin/users', requirePermission('view_clients'), async (c) => {
    const prisma = getPrisma(c.env);
    const users = await prisma.user.findMany({
        include: {
            enrollments: true,
            certificates: true,
            companyStudent: { include: { company: true } }
        }
    });
    return c.json(users);
});
// Update a user's role and admin permissions
analyticsRoutes.put('/admin/users/:id/role-permissions', async (c) => {
    const prisma = getPrisma(c.env);
    const requestUser = c.get('user');
    if (requestUser.role !== 'admin') {
        return c.json({ error: 'Forbidden' }, 403);
    }
    const id = c.req.param('id');
    const body = await c.req.json();
    const { role, permissions } = body;
    // Prevent editing yourself
    if (Number(id) === requestUser.id) {
        return c.json({ error: 'Você não pode editar suas próprias permissões.' }, 400);
    }
    const updated = await prisma.user.update({
        where: { id: Number(id) },
        data: {
            role,
            permissions: permissions ? JSON.stringify(permissions) : null
        },
        select: { id: true, name: true, email: true, role: true, permissions: true }
    });
    return c.json(updated);
});
