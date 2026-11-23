import * as PerfilService from "../services/PerfilService.js";

function responderErro(erro, res, next) {
  if (erro.status) {
    return res.status(erro.status).json({ sucesso: false, erro: erro.message });
  }
  return next(erro);
}

export async function buscar(req, res, next) {
  try {
    const perfil = await PerfilService.buscarPerfil(req.usuario.id);
    if (!perfil) {
      return res.status(404).json({ sucesso: false, erro: "Perfil não encontrado." });
    }
    return res.status(200).json({ sucesso: true, dados: perfil });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}

export async function atualizar(req, res, next) {
  try {
    const perfil = await PerfilService.atualizarPerfil(req.usuario.id, req.body);
    if (!perfil) {
      return res.status(404).json({ sucesso: false, erro: "Perfil não encontrado." });
    }
    return res.status(200).json({ sucesso: true, dados: perfil });
  } catch (erro) {
    return responderErro(erro, res, next);
  }
}
