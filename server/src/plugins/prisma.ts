import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

// O Cloudflare passa a D1 binding pelo evento fetch (env.DB)
export function getPrisma(env: any) {
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
}
