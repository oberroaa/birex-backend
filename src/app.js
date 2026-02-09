import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import buyTokenRoutes from "./routes/buyToken.routes.js"; // NUEVO
import transactionsRoutes from "./routes/transactions.routes.js";
const app = express();

// Middlewares
app.use(cors({
    origin: "http://localhost:5173", // URL de tu frontend Vite
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api", healthRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", buyTokenRoutes); // NUEVO
app.use("/api", transactionsRoutes);

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
