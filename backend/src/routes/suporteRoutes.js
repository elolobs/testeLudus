import { Router } from "express";
import { autenticar } from "../middlewares/AuthMiddleware.js";
import * as SuporteController from "../controllers/SuporteController.js";

const router = Router();

function autenticacaoOpcional(req, res, next) {
  if (!req.headers.authorization) return next();
  return autenticar(req, res, next);
}

router.post("/", autenticacaoOpcional, SuporteController.criar);
router.get("/meus-chamados", autenticar, SuporteController.listarMeusChamados);
router.post(
  "/meus-chamados/:id/mensagens",
  autenticar,
  SuporteController.enviarMensagemCliente,
);

export default router;
