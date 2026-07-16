import { PrismaClient } from '@prisma/client'

// Singleton so Next.js hot-reload / serverless invocations don't open a new
// connection pool on every request.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
