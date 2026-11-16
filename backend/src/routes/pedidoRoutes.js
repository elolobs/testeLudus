import { Router } from "express";
import { autenticar } from "../middlewares/AuthMiddleware.js";
import * as PedidoController from "../controllers/PedidoController.js";

const router = Router();

router.use(autenticar);
router.get("/", PedidoController.listar);
router.get("/:id", PedidoController.buscar);
router.post("/", PedidoController.criar);

export default router;
