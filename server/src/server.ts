import { Hono } from 'hono';
import { cors } from 'hono/cors';
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

export type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Global Middlewares
app.use('*', cors({ origin: '*' }));

// Routes
app.route('/', authRoutes);
app.route('/', userRoutes);
app.route('/', courseRoutes);
app.route('/', paymentRoutes);
app.route('/', voucherRoutes);
app.route('/', companyRoutes);
app.route('/', adminRoutes);
app.route('/', classroomRoutes);
app.route('/', certificateRoutes);
app.route('/', analyticsRoutes);
app.route('/', ecommerceRoutes);
app.route('/', webhookRoutes);

app.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'SafeTrain API is running on Cloudflare Workers (Hono)' });
});

export default app;
