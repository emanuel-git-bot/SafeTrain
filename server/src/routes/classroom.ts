import { FastifyInstance } from 'fastify';
import { prisma } from '../plugins/prisma.js';

export async function classroomRoutes(server: FastifyInstance) {
  server.addHook('preValidation', server.authenticate);

  server.post('/enrollments', async (request, reply) => {
    const user = request.user as any;
    const { courseId } = request.body as any;

    if (!courseId) {
      return reply.status(400).send({ error: 'courseId is required' });
    }

    const existing = await prisma.enrollment.findFirst({
      where: { userId: user.id, courseId: Number(courseId) }
    });

    if (existing) {
      return reply.status(400).send({ error: 'Você já está matriculado neste curso' });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: Number(courseId),
        status: 'in_progress',
        progress: 0
      }
    });

    return enrollment;
  });

  server.get('/users/me/enrollments', async (request, reply) => {
    const user = request.user as any;
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        user: true,
        course: {
          include: { 
            _count: { select: { modules: true } },
            certificateTemplate: true
          }
        },
        certificates: true
      }
    });

    return enrollments.map(en => ({
      id: en.id,
      courseId: en.courseId,
      title: en.course.title,
      progress: en.progress,
      modules: en.course._count.modules,
      done: Math.floor((en.progress / 100) * en.course._count.modules),
      status: en.status,
      image: en.course.image,
      certId: en.certificates.length > 0 ? en.certificates[0].id : null,
      certificates: en.certificates.map(c => ({
        ...c,
        user: en.user,
        course: en.course
      })),
      course: en.course
    }));
  });

  server.get('/enrollments/:id/progress', async (request, reply) => {
    const { id } = request.params as any;
    const user = request.user as any;
    
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: Number(id) },
      include: {
        screenTimeLogs: true,
        course: { 
          include: { 
            modules: { orderBy: { order: 'asc' } },
            courseSections: {
              include: { modules: { orderBy: { order: 'asc' } } },
              orderBy: { order: 'asc' }
            }
          } 
        }
      }
    });

    if (!enrollment || enrollment.userId !== user.id) {
      return reply.status(403).send({ error: 'Access denied' });
    }

    return { enrollment, progress: enrollment.progress, logs: enrollment.screenTimeLogs };
  });

  server.post('/enrollments/:id/ping', async (request, reply) => {
    const { id } = request.params as any;
    const { moduleId } = request.body as any;
    
    if (!moduleId) return reply.status(400).send({ error: 'moduleId is required' });

    const increment = request.body.timeSpent ? Number(request.body.timeSpent) : 5;
    
    let log = await prisma.screenTimeLog.findFirst({
      where: { enrollmentId: Number(id), moduleId: Number(moduleId) }
    });

    if (!log) {
      log = await prisma.screenTimeLog.create({
        data: { enrollmentId: Number(id), moduleId: Number(moduleId), timeSpent: increment }
      });
    } else {
      log = await prisma.screenTimeLog.update({
        where: { id: log.id },
        data: { timeSpent: log.timeSpent + increment }
      });
    }

    const module = await prisma.module.findUnique({ where: { id: Number(moduleId) } });
    
    console.log(`[PING] Module: ${moduleId}, timeSpent: ${log.timeSpent}, minScreenTime: ${module?.minScreenTime}, completed: ${log.completed}`);
    
    if (module && log.timeSpent >= (module.minScreenTime || 0) && !log.completed) {
      log = await prisma.screenTimeLog.update({
        where: { id: log.id },
        data: { completed: true }
      });
      console.log(`[PING] Module ${moduleId} marked as COMPLETED.`);
    }

    return { timeSpent: log.timeSpent, completed: log.completed };
  });

  server.post('/enrollments/:id/quiz', async (request, reply) => {
    const { id } = request.params as any;
    const { moduleId, answers } = request.body as any; 
    
    if (!moduleId || !answers) return reply.status(400).send({ error: 'moduleId and answers are required' });

    const module = await prisma.module.findUnique({ where: { id: Number(moduleId) } });
    if (!module || module.type !== 'quiz') return reply.status(400).send({ error: 'Invalid module' });

    let score = 0;
    const passed = true; // we will calculate this below
    let calculatedScore = 0;

    if (module.questions) {
      try {
        const questions = JSON.parse(module.questions);
        let correctCount = 0;
        for (let i = 0; i < questions.length; i++) {
          const correctAns = questions[i].correctIndex !== undefined ? questions[i].correctIndex : questions[i].correct;
          if (answers[i] === correctAns) {
            correctCount++;
          }
        }
        calculatedScore = Math.round((correctCount / questions.length) * 100);
      } catch(e) {}
    } else {
      calculatedScore = 100;
    }

    const isPassed = calculatedScore >= (module.passingScore || 70);

    if (isPassed) {
      let log = await prisma.screenTimeLog.findFirst({
        where: { enrollmentId: Number(id), moduleId: Number(moduleId) }
      });

      if (!log) {
        await prisma.screenTimeLog.create({
          data: { enrollmentId: Number(id), moduleId: Number(moduleId), timeSpent: 0, completed: true }
        });
      } else if (!log.completed) {
        await prisma.screenTimeLog.update({
          where: { id: log.id },
          data: { completed: true }
        });
      }
    }

    return { passed: isPassed, score: calculatedScore };
  });

  server.post('/enrollments/:id/complete', async (request, reply) => {
    const { id } = request.params as any;
    const user = request.user as any;
    
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: Number(id) },
      include: { course: { include: { _count: { select: { modules: true } } } } }
    });

    if (!enrollment) return reply.status(404).send({ error: 'Enrollment not found' });

    const logs = await prisma.screenTimeLog.findMany({ where: { enrollmentId: Number(id), completed: true } });
    const progress = (logs.length / enrollment.course._count.modules) * 100;
    
    if (progress >= 100 || logs.length >= enrollment.course._count.modules) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { progress: 100, status: 'completed' }
      });

      // Generate Certificate
      const existingCert = await prisma.certificate.findFirst({
        where: { enrollmentId: enrollment.id }
      });

      if (!existingCert) {
        const crypto = await import('crypto');
        const hash = crypto.randomUUID();
        const code = `ST-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
        
        await prisma.certificate.create({
          data: {
            code,
            hash,
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            enrollmentId: enrollment.id
          }
        });
      }
    } else {
      // update progress anyway
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { progress }
      });
    }

    return { success: true, progress: progress >= 100 ? 100 : progress };
  });
}
