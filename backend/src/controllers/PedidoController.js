import * as PedidoService from "../services/PedidoService.js";

function responderErro(erro, res, next) {
  if (erro.status) {
    return res.status(erro.status).json({ sucesso: false, erro: erro.message });
  }
  return next(erro);
}

function validarId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id < 1) {
    const erro = new Error("O identificador deve ser um inteiro positivo.");
    erro.status = 400;
    throw erro;
  }
  return id;
}

export async function listar(req, res, next) {
  try {
    const dados = await PedidoService.listarPedidos(req.usuario.id);
    return res.status(200).json({ sucesso: true, dados });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function buscar(req, res, next) {
  try {
    const pedidoId = validarId(req.params.id);
    const pedido = await PedidoService.buscarPedido(req.usuario.id, pedidoId);
    if (!pedido) {
      return res.status(404).json({ sucesso: false, erro: "Pedido não encontrado." });
    }
    return res.status(200).json({ sucesso: true, dados: pedido });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function criar(req, res, next) {
  if (req.usuario.cargo !== "USUARIO") {
    return res.status(403).json({
      sucesso: false,
      erro: "Somente usuários podem criar pedidos.",
    });
  }

  try {
    const pedido = await PedidoService.criarPedido(req.usuario.id, req.body?.itens);
    return res.status(201).json({ sucesso: true, dados: pedido });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}
