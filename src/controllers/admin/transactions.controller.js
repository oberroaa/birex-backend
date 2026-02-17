import prisma from '../../lib/prisma.js';

export const getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = {};
        if (status) where.status = status;
        if (type) where.type = type;

        const [transactions, total] = await prisma.$transaction([
            prisma.transaction.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            fullName: true
                        }
                    }
                }
            }),
            prisma.transaction.count({ where })
        ]);

        res.json({
            success: true,
            data: transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / take)
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: { user: true, round: true }
        });

        if (!transaction) return res.status(404).json({ success: false, error: "Transaction not found" });

        // Calculate bonus and total tokens
        const bonusTokens = transaction.tokens * 0.10;
        const totalTokens = transaction.tokens + bonusTokens;

        res.json({
            success: true,
            data: {
                ...transaction,
                bonusTokens,
                totalTokens
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateTransactionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body; // Notes unused in schema, just accepting it

        if (!['APPROVED', 'REJECTED', 'PENDING', 'COMPLETED', 'CANCELLED', 'FAILED'].includes(status)) {
            return res.status(400).json({ success: false, error: "Invalid Status" });
        }

        // Map APPROVED to COMPLETED if that's the intention, or keep schema enum
        // Schema has: PENDING, COMPLETED, CANCELLED, FAILED
        // Helper to map UI 'APPROVED' to 'COMPLETED'
        let dbStatus = status;
        if (status === 'APPROVED') dbStatus = 'COMPLETED';

        const transaction = await prisma.transaction.update({
            where: { id },
            data: { status: dbStatus }
        });

        // If approved, update user's token balance
        if (dbStatus === 'COMPLETED') {
            await prisma.token.upsert({
                where: { userId: transaction.userId },
                update: {
                    purchasedTokens: { increment: transaction.tokens },
                    totalTokens: { increment: transaction.tokens },
                    totalContributed: { increment: transaction.usdtAmount }
                },
                create: {
                    userId: transaction.userId,
                    purchasedTokens: transaction.tokens,
                    totalTokens: transaction.tokens,
                    totalContributed: transaction.usdtAmount
                }
            });
        }

        res.json({ success: true, message: "Transaction updated", data: transaction });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
