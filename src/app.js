import express from "express";
import cors from "cors";
import healthRoutes from "./routes/user/health.routes.js";
import dashboardRoutes from "./routes/user/dashboard.routes.js";
import buyTokenRoutes from "./routes/user/buyToken.routes.js";
import transactionsRoutes from "./routes/user/transactions.routes.js";
import profileRoutes from "./routes/user/profile.routes.js";
import adminDashboardRoutes from "./routes/admin/dashboard.routes.js";
import adminTransactionsRoutes from "./routes/admin/transactions.routes.js";
import adminKycRoutes from "./routes/admin/kyc.routes.js";
import adminUsersRoutes from "./routes/admin/users.routes.js";
import adminRoundsRoutes from "./routes/admin/rounds.routes.js";

const app = express();

// Middlewares
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas User
app.use("/api/user", healthRoutes);
app.use("/api/user", dashboardRoutes);
app.use("/api/user", buyTokenRoutes);
app.use("/api/user", transactionsRoutes);
app.use("/api/user", profileRoutes);

// Rutas Admin
app.use("/api/admin", adminDashboardRoutes);
app.use("/api/admin/transactions", adminTransactionsRoutes);
app.use("/api/admin/kyc", adminKycRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/admin/rounds", adminRoundsRoutes);

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