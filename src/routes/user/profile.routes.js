import { Router } from "express";
import prisma from "../../lib/prisma.js";

const router = Router();

// GET /api/profile - Obtener datos del perfil del usuario
router.get("/profile", async (req, res) => {
    try {
        const userId = "user-1"; // Temporal, luego usarás auth

        // Obtener usuario completo
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                mobile: true,
                dateOfBirth: true,
                nationality: true,
                walletAddress: true,
                emailVerified: true,
                kycStatus: true,
                twoFactorEnabled: true,
                referralCode: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Construir link de referido
        const referralLink = `https://ico.birexchange.com/${user.referralCode}`;

        const response = {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile || "",
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : "",
                nationality: user.nationality || "",
                walletAddress: user.walletAddress,
                emailVerified: user.emailVerified,
                kycStatus: user.kycStatus,
                twoFactorEnabled: user.twoFactorEnabled,
                referralCode: user.referralCode,
                referralLink: referralLink,
                memberSince: user.createdAt,
            },
        };

        res.json(response);
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({
            error: "Error fetching profile data",
            message: error.message,
        });
    }
});

// PUT /api/profile - Actualizar perfil del usuario
router.put("/profile", async (req, res) => {
    try {
        const userId = "user-1"; // Temporal, luego usarás auth
        const { fullName, mobile, dateOfBirth, nationality, walletAddress } = req.body;

        // Validaciones básicas
        if (!fullName || fullName.trim() === "") {
            return res.status(400).json({ error: "Full name is required" });
        }

        // Actualizar usuario
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                fullName: fullName.trim(),
                mobile: mobile || null,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                nationality: nationality || null,
                walletAddress: walletAddress || null,
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                mobile: true,
                dateOfBirth: true,
                nationality: true,
                walletAddress: true,
                emailVerified: true,
                kycStatus: true,
                twoFactorEnabled: true,
                referralCode: true,
            },
        });

        const referralLink = `https://ico.birexchange.com/${updatedUser.referralCode}`;

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedUser.id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                mobile: updatedUser.mobile || "",
                dateOfBirth: updatedUser.dateOfBirth ? updatedUser.dateOfBirth.toISOString().split('T')[0] : "",
                nationality: updatedUser.nationality || "",
                walletAddress: updatedUser.walletAddress,
                emailVerified: updatedUser.emailVerified,
                kycStatus: updatedUser.kycStatus,
                twoFactorEnabled: updatedUser.twoFactorEnabled,
                referralCode: updatedUser.referralCode,
                referralLink: referralLink,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            error: "Error updating profile",
            message: error.message,
        });
    }
});

export default router;