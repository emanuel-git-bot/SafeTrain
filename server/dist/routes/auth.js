import { prisma } from '../plugins/prisma.js';
import bcrypt from 'bcryptjs';
export async function authRoutes(server) {
    server.post('/auth/register', async (request, reply) => {
        const { name, email, password, role, area, voucherCode } = request.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return reply.status(400).send({ error: 'Email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        let companyId = null;
        if (voucherCode) {
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
                area
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
        const token = server.jwt.sign({ id: user.id, role: user.role, companyId });
        return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    });
    server.post('/auth/login', async (request, reply) => {
        const { email, password } = request.body;
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
        const token = server.jwt.sign({ id: user.id, role: user.role, companyId });
        return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId } };
    });
}
