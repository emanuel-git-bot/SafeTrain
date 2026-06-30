import { Hono } from 'hono';
import { getPrisma } from '../plugins/prisma.js';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middlewares/auth.js';
export const userRoutes = new Hono();
userRoutes.get('/users/me', authenticate, async (c) => {
    const jwtUser = c.get('user');
    const prisma = getPrisma(c.env);
    const user = await prisma.user.findUnique({
        where: { id: jwtUser.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            cpf: true,
            phone: true,
            avatarUrl: true,
            areaId: true,
            area: true,
            createdAt: true,
            companyStudent: {
                include: {
                    company: true
                }
            }
        }
    });
    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }
    return c.json({
        ...user,
        company: user.companyStudent?.company?.name
    });
});
userRoutes.put('/users/me', authenticate, async (c) => {
    const jwtUser = c.get('user');
    const prisma = getPrisma(c.env);
    const body = await c.req.json();
    const { name, cpf, phone, avatarUrl } = body;
    try {
        const user = await prisma.user.update({
            where: { id: jwtUser.id },
            data: { name, cpf, phone, avatarUrl },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                cpf: true,
                phone: true,
                avatarUrl: true
            }
        });
        return c.json(user);
    }
    catch (err) {
        if (err.code === 'P2002' && err.meta?.target?.includes('cpf')) {
            return c.json({ error: 'CPF já cadastrado.' }, 400);
        }
        return c.json({ error: 'Erro ao atualizar perfil.' }, 400);
    }
});
userRoutes.post('/users/me/password', authenticate, async (c) => {
    const jwtUser = c.get('user');
    const prisma = getPrisma(c.env);
    const body = await c.req.json();
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
        return c.json({ error: 'Senha atual e nova senha são obrigatórias' }, 400);
    }
    const user = await prisma.user.findUnique({ where: { id: jwtUser.id } });
    if (!user)
        return c.json({ error: 'User not found' }, 404);
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
        return c.json({ error: 'Senha atual incorreta' }, 401);
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: jwtUser.id },
        data: { password: hashed }
    });
    return c.json({ success: true });
});
