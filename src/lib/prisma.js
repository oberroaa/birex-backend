// prisma.js - VERSIÓN SIMPLE PARA PRISMA 5
import { PrismaClient } from '@prisma/client';

// ¡Así de simple! No necesita adapter en Prisma 5
const prisma = new PrismaClient({
    // Opcional: logs para desarrollo
    // log: ['query', 'info', 'warn', 'error'],
});

export default prisma;