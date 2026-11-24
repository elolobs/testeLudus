import { Router } from "express";
import { autenticar } from "../middlewares/AuthMiddleware.js";
import * as PerfilController from "../controllers/PerfilController.js";

const router = Router();

router.use(autenticar);
router.get("/", PerfilController.buscar);
router.put("/", PerfilController.atualizar);

export default router;
