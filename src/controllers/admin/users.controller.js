import prisma from '../../lib/prisma.js';

export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', kycStatus } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = {};

        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (kycStatus) {
            where.kycStatus = kycStatus;
        }

        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    kycStatus: true,
                    createdAt: true,
                    tokens: {
                        select: {
                            totalTokens: true
                        }
                    }
                    // lastLogin not in schema, omitting
                }
            }),
            prisma.user.count({ where })
        ]);

        // Format users to flatten tokens
        const formattedUsers = users.map(user => ({
            ...user,
            tokens: user.tokens.reduce((acc, curr) => acc + curr.totalTokens, 0)
        }));

        res.json({
            success: true,
            data: formattedUsers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / take)
            }
        });
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                tokens: true,
                transactions: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                },
                contributions: true
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateKycStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { kycStatus } = req.body;

        if (!['APPROVED', 'REJECTED', 'PENDING'].includes(kycStatus)) {
            return res.status(400).json({ success: false, error: "Invalid KYC Status" });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { kycStatus }
        });

        res.json({ success: true, message: "KYC Status updated", data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
