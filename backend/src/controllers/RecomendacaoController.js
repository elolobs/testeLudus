import * as RecomendacaoService from "../services/RecomendacaoService.js";

export async function listar(req, res, next) {
  try {
    const dados = await RecomendacaoService.listarParaUsuario(req.usuario.id);
    return res.status(200).json({ sucesso: true, dados });
  } catch (erro) {
    return next(erro);
  }
}
