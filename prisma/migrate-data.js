import { PrismaClient } from '@prisma/client';

// Conexión local
const prismaLocal = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:2785@localhost:5432/birex_db?schema=public"
        }
    }
});

// Conexión Neon
const prismaNeon = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_nbh1FHD5kXZE@ep-shy-firefly-aif5qtba.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
        }
    }
});

async function migrateData() {
    try {
        // Ejemplo: Migrar usuarios
        const users = await prismaLocal.user.findMany();

        for (const user of users) {
            await prismaNeon.user.create({
                data: user
            });
        }

        console.log('✅ Datos migrados exitosamente');
    } catch (error) {
        console.error('❌ Error migrando datos:', error);
    } finally {
        await prismaLocal.$disconnect();
        await prismaNeon.$disconnect();
    }
}

migrateData();