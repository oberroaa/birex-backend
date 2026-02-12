import prisma from '../../lib/prisma.js';

export const getRounds = async (req, res) => {
    try {
        const rounds = await prisma.round.findMany({
            orderBy: { roundNumber: 'asc' }
        });
        res.json({ success: true, data: rounds });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getRoundById = async (req, res) => {
    try {
        const { id } = req.params;
        const round = await prisma.round.findUnique({ where: { id } });
        if (!round) return res.status(404).json({ success: false, error: "Round not found" });
        res.json({ success: true, data: round });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createRound = async (req, res) => {
    try {
        const { roundNumber, tokenPrice, bonusPercentage, totalTokens, startDate, endDate, status } = req.body;

        const round = await prisma.round.create({
            data: {
                roundNumber: parseInt(roundNumber),
                tokenPrice: parseFloat(tokenPrice),
                bonusPercentage: parseInt(bonusPercentage || 0),
                totalTokens: parseFloat(totalTokens),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: status || 'UPCOMING'
            }
        });

        res.json({ success: true, message: "Round created", data: round });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateRound = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Parse dates and numbers if present
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);
        if (data.tokenPrice) data.tokenPrice = parseFloat(data.tokenPrice);
        if (data.totalTokens) data.totalTokens = parseFloat(data.totalTokens);
        if (data.bonusPercentage) data.bonusPercentage = parseInt(data.bonusPercentage);

        const round = await prisma.round.update({
            where: { id },
            data
        });

        res.json({ success: true, message: "Round updated", data: round });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
