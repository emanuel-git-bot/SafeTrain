import { FastifyInstance } from 'fastify';
import { prisma } from '../plugins/prisma.js';
import bcrypt from 'bcryptjs';

export async function authRoutes(server: FastifyInstance) {
  server.post('/auth/register', async (request, reply) => {
    const { name, email, password, role, areaId, voucherCode, companyName, cnpj } = request.body as any;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return reply.status(400).send({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let companyId = null;
    
    if (role === 'company' && companyName && cnpj) {
      const existingCompany = await prisma.company.findUnique({ where: { cnpj } });
      if (existingCompany) {
        return reply.status(400).send({ error: 'CNPJ already exists' });
      }
      const newCompany = await prisma.company.create({
        data: {
          name: companyName,
          cnpj,
          areaId
        }
      });
      companyId = newCompany.id;
    } else if (voucherCode) {
      // Mocked voucher activation
      const voucher = await prisma.voucher.findUnique({ where: { code: voucherCode } });
      if (voucher && voucher.status === 'active') {
        companyId = voucher.companyId;
        await prisma.voucher.update({
          where: { id: voucher.id },
          data: { status: 'used' } // we will link it later below
        });
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'student',
        areaId
      }
    });

    if (companyId) {
      await prisma.companyStudent.create({
        data: {
          userId: user.id,
          companyId
        }
      });
      // updating voucher
      if (voucherCode) {
         await prisma.voucher.update({
          where: { code: voucherCode },
          data: { usedById: user.id } 
        });
      }
    }

    const token = server.jwt.sign({ id: user.id, role: user.role, companyId, permissions: user.permissions });

    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId, permissions: user.permissions } };
  });

  server.post('/auth/login', async (request, reply) => {
    const { email, password } = request.body as any;

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { companyStudent: true }
    });

    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const companyId = user.companyStudent?.companyId || null;
    const token = server.jwt.sign({ id: user.id, role: user.role, companyId, permissions: user.permissions });

    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId, permissions: user.permissions } };
  });
}
