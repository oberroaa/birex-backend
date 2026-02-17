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
                    emailVerified: true,
                    lastLogin: true,
                    role: true,
                    tokens: {
                        select: {
                            totalTokens: true
                        }
                    }
                }
            }),
            prisma.user.count({ where })
        ]);

        // Format users to flatten tokens
        const formattedUsers = users.map(user => ({
            id: user.id,
            userId: user.id,
            name: user.fullName,
            email: user.email,
            tokens: user.tokens && user.tokens.length > 0
                ? user.tokens.reduce((acc, curr) => acc + (curr.totalTokens || 0), 0)
                : 0,
            emailVerified: user.emailVerified,
            kycVerified: user.kycStatus === 'APPROVED',
            lastLogin: user.lastLogin
                ? new Date(user.lastLogin).toLocaleString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })
                : 'Not logged yet',
            status: 'Active',
            role: user.role
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

        // Calcular total tokens
        const totalTokens = user.tokens ? user.tokens.totalTokens : 0;

        // Calcular total contributed
        const totalContributed = user.transactions
            .filter(tx => tx.status === 'COMPLETED' && tx.type === 'PURCHASE')
            .reduce((acc, curr) => acc + (curr.usdtAmount || 0), 0);

        // Obtener referidor si existe
        let referredByData = null;
        if (user.referredBy) {
            const referrer = await prisma.user.findUnique({
                where: { id: user.referredBy },
                select: { id: true, fullName: true }
            });
            if (referrer) {
                referredByData = {
                    id: referrer.id,
                    name: referrer.fullName
                };
            }
        }

        // Formatear respuesta
        const formattedUser = {
            id: user.id,
            userId: user.id,
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            dateOfBirth: user.dateOfBirth
                ? new Date(user.dateOfBirth).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                })
                : null,
            nationality: user.nationality,
            walletAddress: user.walletAddress,
            emailVerified: user.emailVerified,
            kycStatus: user.kycStatus,
            role: user.role,
            tokenBalance: totalTokens,
            contributed: totalContributed,
            status: 'ACTIVE',
            joiningDate: new Date(user.createdAt).toLocaleString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            referredBy: referredByData,
            referralCode: user.referralCode,
            twoFactorEnabled: user.twoFactorEnabled,
            lastLogin: user.lastLogin
                ? new Date(user.lastLogin).toLocaleString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })
                : null
        };

        res.json({ success: true, data: formattedUser });
    } catch (error) {
        console.error("Get User By ID Error:", error);
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
