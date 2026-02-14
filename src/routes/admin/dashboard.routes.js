import { Router } from "express";
import * as dashboardController from "../../controllers/admin/dashboard.controller.js";

const router = Router();

// GET /api/admin/dashboard/stats
router.get("/stats", dashboardController.getDashboardStats);

export default router;
