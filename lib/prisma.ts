import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const cached = globalForPrisma.prisma;
const hasUserDelegate = Boolean(cached && 'user' in cached && cached.user);

export const prisma = hasUserDelegate ? cached! : new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
