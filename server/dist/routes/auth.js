import { Hono } from 'hono';
import { getPrisma } from '../plugins/prisma.js';
import bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';
export const authRoutes = new Hono();
authRoutes.post('/auth/register', async (c) => {
    const prisma = getPrisma(c.env);
    const body = await c.req.json();
    const { name, email, password, role, areaId, voucherCode, companyName, cnpj } = body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return c.json({ error: 'Email already exists' }, 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let companyId = null;
    if (role === 'company' && companyName && cnpj) {
        const existingCompany = await prisma.company.findUnique({ where: { cnpj } });
        if (existingCompany) {
            return c.json({ error: 'CNPJ already exists' }, 400);
        }
        const newCompany = await prisma.company.create({
            data: {
                name: companyName,
                cnpj,
                areaId
            }
        });
        companyId = newCompany.id;
    }
    else if (voucherCode) {
        const voucher = await prisma.voucher.findUnique({ where: { code: voucherCode } });
        if (voucher && voucher.status === 'active') {
            companyId = voucher.companyId;
            await prisma.voucher.update({
                where: { id: voucher.id },
                data: { status: 'used' }
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
        if (voucherCode) {
            await prisma.voucher.update({
                where: { code: voucherCode },
                data: { usedById: user.id }
            });
        }
    }
    const payload = { id: user.id, role: user.role, companyId, permissions: user.permissions };
    const token = await sign(payload, c.env.JWT_SECRET || 'supersecret');
    return c.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId, permissions: user.permissions } });
});
authRoutes.post('/auth/login', async (c) => {
    const prisma = getPrisma(c.env);
    const body = await c.req.json();
    const { email, password } = body;
    const user = await prisma.user.findUnique({
        where: { email },
        include: { companyStudent: true }
    });
    if (!user) {
        return c.json({ error: 'Invalid credentials' }, 401);
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return c.json({ error: 'Invalid credentials' }, 401);
    }
    const companyId = user.companyStudent?.companyId || null;
    const payload = { id: user.id, role: user.role, companyId, permissions: user.permissions };
    const token = await sign(payload, c.env.JWT_SECRET || 'supersecret');
    return c.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId, permissions: user.permissions } });
});
// Google Login Endpoint
authRoutes.post('/auth/google', async (c) => {
    const prisma = getPrisma(c.env);
    const body = await c.req.json();
    const { credential } = body; // The JWT token from Google Sign-In on frontend
    if (!credential) {
        return c.json({ error: 'Missing Google credential' }, 400);
    }
    // NOTE: In production, we should verify the token signature using Google's public keys
    // or a library like google-auth-library (which needs a Cloudflare Workers compat version).
    // For demonstration, we decode the payload:
    const payloadStr = Buffer.from(credential.split('.')[1], 'base64').toString('utf-8');
    const payload = JSON.parse(payloadStr);
    const { email, name, picture } = payload;
    if (!email) {
        return c.json({ error: 'Invalid Google token' }, 400);
    }
    // Check if user exists
    let user = await prisma.user.findUnique({
        where: { email },
        include: { companyStudent: true }
    });
    // If user doesn't exist, auto-register as student
    if (!user) {
        const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
        user = await prisma.user.create({
            data: {
                name: name || 'Google User',
                email,
                password: randomPassword,
                role: 'student',
                avatarUrl: picture
            },
            include: { companyStudent: true }
        });
    }
    const companyId = user.companyStudent?.companyId || null;
    const jwtPayload = { id: user.id, role: user.role, companyId, permissions: user.permissions };
    const token = await sign(jwtPayload, c.env.JWT_SECRET || 'supersecret');
    return c.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId, permissions: user.permissions } });
});
