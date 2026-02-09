import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// GET /api/buy-token - Datos para la página Buy Token
router.get("/buy-token", async (req, res) => {
    try {
        const userId = "test-user-id"; // Temporal, luego usarás auth

        // 1. Obtener usuario y su balance
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                tokens: true,
            },
        });

        // 2. Obtener ronda actual
        const currentRound = await prisma.round.findFirst({
            where: { status: "RUNNING" },
            orderBy: { roundNumber: "desc" },
        });

        if (!currentRound) {
            return res.status(404).json({ error: "No active round found" });
        }

        // 3. Balance del usuario
        const tokenBalance = user?.tokens?.[0] || {
            totalTokens: 0,
            totalContributed: 0,
        };

        // 4. Construir respuesta
        const response = {
            user: {
                id: user?.id,
                walletAddress: user?.walletAddress,
                emailVerified: user?.emailVerified,
                kycStatus: user?.kycStatus,
            },
            tokenBalance: {
                balance: tokenBalance.totalTokens,
                contribution: tokenBalance.totalContributed,
            },
            currentRound: {
                roundNumber: currentRound.roundNumber,
                tokenPrice: currentRound.tokenPrice,
                bonusPercentage: currentRound.bonusPercentage,
                minContribution: currentRound.minContribution,
                endDate: currentRound.endDate,
                raisedAmount: currentRound.raisedAmount,
                totalTokens: currentRound.totalTokens,
            },
        };

        res.json(response);
    } catch (error) {
        console.error("Buy Token error:", error);
        res.status(500).json({
            error: "Error fetching buy token data",
            message: error.message,
        });
    }
});

export default router;