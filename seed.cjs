const { PrismaClient } = require("@prisma/client");

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
    const config = await prisma.projectConfig.upsert({
        where: { id: "default-config" },
        update: {},
        create: {
            id: "default-config",
            totalTokenSupply: 1000000,
            totalTokensSold: 280562.598,
            totalRaised: 280562.598,
            currentRound: 2,
            isActive: true,
        },
    });

    console.log("✅ Configuración creada");

    // 4. Crear transacciones de prueba
    const transactions = await prisma.transaction.createMany({
        data: [
            {
                tranxNo: "TNX000707",
                userId: user.id,
                roundId: round.id,
                tokens: 26500,
                amount: 250,
                usdtAmount: 250,
                currency: "USDT",
                type: "PURCHASE",
                status: "CANCELLED",
                walletTo: "THach...RUKCh",
                paymentMethod: "USDT",
                createdAt: new Date("2026-02-03T18:04:00Z"),
            },
            {
                tranxNo: "TNX000708",
                userId: user.id,
                roundId: round.id,
                tokens: 50000,
                amount: 500,
                usdtAmount: 500,
                currency: "USDT",
                type: "PURCHASE",
                status: "COMPLETED",
                walletTo: "TAddr...XYZW",
                paymentMethod: "USDT",
                createdAt: new Date("2026-02-04T10:30:00Z"),
            },
            {
                tranxNo: "TNX000709",
                userId: user.id,
                roundId: round.id,
                tokens: 5000,
                amount: 0,
                usdtAmount: 0,
                currency: "USDT",
                type: "BONUS",
                status: "COMPLETED",
                walletTo: "TAddr...XYZW",
                createdAt: new Date("2026-02-04T10:31:00Z"),
            },
            {
                tranxNo: "TNX000710",
                userId: user.id,
                roundId: round.id,
                tokens: 10000,
                amount: 100,
                usdtAmount: 100,
                currency: "USDT",
                type: "PURCHASE",
                status: "PENDING",
                walletTo: "TAddr...ABCD",
                paymentMethod: "USDT",
                createdAt: new Date("2026-02-05T14:20:00Z"),
            },
        ],
        skipDuplicates: true,
    });

    console.log("✅ Transacciones creadas:", transactions.count);

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