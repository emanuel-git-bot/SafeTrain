import { Hono } from 'hono';
import { getPrisma } from '../plugins/prisma.js';
import { authenticate } from '../middlewares/auth.js';
export const classroomRoutes = new Hono();
classroomRoutes.use('*', authenticate);
classroomRoutes.post('/enrollments', async (c) => {
    const prisma = getPrisma(c.env);
    const jwtUser = c.get('user');
    const body = await c.req.json();
    const { courseId } = body;
    if (!courseId) {
        return c.json({ error: 'courseId is required' }, 400);
    }
    const existing = await prisma.enrollment.findFirst({
        where: { userId: jwtUser.id, courseId: Number(courseId) }
    });
    if (existing) {
        return c.json({ error: 'Você já está matriculado neste curso' }, 400);
    }
    const enrollment = await prisma.enrollment.create({
        data: {
            userId: jwtUser.id,
            courseId: Number(courseId),
            status: 'in_progress',
            progress: 0
        }
    });
    return c.json(enrollment);
});
classroomRoutes.get('/users/me/enrollments', async (c) => {
    const prisma = getPrisma(c.env);
    const jwtUser = c.get('user');
    const enrollments = await prisma.enrollment.findMany({
        where: { userId: jwtUser.id },
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
    const formatted = enrollments.map(en => ({
        id: en.id,
        courseId: en.courseId,
        title: en.course.title,
        progress: en.progress,
        modules: en.course._count.modules,
        done: Math.floor((en.progress / 100) * en.course._count.modules),
        status: en.status,
        image: en.course.image,
        certId: en.certificates.length > 0 ? en.certificates[0].id : null,
        certificates: en.certificates.map(cert => ({
            ...cert,
            user: en.user,
            course: en.course
        })),
        course: en.course
    }));
    return c.json(formatted);
});
classroomRoutes.get('/enrollments/:id/progress', async (c) => {
    const prisma = getPrisma(c.env);
    const id = c.req.param('id');
    const jwtUser = c.get('user');
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
    if (!enrollment || enrollment.userId !== jwtUser.id) {
        return c.json({ error: 'Access denied' }, 403);
    }
    return c.json({ enrollment, progress: enrollment.progress, logs: enrollment.screenTimeLogs });
});
classroomRoutes.post('/enrollments/:id/ping', async (c) => {
    const prisma = getPrisma(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    const { moduleId } = body;
    if (!moduleId)
        return c.json({ error: 'moduleId is required' }, 400);
    const increment = body.timeSpent ? Number(body.timeSpent) : 5;
    let log = await prisma.screenTimeLog.findFirst({
        where: { enrollmentId: Number(id), moduleId: Number(moduleId) }
    });
    if (!log) {
        log = await prisma.screenTimeLog.create({
            data: { enrollmentId: Number(id), moduleId: Number(moduleId), timeSpent: increment }
        });
    }
    else {
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
    return c.json({ timeSpent: log.timeSpent, completed: log.completed });
});
classroomRoutes.post('/enrollments/:id/quiz', async (c) => {
    const prisma = getPrisma(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    const { moduleId, answers } = body;
    if (!moduleId || !answers)
        return c.json({ error: 'moduleId and answers are required' }, 400);
    const module = await prisma.module.findUnique({ where: { id: Number(moduleId) } });
    if (!module || module.type !== 'quiz')
        return c.json({ error: 'Invalid module' }, 400);
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
        }
        catch (e) { }
    }
    else {
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
        }
        else if (!log.completed) {
            await prisma.screenTimeLog.update({
                where: { id: log.id },
                data: { completed: true }
            });
        }
    }
    return c.json({ passed: isPassed, score: calculatedScore });
});
classroomRoutes.post('/enrollments/:id/complete', async (c) => {
    const prisma = getPrisma(c.env);
    const id = c.req.param('id');
    const enrollment = await prisma.enrollment.findUnique({
        where: { id: Number(id) },
        include: { course: { include: { _count: { select: { modules: true } } } } }
    });
    if (!enrollment)
        return c.json({ error: 'Enrollment not found' }, 404);
    const logs = await prisma.screenTimeLog.findMany({ where: { enrollmentId: Number(id), completed: true } });
    const progress = (logs.length / enrollment.course._count.modules) * 100;
    if (progress >= 100 || logs.length >= enrollment.course._count.modules) {
        await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { progress: 100, status: 'completed' }
        });
        const existingCert = await prisma.certificate.findFirst({
            where: { enrollmentId: enrollment.id }
        });
        if (!existingCert) {
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
    }
    else {
        await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { progress }
        });
    }
    return c.json({ success: true, progress: progress >= 100 ? 100 : progress });
});
