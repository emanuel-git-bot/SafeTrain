import { FastifyInstance } from 'fastify';
import { prisma } from '../plugins/prisma.js';
import bcrypt from 'bcryptjs';

export async function userRoutes(server: FastifyInstance) {
  server.get('/users/me', {
    preValidation: [server.authenticate]
  }, async (request, reply) => {
    const jwtUser = request.user as any;
    
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
      return reply.status(404).send({ error: 'User not found' });
    }

    return {
      ...user,
      company: user.companyStudent?.company?.name
    };
  });

  server.put('/users/me', {
    preValidation: [server.authenticate]
  }, async (request, reply) => {
    const jwtUser = request.user as any;
    const { name, cpf, phone, avatarUrl } = request.body as any;
    
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
      return user;
    } catch (err: any) {
      if (err.code === 'P2002' && err.meta?.target?.includes('cpf')) {
        return reply.status(400).send({ error: 'CPF já cadastrado.' });
      }
      return reply.status(400).send({ error: 'Erro ao atualizar perfil.' });
    }
  });

  server.post('/users/me/password', {
    preValidation: [server.authenticate]
  }, async (request, reply) => {
    const jwtUser = request.user as any;
    const { currentPassword, newPassword } = request.body as any;

    if (!currentPassword || !newPassword) {
      return reply.status(400).send({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    const user = await prisma.user.findUnique({ where: { id: jwtUser.id } });
    if (!user) return reply.status(404).send({ error: 'User not found' });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return reply.status(401).send({ error: 'Senha atual incorreta' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: jwtUser.id },
      data: { password: hashed }
    });

    return { success: true };
  });
}
