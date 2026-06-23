import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
dotenv.config();
const server = fastify({ logger: true });
// Plugins
server.register(cors, { origin: '*' });
server.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecret'
});
server.decorate('authenticate', async (request, reply) => {
    try {
        await request.jwtVerify();
    }
    catch (err) {
        reply.send(err);
    }
});
server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
});
// Routes
server.register(authRoutes);
server.register(userRoutes);
server.get('/health', async (request, reply) => {
    return { status: 'ok', message: 'SafeTrain API is running' };
});
const start = async () => {
    try {
        await server.listen({ port: 3333, host: '0.0.0.0' });
        console.log('Server running at http://localhost:3333');
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
