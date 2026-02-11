import prisma from '../../lib/prisma.js';

export const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

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
                tokens: true
            }
        });

        const tokensSoldLastWeek = tokenStatsLastWeek._sum.tokens || 0;

        // 3. Raised by Crypto
        // Group by currency and sum amount for COMPLETED PURCHASE transactions
        const cryptoStats = await prisma.transaction.groupBy({
            by: ['currency'],
            where: {
                status: 'COMPLETED',
                type: 'PURCHASE'
            },
            _sum: {
                amount: true
            }
        });

        const raisedByCrypto = {
            ETH: 0,
            BTC: 0,
            LTC: 0,
            USDT: 0
        };

        cryptoStats.forEach(stat => {
            if (raisedByCrypto[stat.currency] !== undefined) {
                raisedByCrypto[stat.currency] = stat._sum.amount || 0;
            } else {
                raisedByCrypto[stat.currency] = stat._sum.amount || 0;
            }
        });

        // 4. Current Round
        const currentRound = await prisma.round.findFirst({
            where: {
                status: 'RUNNING' // Assuming 'RUNNING' is the active status
            }
        }); // Or find upcoming if no running

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

        res.json({
            success: true,
            totalUsers,
            newUsersLastWeek,
            totalTokensSold,
            tokensSoldLastWeek,
            totalRaised,
            raisedByCrypto,
            currentRound: roundData
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
