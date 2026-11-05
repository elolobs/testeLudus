import { Router } from "express";
import { autenticar } from "../middlewares/AuthMiddleware.js";
import { criarRecursoController } from "../controllers/RecursoController.js";
import * as RecursoService from "../services/RecursoService.js";

const router = Router();

function autenticacaoOpcional(req, res, next) {
  if (!req.headers.authorization) return next();
  return autenticar(req, res, next);
}

for (const caminho of [
  "usuarios",
  "categorias",
  "eventos",
  "equipe-evento",
  "atividades",
  "tipos-ingresso",
  "pedidos",
  "itens-pedido",
  "ingressos",
  "lista-espera",
]) {
  RecursoService.obterRecurso(caminho);
  const controller = criarRecursoController(caminho);
  const rotasRecurso = Router();
  rotasRecurso.use(autenticacaoOpcional);
  rotasRecurso.get("/", controller.listar);
  rotasRecurso.get("/:id", controller.buscar);
  rotasRecurso.post("/", controller.criar);
  rotasRecurso.put("/:id", controller.atualizar);
  rotasRecurso.patch("/:id", controller.atualizar);
  rotasRecurso.delete("/:id", controller.excluir);
  router.use(`/${caminho}`, rotasRecurso);
}

export default router;
