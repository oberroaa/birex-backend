import prisma from '../../lib/prisma.js';

export const getPendingKyc = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { kycStatus: 'PENDING' },
            select: {
                id: true,
                email: true,
                fullName: true,
                kycStatus: true,
                createdAt: true
            }
        });

        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getKycDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                mobile: true,
                dateOfBirth: true,
                nationality: true,
                walletAddress: true,
                kycStatus: true,
                // Add document URLs if they existed in schema
            }
        });

        if (!user) return res.status(404).json({ success: false, error: "User not found" });

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
