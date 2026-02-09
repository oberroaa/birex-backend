import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// GET /api/transactions - Obtener transacciones del usuario
router.get("/transactions", async (req, res) => {
    try {
        const userId = "test-user-id"; // Temporal, luego usarás auth
        const { page = 1, limit = 10, search = "" } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Construir filtros
        const where = {
            userId,
            ...(search && {
                OR: [
                    { tranxNo: { contains: search, mode: "insensitive" } },
                    { walletTo: { contains: search, mode: "insensitive" } },
                ],
            }),
        };

        // Obtener transacciones
        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: "desc" },
                include: {
                    round: {
                        select: {
                            roundNumber: true,
                        },
                    },
                },
            }),
            prisma.transaction.count({ where }),
        ]);

        // Formatear respuesta
        const formattedTransactions = transactions.map((tx) => ({
            id: tx.id,
            tranxNo: tx.tranxNo,
            date: tx.createdAt,
            tokens: tx.tokens,
            amount: tx.amount,
            usdtAmount: tx.usdtAmount,
            currency: tx.currency,
            to: tx.walletTo,
            type: tx.type,
            status: tx.status,
            paymentMethod: tx.paymentMethod,
            roundNumber: tx.round?.roundNumber,
        }));

        res.json({
            transactions: formattedTransactions,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Transactions error:", error);
        res.status(500).json({
            error: "Error fetching transactions",
            message: error.message,
        });
    }
});

export default router;