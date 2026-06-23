import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { courseRoutes } from './routes/courses.js';
import { paymentRoutes } from './routes/payments.js';
import { voucherRoutes } from './routes/vouchers.js';
import { companyRoutes } from './routes/companies.js';
import { adminRoutes } from './routes/admin.js';
import { classroomRoutes } from './routes/classroom.js';
import { certificateRoutes } from './routes/certificates.js';
import { analyticsRoutes } from './routes/analytics.js';
import { ecommerceRoutes } from './routes/ecommerce.js';
import { webhookRoutes } from './routes/webhooks.js';

dotenv.config();

const server = fastify({ logger: true });

// Declare authenticate method on fastify instance
declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requirePermission: (permission: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

// Plugins
server.register(cors, { origin: '*' });

server.register(multipart, {
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

server.register(fastifyStatic, {
  root: path.join(__dirname, '../uploads'),
  prefix: '/uploads/',
});

server.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret'
});

server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

server.decorate('requirePermission', (permission: string) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const user = request.user as any;
      
      if (user.role !== 'admin') {
        return reply.status(403).send({ error: 'Acesso negado: Requer privilégios de administrador.' });
      }

      if (user.permissions) {
        const perms = JSON.parse(user.permissions);
        if (!perms.includes(permission)) {
          return reply.status(403).send({ error: `Acesso negado: Requer permissão '${permission}'.` });
        }
      }
    } catch (err) {
      reply.send(err);
    }
  };
});

server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// Routes
server.register(authRoutes);
server.register(userRoutes);
server.register(courseRoutes);
server.register(paymentRoutes);
server.register(voucherRoutes);
server.register(companyRoutes);
server.register(adminRoutes);
server.register(classroomRoutes);
server.register(certificateRoutes);
server.register(analyticsRoutes);
server.register(ecommerceRoutes);
server.register(webhookRoutes);

server.get('/health', async (request, reply) => {
  return { status: 'ok', message: 'SafeTrain API is running' };
});

const start = async () => {
  try {
    await server.listen({ port: 3333, host: '0.0.0.0' });
    console.log('Server running at http://localhost:3333');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
