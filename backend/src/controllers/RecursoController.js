import * as RecursoService from "../services/RecursoService.js";

const ESCOPO_USUARIO = new Set([
  "usuarios",
  "pedidos",
  "itens-pedido",
  "ingressos",
  "lista-espera",
]);

function erroHttp(status, mensagem) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

function obterEscopo(recurso, usuario) {
  if (usuario?.cargo === "ADMIN") return { sql: "", valores: [] };

  if (usuario?.cargo === "ORGANIZADOR" && recurso.escopoOrganizador) {
    const valores = recurso.escopoOrganizador.valoresRepetidos
      ? [usuario.id, usuario.id]
      : [usuario.id];
    return { ...recurso.escopoOrganizador, valores };
  }

  if (usuario?.cargo === "USUARIO") {
    if (recurso.escopoUsuario && ESCOPO_USUARIO.has(recurso.caminho)) {
      return {
        ...recurso.escopoUsuario,
        valores: [usuario.id],
      };
    }
    if (recurso.publicamenteLegivel) {
      return {
        sql: recurso.escopoPublico?.sql || "",
        valores: [],
      };
    }
    return null;
  }

  if (usuario?.cargo === "ORGANIZADOR" && recurso.publicamenteLegivel) {
    return {
      sql: recurso.escopoPublico?.sql || "",
      valores: [],
    };
  }

  if (!usuario && recurso.publicamenteLegivel) {
    return {
      sql: recurso.escopoPublico?.sql || "",
      valores: [],
    };
  }

  return null;
}

function exigirEscopo(recurso, usuario) {
  const escopo = obterEscopo(recurso, usuario);
  if (escopo === null) {
    throw erroHttp(403, "Você não tem permissão para acessar este recurso.");
  }
  return escopo;
}

function exigirPermissaoDeEscrita(recurso, usuario, metodo) {
  if (!usuario) {
    throw erroHttp(401, "Autenticação necessária.");
  }

  const campos = RecursoService.camposPermitidos(recurso, usuario.cargo);
  if (campos.length === 0) {
    throw erroHttp(403, "Você não tem permissão para alterar este recurso.");
  }

  if (recurso.criacaoViaCadastro && metodo === "POST") {
    throw erroHttp(405, "Use a rota de cadastro para criar usuários.");
  }

  if (
    usuario.cargo === "USUARIO" &&
    (recurso.caminho !== "usuarios" || metodo !== "PATCH")
  ) {
    throw erroHttp(403, "Usuários podem alterar apenas o próprio perfil com PATCH.");
  }
}

function validarId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id < 1) {
    throw erroHttp(400, "O identificador deve ser um inteiro positivo.");
  }
  return id;
}

async function validarVinculoOrganizador(recurso, dados, usuario) {
  if (usuario.cargo !== "ORGANIZADOR") return;

  if (recurso.tabela === "eventos") {
    if (dados.id === undefined) return;
    if (!await RecursoService.eventoPertenceAoOrganizador(dados.id, usuario.id)) {
      throw erroHttp(403, "Você só pode alterar eventos que organiza.");
    }
    return;
  }

  if (dados.evento_id !== undefined && dados.evento_id !== null) {
    if (!await RecursoService.eventoPertenceAoOrganizador(dados.evento_id, usuario.id)) {
      throw erroHttp(403, "O evento informado não pertence à sua organização.");
    }
  }
  if (
    recurso.tabela === "lista_espera" &&
    dados.atividade_id !== undefined &&
    dados.atividade_id !== null &&
    !await RecursoService.atividadePertenceAoOrganizador(dados.atividade_id, usuario.id)
  ) {
    throw erroHttp(403, "A atividade informada não pertence à sua organização.");
  }
}

function tratarErro(erro, res, next) {
  if (erro.status) {
    return res.status(erro.status).json({ sucesso: false, erro: erro.message });
  }
  return next(erro);
}

export function criarRecursoController(caminho) {
  const recurso = RecursoService.obterRecurso(caminho);

  return {
    listar: async (req, res, next) => {
      try {
        const escopo = exigirEscopo(recurso, req.usuario);
        const resultado = await RecursoService.listar(caminho, req.query, escopo);
        return res.status(200).json({ sucesso: true, ...resultado });
      } catch (erro) {
        return tratarErro(erro, res, next);
      }
    },

    buscar: async (req, res, next) => {
      try {
        const escopo = exigirEscopo(recurso, req.usuario);
        const id = validarId(req.params.id);
        const registro = await RecursoService.buscarPorId(caminho, id, escopo);
        if (!registro) {
          throw erroHttp(404, "Registro não encontrado.");
        }
        return res.status(200).json({ sucesso: true, dados: registro });
      } catch (erro) {
        return tratarErro(erro, res, next);
      }
    },

    criar: async (req, res, next) => {
      try {
        exigirPermissaoDeEscrita(recurso, req.usuario, "POST");
        const corpo = { ...req.body };
        const camposInternos = [];

        if (recurso.tabela === "eventos" && req.usuario.cargo === "ORGANIZADOR") {
          if (Object.hasOwn(corpo, "organizador_id")) {
            throw erroHttp(422, "organizador_id é definido pela sessão autenticada.");
          }
          corpo.organizador_id = req.usuario.id;
          camposInternos.push("organizador_id");
        }

        const dados = RecursoService.validarDados(recurso, corpo, req.usuario.cargo, {
          completo: true,
          camposInternos,
        });
        RecursoService.validarConsistencia(recurso, dados);
        await validarVinculoOrganizador(recurso, dados, req.usuario);
        const registro = await RecursoService.criar(caminho, dados);
        return res.status(201).json({ sucesso: true, dados: registro });
      } catch (erro) {
        return tratarErro(erro, res, next);
      }
    },

    atualizar: async (req, res, next) => {
      try {
        exigirPermissaoDeEscrita(recurso, req.usuario, req.method);
        const escopo = exigirEscopo(recurso, req.usuario);
        const id = validarId(req.params.id);
        const atual = await RecursoService.buscarPorId(caminho, id, escopo);
        if (!atual) {
          throw erroHttp(404, "Registro não encontrado.");
        }

        const dados = RecursoService.validarDados(recurso, req.body, req.usuario.cargo, {
          completo: req.method === "PUT",
        });
        RecursoService.validarConsistencia(recurso, { ...atual, ...dados });
        await validarVinculoOrganizador(recurso, { ...atual, ...dados, id }, req.usuario);
        await RecursoService.atualizar(caminho, id, dados, escopo);
        const registro = await RecursoService.buscarPorId(caminho, id, escopo);
        if (!registro) {
          throw erroHttp(404, "Registro não encontrado.");
        }
        return res.status(200).json({ sucesso: true, dados: registro });
      } catch (erro) {
        return tratarErro(erro, res, next);
      }
    },

    excluir: async (req, res, next) => {
      try {
        exigirPermissaoDeEscrita(recurso, req.usuario, "DELETE");
        const escopo = exigirEscopo(recurso, req.usuario);
        const id = validarId(req.params.id);
        const atual = await RecursoService.buscarPorId(caminho, id, escopo);
        if (!atual) {
          throw erroHttp(404, "Registro não encontrado.");
        }
        await RecursoService.excluir(caminho, id, escopo);
        return res.status(204).send();
      } catch (erro) {
        return tratarErro(erro, res, next);
      }
    },
  };
}
