import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/client/client.js';

const adapter = new PrismaPg({ connectionString: process.env.PG_DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const globalForPrisma = global as unknown as { prisma: typeof prisma };

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };
