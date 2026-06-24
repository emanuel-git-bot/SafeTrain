import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { Bindings } from '../server.js';

export type UserPayload = {
  id: number;
  role: string;
  companyId: number | null;
  permissions: string | null;
};

export const authenticate = createMiddleware<{ Bindings: Bindings, Variables: { user: UserPayload } }>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.split(' ')[1];
  let payload;
  try {
    payload = await verify(token, c.env.JWT_SECRET || 'supersecret', 'HS256');
  } catch (e: any) {
    return c.json({ error: 'Invalid token', details: e.message }, 401);
  }
  c.set('user', payload as UserPayload);
  await next();
});

export const requireAdmin = createMiddleware<{ Bindings: Bindings, Variables: { user: UserPayload } }>(async (c, next) => {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  if (user.role !== 'admin') {
    return c.json({ error: 'Acesso negado: Requer privilégios de administrador.' }, 403);
  }
  await next();
});

export const requirePermission = (permission: string) => {
  return createMiddleware<{ Bindings: Bindings, Variables: { user: UserPayload } }>(async (c, next) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    if (user.role !== 'admin') {
      return c.json({ error: 'Acesso negado: Requer privilégios de administrador.' }, 403);
    }
    if (user.permissions) {
      const perms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
      if (!perms.includes(permission)) {
        return c.json({ error: `Acesso negado: Requer permissão '${permission}'.` }, 403);
      }
    }
    await next();
  });
};
