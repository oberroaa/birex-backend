import express from "express";
import cors from "cors";
import healthRoutes from "./routes/user/health.routes.js";
import dashboardRoutes from "./routes/user/dashboard.routes.js";
import buyTokenRoutes from "./routes/user/buyToken.routes.js"; // NUEVO
import transactionsRoutes from "./routes/user/transactions.routes.js";
import profileRoutes from "./routes/user/profile.routes.js";
import adminDashboardRoutes from "./routes/admin/dashboard.routes.js";
const app = express();

// Middlewares
app.use(cors({
    origin: "http://localhost:5173", // URL de tu frontend Vite
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas User
app.use("/api/user", healthRoutes);
app.use("/api/user", dashboardRoutes);
app.use("/api/user", buyTokenRoutes); // NUEVO
app.use("/api/user", transactionsRoutes);
app.use("/api/user", profileRoutes);

// Rutas Admin
app.use("/api/admin", adminDashboardRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Internal server error",
        message: err.message
    });
});

export default app;
