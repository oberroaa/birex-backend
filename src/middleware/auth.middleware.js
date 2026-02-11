import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const authMiddleware = async (req, res, next) => {
    try {
        // 🔓 MODO DESARROLLO: Bypass autenticación
        if (process.env.NODE_ENV === 'development') {
            // Usuario de prueba por defecto (el del seed)
            const user = await prisma.user.findUnique({
                where: { email: "oto@test.com" }
            });

            if (user) {
                req.user = user;
                return next();
            }
        }

        // Autenticación normal (para producción)
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret");

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
};

export default authMiddleware;