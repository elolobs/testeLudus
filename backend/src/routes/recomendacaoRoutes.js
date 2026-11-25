import { Router } from "express";
import { autenticar } from "../middlewares/AuthMiddleware.js";
import * as RecomendacaoController from "../controllers/RecomendacaoController.js";

const router = Router();

router.get("/", autenticar, RecomendacaoController.listar);

export default router;
