import prisma from '../../lib/prisma.js';

export const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last15Days = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

        // 1. User Stats
        const totalUsers = await prisma.user.count();
        const newUsersLastWeek = await prisma.user.count({
            where: { createdAt: { gte: lastWeek } }
        });

        // 2. Token Stats (from Completed Purchase Transactions)
        const tokenStats = await prisma.transaction.aggregate({
            where: {
                status: 'COMPLETED',
                type: 'PURCHASE'
            },
            _sum: {
                tokens: true,
                usdtAmount: true
            }
        });

        const totalTokensSold = tokenStats._sum.tokens || 0;
        const totalRaised = tokenStats._sum.usdtAmount || 0;

        const tokenStatsLastWeek = await prisma.transaction.aggregate({
            where: {
                status: 'COMPLETED',
                type: 'PURCHASE',
                createdAt: { gte: lastWeek }
            },
            _sum: {
                tokens: true,
                usdtAmount: true
            }
        });

        const tokensSoldLastWeek = tokenStatsLastWeek._sum.tokens || 0;
        const raisedLastWeek = tokenStatsLastWeek._sum.usdtAmount || 0;

        // 3. Current Round
        const currentRound = await prisma.round.findFirst({
            where: {
                status: 'RUNNING'
            },
            orderBy: {
                roundNumber: 'desc'
            }
        });

        let roundData = null;
        if (currentRound) {
            roundData = {
                roundNumber: currentRound.roundNumber,
                totalTokens: currentRound.totalTokens,
                soldTokens: currentRound.soldTokens,
                soldPercentage: currentRound.totalTokens > 0
                    ? (currentRound.soldTokens / currentRound.totalTokens) * 100
                    : 0
            };
        }

        // 4. Recent Transactions
        const recentTransactions = await prisma.transaction.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                tranxNo: true,
                tokens: true,
                usdtAmount: true,
                createdAt: true,
                status: true,
                type: true
            }
        });

        // 5. Registrations History (Last 15 days)
        const registrations = await prisma.user.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: last15Days }
            },
            _count: {
                id: true
            }
        });

        // Format registrations by day
        const regHistory = [];
        for (let i = 14; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const count = registrations
                .filter(r => r.createdAt.toISOString().split('T')[0] === dateStr)
                .reduce((acc, curr) => acc + curr._count.id, 0);

            regHistory.push({
                name: (15 - i).toString(),
                users: count
            });
        }

        // 6. Token Sale History (Last 15 days)
        const sales = await prisma.transaction.groupBy({
            by: ['createdAt'],
            where: {
                status: 'COMPLETED',
                type: 'PURCHASE',
                createdAt: { gte: last15Days }
            },
            _sum: {
                tokens: true
            }
        });

        const saleHistory = [];
        for (let i = 14; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const sum = sales
                .filter(s => s.createdAt.toISOString().split('T')[0] === dateStr)
                .reduce((acc, curr) => acc + curr._sum.tokens, 0);

            saleHistory.push({
                day: 15 - i,
                value: sum
            });
        }

        res.json({
            success: true,
            stats: {
                totalUsers,
                newUsersLastWeek,
                totalTokensSold,
                tokensSoldLastWeek,
                totalRaised,
                raisedLastWeek
            },
            currentRound: roundData,
            recentTransactions: recentTransactions.map(tx => ({
                id: tx.tranxNo,
                date: tx.createdAt.toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                amount: `+${tx.tokens} BRX`,
                usdt: `${tx.usdtAmount} USDT`,
                status: tx.status,
                type: tx.type
            })),
            regHistory,
            saleHistory
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
