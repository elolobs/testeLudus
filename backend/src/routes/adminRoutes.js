
import { Router } from "express";
import { obterDashboard } from "../controllers/AdminController.js";
import {
  autenticar,
  autorizarAdmin,
} from "../middlewares/AuthMiddleware.js";

const router = Router();

router.get("/dashboard", autenticar, autorizarAdmin, obterDashboard);

export default router;