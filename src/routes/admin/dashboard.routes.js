import { Router } from "express";
import prisma from "../../lib/prisma.js";

const router = Router();

// GET /api/admin/dashboard/stats
router.get("/dashboard/stats", async (req, res) => {
    try {
        // 1. Estadísticas generales
        const stats = await prisma.projectConfig.findFirst();
        const totalUsers = await prisma.user.count();

        // Usuarios última semana (esto es aproximado sin campos complejos)
        const lastWeekUsers = await prisma.user.count({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        });

        // 2. Ronda actual
        const currentRound = await prisma.round.findFirst({
            where: { status: "RUNNING" },
            orderBy: { roundNumber: "desc" }
        });

        const response = {
            totalTokensSold: stats?.totalTokensSold || 0,
            tokensSoldLastWeek: 0, // Placeholder
            totalUsers: totalUsers,
            newUsersLastWeek: lastWeekUsers,
            totalRaised: stats?.totalRaised || 0,
            raisedByCrypto: stats?.totalRaised || 0,
            currentRound: currentRound ? {
                roundNumber: currentRound.roundNumber,
                tokenPrice: currentRound.tokenPrice,
                soldTokens: currentRound.soldTokens,
                totalTokens: currentRound.totalTokens,
                soldPercentage: (currentRound.soldTokens / currentRound.totalTokens) * 100
            } : null
        };

        res.json(response);
    } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({ error: "Failed to fetch admin statistics" });
    }
});

export default router;
