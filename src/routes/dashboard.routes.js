import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// GET /api/dashboard - Obtiene todos los datos del dashboard
router.get("/dashboard", async (req, res) => {
    try {
        // Usuario de prueba temporal
        const userId = "test-user-id";

        // 1. Obtener usuario
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                emailVerified: true,
                kycStatus: true,
                walletAddress: true,
            },
        });

        // Si no existe el usuario, retornar error
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 2. Obtener balance de tokens
        let tokenBalance = await prisma.token.findUnique({
            where: { userId },
        });

        // Si no tiene tokens, crear registro con valores en 0
        if (!tokenBalance) {
            tokenBalance = {
                totalTokens: 0,
                purchasedTokens: 0,
                referralTokens: 0,
                bonusTokens: 0,
                totalContributed: 0,
            };
        }

        // 3. Obtener ronda actual
        const currentRound = await prisma.round.findFirst({
            where: { status: "RUNNING" },
            orderBy: { roundNumber: "desc" },
        });

        // 4. Obtener progreso de ventas
        const projectConfig = await prisma.projectConfig.findFirst();

        const salesProgress = {
            raisedAmount: currentRound?.raisedAmount || 0,
            totalTokens: currentRound?.totalTokens || 0,
            percentage: currentRound
                ? ((currentRound.raisedAmount / currentRound.totalTokens) * 100).toFixed(2)
                : 0,
        };

        // 5. Construir respuesta
        const response = {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                emailVerified: user.emailVerified,
                kycStatus: user.kycStatus,
                walletAddress: user.walletAddress,
            },
            tokenBalance: {
                totalTokens: tokenBalance.totalTokens,
                purchasedTokens: tokenBalance.purchasedTokens,
                referralTokens: tokenBalance.referralTokens,
                bonusTokens: tokenBalance.bonusTokens,
                totalContributed: tokenBalance.totalContributed,
                equivalentUSDT: tokenBalance.totalTokens * (currentRound?.tokenPrice || 0),
            },
            currentRound: currentRound
                ? {
                    roundNumber: currentRound.roundNumber,
                    status: currentRound.status,
                    tokenPrice: currentRound.tokenPrice,
                    bonusPercentage: currentRound.bonusPercentage,
                    endDate: currentRound.endDate,
                    minContribution: currentRound.minContribution,
                    soldTokens: currentRound.soldTokens,
                    totalTokens: currentRound.totalTokens,
                }
                : null,
            salesProgress,
        };

        res.json(response);
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({
            error: "Error fetching dashboard data",
            message: error.message
        });
    }
});

export default router;