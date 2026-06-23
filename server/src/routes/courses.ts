import { FastifyInstance } from 'fastify';
import { prisma } from '../plugins/prisma.js';

export async function courseRoutes(server: FastifyInstance) {
  server.get('/courses', async (request, reply) => {
    const { area, sort } = request.query as { area?: string; sort?: string };
    
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price') orderBy = { price: 'asc' };
    if (sort === 'popular') orderBy = { enrollments: { _count: 'desc' } };

    const courses = await prisma.course.findMany({
      where: {
        published: true,
        ...(area ? { area } : {})
      },
      orderBy,
      include: {
        _count: {
          select: { modules: true, enrollments: true }
        }
      }
    });

    return courses;
  });

  server.get('/courses/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
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
      return reply.status(404).send({ error: 'Course not found' });
    }

    return course;
  });

  server.get('/areas', async (request, reply) => {
    return prisma.area.findMany();
  });

  server.get('/courses/recommended', { preValidation: [server.authenticate] }, async (request, reply) => {
    const jwtUser = request.user as any;
    
    const user = await prisma.user.findUnique({ where: { id: jwtUser.id } });
    if (!user || !user.area) {
      return prisma.course.findMany({ where: { published: true }, take: 4 });
    }

    const courses = await prisma.course.findMany({
      where: {
        published: true,
        area: user.area
      },
      take: 4,
      include: {
        _count: { select: { modules: true } }
      }
    });

    return courses;
  });
}
