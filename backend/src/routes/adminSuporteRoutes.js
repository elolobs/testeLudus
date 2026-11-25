import { Router } from "express";
import {
  autenticar,
  autorizarAdmin,
} from "../middlewares/AuthMiddleware.js";
import * as SuporteController from "../controllers/SuporteController.js";

const router = Router();

router.use(autenticar, autorizarAdmin);
router.get("/", SuporteController.listarTodos);
router.patch("/:id", SuporteController.atualizarStatus);
router.post("/:id/responder", SuporteController.responderComoAdmin);

export default router;
