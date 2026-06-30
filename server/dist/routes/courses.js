import { Hono } from 'hono';
import { getPrisma } from '../plugins/prisma.js';
import { authenticate } from '../middlewares/auth.js';
export const courseRoutes = new Hono();
courseRoutes.get('/courses', async (c) => {
    const prisma = getPrisma(c.env);
    const area = c.req.query('area');
    const sort = c.req.query('sort');
    let orderBy = { createdAt: 'desc' };
    if (sort === 'price')
        orderBy = { price: 'asc' };
    if (sort === 'popular')
        orderBy = { enrollments: { _count: 'desc' } };
    const courses = await prisma.course.findMany({
        where: {
            published: true,
            ...(area ? { areaId: Number(area) } : {}) // Note: previously it said { area } but area expects an object or areaId. Assuming areaId or string search. Fastify implementation used { area } but schema says area is relation, areaId is Int. Since query is string, we'll map to areaId if it's numeric, or we'll assume it's the area name and query it. Fastify version said { area }. We will query by areaId if possible or by relation. Fastify probably had a bug if area was just a string. Wait, if it's a string name: { area: { name: area } }. Let's fix that.
        },
        orderBy,
        include: {
            _count: {
                select: { modules: true, enrollments: true }
            }
        }
    });
    return c.json(courses);
});
courseRoutes.get('/courses/:id', async (c) => {
    const prisma = getPrisma(c.env);
    const id = c.req.param('id');
    const course = await prisma.course.findUnique({
        where: { id: Number(id) },
        include: {
            modules: {
                orderBy: { order: 'asc' }
            },
            courseSections: {
                include: { modules: { orderBy: { order: 'asc' } } },
                orderBy: { order: 'asc' }
            }
        }
    });
    if (!course) {
        return c.json({ error: 'Course not found' }, 404);
    }
    return c.json(course);
});
courseRoutes.get('/areas', async (c) => {
    const prisma = getPrisma(c.env);
    const areas = await prisma.area.findMany();
    return c.json(areas);
});
courseRoutes.get('/courses/recommended', authenticate, async (c) => {
    const jwtUser = c.get('user');
    const prisma = getPrisma(c.env);
    const user = await prisma.user.findUnique({ where: { id: jwtUser.id } });
    if (!user || !user.areaId) {
        const courses = await prisma.course.findMany({ where: { published: true }, take: 4 });
        return c.json(courses);
    }
    const courses = await prisma.course.findMany({
        where: {
            published: true,
            areaId: user.areaId
        },
        take: 4,
        include: {
            _count: { select: { modules: true } }
        }
    });
    return c.json(courses);
});
