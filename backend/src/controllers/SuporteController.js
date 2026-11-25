import * as SuporteService from "../services/SuporteService.js";

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

export async function criar(req, res, next) {
  try {
    const chamado = await SuporteService.criarChamado(
      req.body,
      req.usuario?.id ?? null,
    );
    return res.status(201).json({ sucesso: true, chamado });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function listarMeusChamados(req, res, next) {
  try {
    const chamados = await SuporteService.listarChamadosDoUsuario(req.usuario.id);
    return res.status(200).json({ sucesso: true, chamados });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function enviarMensagemCliente(req, res, next) {
  try {
    const chamadoId = validarId(req.params.id);
    const mensagem = await SuporteService.responderComoCliente(
      chamadoId,
      req.usuario.id,
      req.body?.texto,
    );
    return res.status(201).json({ sucesso: true, ...mensagem });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function listarTodos(req, res, next) {
  try {
    const mensagens = await SuporteService.listarTodosChamados();
    return res.status(200).json({ sucesso: true, mensagens });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizarStatus(req, res, next) {
  try {
    const chamadoId = validarId(req.params.id);
    const chamado = await SuporteService.atualizarStatus(
      chamadoId,
      req.body?.status,
    );
    return res.status(200).json({ sucesso: true, chamado });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function responderComoAdmin(req, res, next) {
  try {
    const chamadoId = validarId(req.params.id);
    const resposta = await SuporteService.responderComoAdmin(
      chamadoId,
      req.usuario.id,
      req.body?.resposta,
    );
    return res.status(201).json({ sucesso: true, ...resposta });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}
