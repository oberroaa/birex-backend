import prisma from '../../lib/prisma.js';

// Get all KYC applications with filters
export const getAllKyc = async (req, res) => {
    try {
        const { status, docType, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = {};

        // Filter by status if provided
        if (status && status !== 'ALL') {
            where.kycStatus = status;
        }

        // Get users with KYC documents
        const [users, total] = await Promise.all([
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
                    updatedAt: true,
                    kycDocuments: {
                        orderBy: { submittedAt: 'desc' },
                        take: 1
                    }
                }
            }),
            prisma.user.count({ where })
        ]);

        // Format response
        const formattedData = users.map(user => {
            const kycDoc = user.kycDocuments[0];
            return {
                id: user.id,
                userId: user.id,
                userName: user.fullName,
                email: user.email,
                docType: kycDoc?.docType || 'Not submitted',
                documents: {
                    document: !!kycDoc?.docFront,
                    frontSide: !!kycDoc?.docFront,
                    backSide: !!kycDoc?.docBack,
                    proof: !!kycDoc?.docSelfie
                },
                submittedDate: kycDoc?.submittedAt
                    ? new Date(kycDoc.submittedAt).toLocaleString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })
                    : 'Not submitted',
                status: user.kycStatus,
                kycDocumentId: kycDoc?.id
            };
        });

        res.json({
            success: true,
            data: formattedData,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / take)
            }
        });

    } catch (error) {
        console.error('Get All KYC Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get pending KYC (legacy endpoint - mantener por compatibilidad)
export const getPendingKyc = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { kycStatus: 'PENDING' },
            select: {
                id: true,
                email: true,
                fullName: true,
                kycStatus: true,
                createdAt: true,
                kycDocuments: true
            }
        });

        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get KYC details by user ID
export const getKycDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                kycDocuments: {
                    orderBy: { submittedAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        const kycDoc = user.kycDocuments[0];

        // Format response
        const response = {
            userId: user.id,
            userName: user.fullName,
            email: user.email,
            status: user.kycStatus,
            submittedOn: kycDoc?.submittedAt
                ? new Date(kycDoc.submittedAt).toLocaleString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })
                : null,
            checkedOn: kycDoc?.updatedAt && user.kycStatus !== 'PENDING'
                ? new Date(kycDoc.updatedAt).toLocaleString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })
                : null,
            personalInfo: {
                firstName: kycDoc?.firstName || '',
                lastName: kycDoc?.lastName || '',
                email: user.email,
                phoneNumber: user.mobile || '',
                dateOfBirth: user.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '',
                fullAddress: '', // Agregar si existe en tu modelo
                countryOfResidence: user.nationality || '',
                walletType: 'litecoin', // Hardcoded por ahora
                walletAddress: user.walletAddress || '',
                telegramUsername: '' // Agregar si existe en tu modelo
            },
            documents: {
                docType: kycDoc?.docType || '',
                docNumber: kycDoc?.docNumber || '',
                docFront: kycDoc?.docFront || null,
                docBack: kycDoc?.docBack || null,
                docSelfie: kycDoc?.docSelfie || null
            },
            rejectionReason: kycDoc?.rejectionReason || null
        };

        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Get KYC Details Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update KYC status (Approve/Reject)
export const updateKycStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, rejectionReason } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: "Invalid status. Must be APPROVED or REJECTED"
            });
        }

        // Update user KYC status
        const user = await prisma.user.update({
            where: { id: userId },
            data: { kycStatus: status }
        });

        // Update KYC document if rejection reason provided
        if (status === 'REJECTED' && rejectionReason) {
            const kycDoc = await prisma.kycDocument.findFirst({
                where: { userId },
                orderBy: { submittedAt: 'desc' }
            });

            if (kycDoc) {
                await prisma.kycDocument.update({
                    where: { id: kycDoc.id },
                    data: {
                        status: 'REJECTED',
                        rejectionReason
                    }
                });
            }
        } else if (status === 'APPROVED') {
            const kycDoc = await prisma.kycDocument.findFirst({
                where: { userId },
                orderBy: { submittedAt: 'desc' }
            });

            if (kycDoc) {
                await prisma.kycDocument.update({
                    where: { id: kycDoc.id },
                    data: { status: 'APPROVED' }
                });
            }
        }

        res.json({
            success: true,
            message: `KYC ${status.toLowerCase()} successfully`,
            data: user
        });

    } catch (error) {
        console.error('Update KYC Status Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
