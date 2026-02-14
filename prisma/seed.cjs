const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seed with 10 users and new schema data...");

    // 1. Limpiar datos existentes para evitar conflictos
    console.log("🧹 Cleaning database...");
    await prisma.kycDocument.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.token.deleteMany({});
    await prisma.contribution.deleteMany({});
    await prisma.projectConfig.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.round.deleteMany({});

    // 2. Crear Rondas
    console.log("⏳ Seeding rounds...");
    const round1 = await prisma.round.create({
        data: {
            roundNumber: 1,
            status: "COMPLETED",
            tokenPrice: 0.005,
            bonusPercentage: 20,
            startDate: new Date("2025-06-01"),
            endDate: new Date("2025-12-31"),
            minContribution: 50,
            totalTokens: 200000,
            soldTokens: 200000,
            raisedAmount: 1000,
        },
    });

    const round2 = await prisma.round.create({
        data: {
            roundNumber: 2,
            status: "RUNNING",
            tokenPrice: 0.01,
            bonusPercentage: 10,
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-10-31"),
            minContribution: 100,
            totalTokens: 500000,
            soldTokens: 350000,
            raisedAmount: 3500,
        },
    });

    const round3 = await prisma.round.create({
        data: {
            roundNumber: 3,
            status: "UPCOMING",
            tokenPrice: 0.02,
            bonusPercentage: 5,
            startDate: new Date("2026-11-01"),
            endDate: new Date("2027-04-30"),
            minContribution: 200,
            totalTokens: 1000000,
            soldTokens: 0,
            raisedAmount: 0,
        },
    });

    // 3. Crear Usuarios
    console.log("👥 Seeding 10 users...");
    const usersData = [
        {
            id: "user-1",
            email: "oto@test.com",
            password: "hashed_password",
            fullName: "Oto Admin",
            role: "ADMIN",
            emailVerified: true,
            kycStatus: "APPROVED",
            referralCode: "OTO123",
            mobile: "+123456789",
            nationality: "Venezuelan",
            lastLogin: new Date(),
        },
        {
            id: "user-2",
            email: "juan@test.com",
            password: "hashed_password",
            fullName: "Juan Perez",
            role: "INVESTOR",
            emailVerified: true,
            kycStatus: "PENDING",
            referralCode: "JUAN777",
            mobile: "+987654321",
            nationality: "Spanish",
            referredBy: "OTO123",
        },
        {
            id: "user-3",
            email: "maria@test.com",
            password: "hashed_password",
            fullName: "Maria Garcia",
            role: "INVESTOR",
            emailVerified: false,
            kycStatus: "NOT_SUBMITTED",
            referralCode: "MARIA88",
            referredBy: "OTO123",
        },
        {
            id: "user-4",
            email: "pedro@test.com",
            password: "hashed_password",
            fullName: "Pedro Lopez",
            role: "INVESTOR",
            emailVerified: true,
            kycStatus: "REJECTED",
            referralCode: "PEDRO99",
        },
        {
            id: "user-5",
            email: "ana@test.com",
            password: "hashed_password",
            fullName: "Ana Martinez",
            role: "INVESTOR",
            emailVerified: true,
            kycStatus: "APPROVED",
            referralCode: "ANA555",
            mobile: "+1122334455",
            nationality: "Mexican",
        },
        {
            id: "user-6",
            email: "carlos@test.com",
            password: "hashed_password",
            fullName: "Carlos Ruiz",
            role: "INVESTOR",
            emailVerified: true,
            kycStatus: "APPROVED",
            referralCode: "CARLOS10",
            referredBy: "ANA555",
        },
        {
            id: "user-7",
            email: "elena@test.com",
            password: "hashed_password",
            fullName: "Elena Gomez",
            role: "INVESTOR",
            emailVerified: true,
            kycStatus: "PENDING",
            referralCode: "ELENA123",
        },
        {
            id: "user-8",
            email: "luis@test.com",
            password: "hashed_password",
            fullName: "Luis Torres",
            role: "INVESTOR",
            emailVerified: false,
            kycStatus: "NOT_SUBMITTED",
            referralCode: "LUIS99",
        },
        {
            id: "user-9",
            email: "sofia@test.com",
            password: "hashed_password",
            fullName: "Sofia Castro",
            role: "INVESTOR",
            emailVerified: true,
            kycStatus: "APPROVED",
            referralCode: "SOFIA_B",
        },
        {
            id: "user-10",
            email: "ricardo@test.com",
            password: "hashed_password",
            fullName: "Ricardo Diaz",
            role: "INVESTOR",
            emailVerified: true,
            kycStatus: "APPROVED",
            referralCode: "RIC_DIAZ",
        }
    ];

    for (const u of usersData) {
        const user = await prisma.user.create({
            data: u
        });

        // 4. Crear entrada de Token para cada usuario
        let purchased = 0;
        let bonus = 0;
        let referral = 0;
        let contributed = 0;

        if (user.kycStatus === "APPROVED") {
            purchased = Math.floor(Math.random() * 50000) + 1000;
            bonus = purchased * 0.1;
            contributed = purchased * 0.01;
        }

        await prisma.token.create({
            data: {
                userId: user.id,
                purchasedTokens: purchased,
                bonusTokens: bonus,
                referralTokens: referral,
                totalTokens: purchased + bonus + referral,
                totalContributed: contributed,
            }
        });

        // 5. Crear KYC Document si aplica
        if (user.kycStatus !== "NOT_SUBMITTED") {
            await prisma.kycDocument.create({
                data: {
                    userId: user.id,
                    firstName: user.fullName.split(" ")[0],
                    lastName: user.fullName.split(" ")[1] || "Lastname",
                    docType: "Nidcard",
                    docNumber: "ABC" + Math.floor(Math.random() * 1000000),
                    status: user.kycStatus,
                    rejectionReason: user.kycStatus === "REJECTED" ? "Document images are blurry" : null,
                    docFront: "https://via.placeholder.com/600x400?text=ID+Front",
                }
            });
        }
    }

    // 6. Configuración del Proyecto
    console.log("⚙️ Seeding project config...");
    await prisma.projectConfig.create({
        data: {
            id: "default-config",
            totalTokenSupply: 5000000,
            totalTokensSold: 550000,
            totalRaised: 4500,
            currentRound: 2,
            isActive: true,
        },
    });

    // 7. Transacciones de prueba
    console.log("💸 Seeding transactions...");
    const txsData = [
        {
            tranxNo: "TNX0001",
            userId: "user-1",
            roundId: round1.id,
            tokens: 10000,
            amount: 50,
            usdtAmount: 50,
            type: "PURCHASE",
            status: "COMPLETED",
            paymentMethod: "USDT",
            createdAt: new Date("2025-07-10"),
        },
        {
            tranxNo: "TNX0002",
            userId: "user-2",
            roundId: round2.id,
            tokens: 25000,
            amount: 250,
            usdtAmount: 250,
            type: "PURCHASE",
            status: "PENDING",
            paymentMethod: "USDT",
            createdAt: new Date("2026-02-10"),
        },
        {
            tranxNo: "TNX0003",
            userId: "user-5",
            roundId: round2.id,
            tokens: 50000,
            amount: 500,
            usdtAmount: 500,
            type: "PURCHASE",
            status: "APPROVED",
            paymentMethod: "USDT",
            createdAt: new Date("2026-02-12"),
        },
        {
            tranxNo: "TNX0004",
            userId: "user-4",
            roundId: round2.id,
            tokens: 5000,
            amount: 50,
            usdtAmount: 50,
            type: "PURCHASE",
            status: "REJECTED",
            paymentMethod: "USDT",
            createdAt: new Date("2026-02-13"),
        },
        {
            tranxNo: "TNX0005",
            userId: "user-9",
            roundId: round2.id,
            tokens: 1000,
            amount: 0,
            usdtAmount: 0,
            type: "BONUS",
            status: "COMPLETED",
            createdAt: new Date("2026-02-14"),
        }
    ];

    for (const tx of txsData) {
        await prisma.transaction.create({
            data: tx
        });
    }

    // 8. Contribuciones
    console.log("💰 Seeding contributions...");
    await prisma.contribution.createMany({
        data: [
            { userId: "user-1", amount: 50, createdAt: new Date("2025-07-10") },
            { userId: "user-5", amount: 500, createdAt: new Date("2026-02-12") },
            { userId: "user-6", amount: 300, createdAt: new Date("2026-02-13") },
            { userId: "user-9", amount: 150, createdAt: new Date("2026-02-14") },
        ]
    });

    console.log("\n🎉 Seed completado exitosamente con 10 usuarios y datos para todas las tablas!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Error en el seed:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
