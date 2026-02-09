import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seed...");

    // 1. Crear usuario de prueba
    const user = await prisma.user.upsert({
        where: { email: "oto@test.com" },
        update: {},
        create: {
            id: "test-user-id",
            email: "oto@test.com",
            password: "hashed_password",
            fullName: "Oto",
            emailVerified: true,
            kycStatus: "NOT_SUBMITTED",
            referralCode: "OTO123",
        },
    });

    console.log("✅ Usuario creado:", user.email);

    // 2. Crear ronda activa
    const round = await prisma.round.upsert({
        where: { roundNumber: 2 },
        update: {},
        create: {
            roundNumber: 2,
            status: "RUNNING",
            tokenPrice: 0.01,
            bonusPercentage: 1,
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-10-31"),
            minContribution: 100,
            totalTokens: 350000,
            soldTokens: 280562.598,
            raisedAmount: 280562.598,
        },
    });

    console.log("✅ Ronda creada:", round.roundNumber);

    // 3. Crear configuración del proyecto
    const config = await prisma.projectConfig.create({
        data: {
            totalTokenSupply: 1000000,
            totalTokensSold: 280562.598,
            totalRaised: 280562.598,
            currentRound: 2,
            isActive: true,
        },
    });

    console.log("✅ Configuración creada");
    console.log("\n🎉 Seed completado!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });