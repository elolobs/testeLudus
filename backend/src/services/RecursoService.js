import { pool } from "../config/database.js";

const campos = {
  id: { tipo: "inteiro", min: 1 },
  texto: (maximo, extra = {}) => ({ tipo: "texto", maximo, ...extra }),
  inteiro: (extra = {}) => ({ tipo: "inteiro", min: 1, ...extra }),
  numero: (extra = {}) => ({ tipo: "numero", min: 0, ...extra }),
  data: { tipo: "data" },
  booleano: { tipo: "booleano" },
  enum: (valores) => ({ tipo: "enum", valores }),
};

const recursos = {
  usuarios: {
    tabela: "usuarios",
    caminho: "usuarios",
    colunas: [
      "id", "nome_completo", "email", "cpf", "telefone", "cargo", "ativo",
      "termo_lgpd_aceito", "termo_lgpd_data", "criado_em", "atualizado_em",
    ],
    campos: {
      nome_completo: campos.texto(120),
      email: campos.texto(150),
      cpf: campos.texto(14),
      telefone: campos.texto(20, { nullable: true }),
      cargo: campos.enum(["ADMIN", "ORGANIZADOR", "USUARIO"]),
      ativo: campos.booleano,
      termo_lgpd_aceito: campos.booleano,
    },
    obrigatorios: ["nome_completo", "email", "cpf"],
    filtros: ["cargo", "ativo"],
    escopoUsuario: { sql: "id = ?", colunaId: true },
    escrita: {
      ADMIN: ["nome_completo", "email", "cpf", "telefone", "cargo", "ativo", "termo_lgpd_aceito"],
      USUARIO: ["nome_completo", "telefone"],
    },
    publicamenteLegivel: false,
    criacaoViaCadastro: true,
  },
  categorias: {
    tabela: "categorias",
    caminho: "categorias",
    colunas: ["id", "nome", "descricao"],
    campos: {
      nome: campos.texto(100),
      descricao: campos.texto(65535, { nullable: true }),
    },
    obrigatorios: ["nome"],
    filtros: [],
    escrita: { ADMIN: ["nome", "descricao"] },
    publicamenteLegivel: true,
  },
  eventos: {
    tabela: "eventos",
    caminho: "eventos",
    colunas: [
      "id", "organizador_id", "categoria_id", "titulo", "descricao",
      "capacidade_maxima", "status", "data_inicio", "data_fim", "local_nome",
      "local_endereco", "imagem_capa_url", "criado_em", "atualizado_em",
    ],
    campos: {
      organizador_id: campos.inteiro(),
      categoria_id: campos.inteiro(),
      titulo: campos.texto(150),
      descricao: campos.texto(65535),
      capacidade_maxima: campos.inteiro(),
      status: campos.enum(["RASCUNHO", "PUBLICADO", "SUSPENSO", "CANCELADO", "CONCLUIDO"]),
      data_inicio: campos.data,
      data_fim: campos.data,
      local_nome: campos.texto(150),
      local_endereco: campos.texto(65535),
      imagem_capa_url: campos.texto(255, { nullable: true }),
    },
    obrigatorios: [
      "organizador_id", "categoria_id", "titulo", "descricao", "capacidade_maxima",
      "data_inicio", "data_fim", "local_nome", "local_endereco",
    ],
    filtros: ["organizador_id", "categoria_id", "status"],
    escopoOrganizador: { sql: "organizador_id = ?" },
    escrita: {
      ADMIN: [
        "organizador_id", "categoria_id", "titulo", "descricao", "capacidade_maxima",
        "status", "data_inicio", "data_fim", "local_nome", "local_endereco", "imagem_capa_url",
      ],
      ORGANIZADOR: [
        "categoria_id", "titulo", "descricao", "capacidade_maxima", "status",
        "data_inicio", "data_fim", "local_nome", "local_endereco", "imagem_capa_url",
      ],
    },
    escopoPublico: { sql: "status = 'PUBLICADO'" },
    publicamenteLegivel: true,
  },
  equipe_evento: {
    tabela: "equipe_evento",
    caminho: "equipe-evento",
    colunas: ["id", "evento_id", "usuario_id", "funcao", "atribuido_em"],
    campos: {
      evento_id: campos.inteiro(),
      usuario_id: campos.inteiro(),
      funcao: campos.enum(["CO_ORGANIZADOR", "STAFF"]),
    },
    obrigatorios: ["evento_id", "usuario_id", "funcao"],
    filtros: ["evento_id", "usuario_id"],
    escopoOrganizador: { sql: "evento_id IN (SELECT id FROM eventos WHERE organizador_id = ?)" },
    escrita: {
      ADMIN: ["evento_id", "usuario_id", "funcao"],
      ORGANIZADOR: ["evento_id", "usuario_id", "funcao"],
    },
    publicamenteLegivel: false,
  },
  atividades: {
    tabela: "atividades",
    caminho: "atividades",
    colunas: [
      "id", "evento_id", "titulo", "descricao", "tipo", "palestrante",
      "data_hora_inicio", "data_hora_fim", "local_sala", "vagas_maximas", "vagas_ocupadas",
    ],
    campos: {
      evento_id: campos.inteiro(),
      titulo: campos.texto(150),
      descricao: campos.texto(65535, { nullable: true }),
      tipo: campos.texto(50),
      palestrante: campos.texto(150),
      data_hora_inicio: campos.data,
      data_hora_fim: campos.data,
      local_sala: campos.texto(100, { nullable: true }),
      vagas_maximas: campos.inteiro(),
      vagas_ocupadas: campos.inteiro({ min: 0 }),
    },
    obrigatorios: [
      "evento_id", "titulo", "tipo", "palestrante", "data_hora_inicio",
      "data_hora_fim", "vagas_maximas",
    ],
    filtros: ["evento_id"],
    escopoOrganizador: { sql: "evento_id IN (SELECT id FROM eventos WHERE organizador_id = ?)" },
    escopoPublico: { sql: "evento_id IN (SELECT id FROM eventos WHERE status = 'PUBLICADO')" },
    escrita: {
      ADMIN: [
        "evento_id", "titulo", "descricao", "tipo", "palestrante",
        "data_hora_inicio", "data_hora_fim", "local_sala", "vagas_maximas", "vagas_ocupadas",
      ],
      ORGANIZADOR: [
        "evento_id", "titulo", "descricao", "tipo", "palestrante",
        "data_hora_inicio", "data_hora_fim", "local_sala", "vagas_maximas",
      ],
    },
    publicamenteLegivel: true,
  },
  tipo_ingresso: {
    tabela: "tipo_ingresso",
    caminho: "tipos-ingresso",
    colunas: [
      "id", "evento_id", "nome", "preco", "quant_total", "quant_vendida",
      "venda_inicio", "venda_final",
    ],
    campos: {
      evento_id: campos.inteiro(),
      nome: campos.texto(100),
      preco: campos.numero({ nullable: true }),
      quant_total: campos.inteiro(),
      quant_vendida: campos.inteiro({ min: 0 }),
      venda_inicio: { tipo: "data", nullable: true },
      venda_final: { tipo: "data", nullable: true },
    },
    obrigatorios: ["evento_id", "nome", "quant_total"],
    filtros: ["evento_id"],
    escopoOrganizador: { sql: "evento_id IN (SELECT id FROM eventos WHERE organizador_id = ?)" },
    escopoPublico: { sql: "evento_id IN (SELECT id FROM eventos WHERE status = 'PUBLICADO')" },
    escrita: {
      ADMIN: [
        "evento_id", "nome", "preco", "quant_total", "quant_vendida",
        "venda_inicio", "venda_final",
      ],
      ORGANIZADOR: ["evento_id", "nome", "preco", "quant_total", "venda_inicio", "venda_final"],
    },
    publicamenteLegivel: true,
  },
  pedidos: {
    tabela: "pedidos",
    caminho: "pedidos",
    colunas: ["id", "usuario_id", "valor_total", "status", "criado_em"],
    campos: {
      usuario_id: campos.inteiro(),
      valor_total: campos.numero(),
      status: campos.enum(["pendente", "pago", "cancelado", "reservado", "reembolsado"]),
    },
    obrigatorios: ["usuario_id", "valor_total"],
    filtros: ["usuario_id", "status"],
    escopoUsuario: { sql: "usuario_id = ?" },
    escrita: { ADMIN: ["usuario_id", "valor_total", "status"] },
    publicamenteLegivel: false,
  },
  itens_pedido: {
    tabela: "itens_pedido",
    caminho: "itens-pedido",
    colunas: ["id", "pedido_id", "tipo_ingresso_id", "quantidade", "preco_unitario"],
    campos: {
      pedido_id: campos.inteiro(),
      tipo_ingresso_id: campos.inteiro(),
      quantidade: campos.inteiro(),
      preco_unitario: campos.numero(),
    },
    obrigatorios: ["pedido_id", "tipo_ingresso_id", "quantidade", "preco_unitario"],
    filtros: ["pedido_id", "tipo_ingresso_id"],
    escopoUsuario: { sql: "pedido_id IN (SELECT id FROM pedidos WHERE usuario_id = ?)" },
    escrita: { ADMIN: ["pedido_id", "tipo_ingresso_id", "quantidade", "preco_unitario"] },
    publicamenteLegivel: false,
  },
  ingressos: {
    tabela: "ingressos",
    caminho: "ingressos",
    colunas: [
      "id", "pedido_id", "tipo_ingresso_id", "usuario_id", "quantidade",
      "status", "preco_unitario",
    ],
    campos: {
      pedido_id: campos.inteiro(),
      tipo_ingresso_id: campos.inteiro(),
      usuario_id: campos.inteiro(),
      quantidade: campos.inteiro(),
      status: campos.enum(["valido", "utilizado", "cancelado"]),
      preco_unitario: campos.numero(),
    },
    obrigatorios: [
      "pedido_id", "tipo_ingresso_id", "usuario_id", "quantidade", "preco_unitario",
    ],
    filtros: ["pedido_id", "tipo_ingresso_id", "usuario_id", "status"],
    escopoUsuario: { sql: "usuario_id = ?" },
    escrita: {
      ADMIN: [
        "pedido_id", "tipo_ingresso_id", "usuario_id", "quantidade", "status", "preco_unitario",
      ],
    },
    publicamenteLegivel: false,
  },
  lista_espera: {
    tabela: "lista_espera",
    caminho: "lista-espera",
    colunas: [
      "id", "usuario_id", "evento_id", "atividade_id", "posicao", "status",
      "data_notificacao", "data_limite_resposta", "criado_em",
    ],
    campos: {
      usuario_id: campos.inteiro(),
      evento_id: campos.inteiro({ nullable: true }),
      atividade_id: campos.inteiro({ nullable: true }),
      posicao: campos.inteiro(),
      status: campos.enum(["AGUARDANDO", "NOTIFICADO", "EXPIRADO", "CONVERTIDO", "CANCELADO"]),
      data_notificacao: { tipo: "data", nullable: true },
      data_limite_resposta: { tipo: "data", nullable: true },
    },
    obrigatorios: ["usuario_id", "posicao"],
    filtros: ["usuario_id", "evento_id", "atividade_id", "status"],
    escopoUsuario: { sql: "usuario_id = ?" },
    escopoOrganizador: {
      sql: "evento_id IN (SELECT id FROM eventos WHERE organizador_id = ?) OR atividade_id IN (SELECT a.id FROM atividades a JOIN eventos e ON e.id = a.evento_id WHERE e.organizador_id = ?)",
      valoresRepetidos: true,
    },
    escrita: {
      ADMIN: [
        "usuario_id", "evento_id", "atividade_id", "posicao", "status",
        "data_notificacao", "data_limite_resposta",
      ],
      ORGANIZADOR: [
        "usuario_id", "evento_id", "atividade_id", "posicao", "status",
        "data_notificacao", "data_limite_resposta",
      ],
    },
    publicamenteLegivel: false,
  },
};

const porCaminho = Object.fromEntries(
  Object.entries(recursos).map(([nome, recurso]) => [recurso.caminho, { nome, ...recurso }]),
);

function erroValidacao(mensagem) {
  const erro = new TypeError(mensagem);
  erro.status = 422;
  return erro;
}

function validarValor(nomeCampo, valor, regra) {
  if (valor === null) {
    if (regra.nullable) return null;
    throw erroValidacao(`${nomeCampo} não pode ser nulo.`);
  }

  if (regra.tipo === "texto") {
    if (typeof valor !== "string") {
      throw erroValidacao(`${nomeCampo} deve ser um texto.`);
    }
    const texto = valor.trim();
    if (!texto && !regra.nullable) {
      throw erroValidacao(`${nomeCampo} é obrigatório.`);
    }
    if (texto.length > regra.maximo) {
      throw erroValidacao(`${nomeCampo} deve ter no máximo ${regra.maximo} caracteres.`);
    }
    return texto;
  }

  if (regra.tipo === "inteiro" || regra.tipo === "numero") {
    if (
      (typeof valor !== "number" && typeof valor !== "string") ||
      (typeof valor === "string" && !valor.trim())
    ) {
      throw erroValidacao(`${nomeCampo} possui um valor numérico inválido.`);
    }
    const numero = typeof valor === "number" ? valor : Number(valor);
    if (
      !Number.isFinite(numero) ||
      (regra.tipo === "inteiro" && !Number.isInteger(numero)) ||
      numero < regra.min
    ) {
      throw erroValidacao(`${nomeCampo} possui um valor numérico inválido.`);
    }
    return numero;
  }

  if (regra.tipo === "booleano") {
    if (valor === true || valor === false || valor === 1 || valor === 0) {
      return valor === true || valor === 1;
    }
    if (valor === "true" || valor === "false" || valor === "1" || valor === "0") {
      return valor === "true" || valor === "1";
    }
    throw erroValidacao(`${nomeCampo} deve ser verdadeiro ou falso.`);
  }

  if (regra.tipo === "enum") {
    if (!regra.valores.includes(valor)) {
      throw erroValidacao(`${nomeCampo} deve ser um destes valores: ${regra.valores.join(", ")}.`);
    }
    return valor;
  }

  if (regra.tipo === "data") {
    if (typeof valor !== "string" || !valor.trim() || !Number.isFinite(Date.parse(valor))) {
      throw erroValidacao(`${nomeCampo} deve conter uma data válida.`);
    }
    return valor;
  }

  throw new Error(`Tipo de validação não configurado para ${nomeCampo}.`);
}

export function obterRecurso(caminho) {
  const recurso = porCaminho[caminho];
  if (!recurso) {
    const erro = new Error("Recurso não encontrado.");
    erro.status = 404;
    throw erro;
  }
  return recurso;
}

export function camposPermitidos(recurso, cargo) {
  return recurso.escrita[cargo] || [];
}

export function validarDados(
  recurso,
  corpo,
  cargo,
  { completo = false, camposInternos = [] } = {},
) {
  if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
    throw erroValidacao("O corpo da requisição deve ser um objeto JSON.");
  }

  const permitidos = camposPermitidos(recurso, cargo);
  const dados = {};
  for (const [nome, valor] of Object.entries(corpo)) {
    if (
      !recurso.campos[nome] ||
      (!permitidos.includes(nome) && !camposInternos.includes(nome))
    ) {
      throw erroValidacao(`O campo ${nome} não pode ser enviado nesta operação.`);
    }
    dados[nome] = validarValor(nome, valor, recurso.campos[nome]);
  }

  if (Object.keys(dados).length === 0) {
    throw erroValidacao("Informe ao menos um campo para salvar.");
  }
  if (completo) {
    for (const nome of recurso.obrigatorios) {
      if (permitidos.includes(nome) && dados[nome] === undefined) {
        throw erroValidacao(`O campo ${nome} é obrigatório.`);
      }
    }
  }

  return dados;
}

export function validarConsistencia(recurso, dados) {
  const conferirPeriodo = (inicio, fim, nomeInicio, nomeFim) => {
    if (dados[inicio] === undefined || dados[fim] === undefined) return;
    if (Date.parse(dados[inicio]) >= Date.parse(dados[fim])) {
      throw erroValidacao(`${nomeFim} deve ser posterior a ${nomeInicio}.`);
    }
  };

  if (recurso.tabela === "eventos") {
    conferirPeriodo("data_inicio", "data_fim", "data_inicio", "data_fim");
  }
  if (recurso.tabela === "atividades") {
    conferirPeriodo(
      "data_hora_inicio",
      "data_hora_fim",
      "data_hora_inicio",
      "data_hora_fim",
    );
    if (
      dados.vagas_maximas !== undefined &&
      dados.vagas_ocupadas !== undefined &&
      dados.vagas_ocupadas > dados.vagas_maximas
    ) {
      throw erroValidacao("vagas_ocupadas não pode exceder vagas_maximas.");
    }
  }
  if (recurso.tabela === "tipo_ingresso") {
    conferirPeriodo("venda_inicio", "venda_final", "venda_inicio", "venda_final");
    if (
      dados.quant_total !== undefined &&
      dados.quant_vendida !== undefined &&
      dados.quant_vendida > dados.quant_total
    ) {
      throw erroValidacao("quant_vendida não pode exceder quant_total.");
    }
  }
  if (recurso.tabela === "lista_espera") {
    const paraEvento = dados.evento_id !== null && dados.evento_id !== undefined;
    const paraAtividade = dados.atividade_id !== null && dados.atividade_id !== undefined;
    if (paraEvento === paraAtividade) {
      throw erroValidacao("Informe evento_id ou atividade_id, mas não ambos.");
    }
  }
}

function montarWhere(recurso, filtros, escopo) {
  const condicoes = [];
  const valores = [];

  if (escopo?.sql) {
    condicoes.push(`(${escopo.sql})`);
    valores.push(...escopo.valores);
  }

  if (filtros) {
    for (const [campo, valor] of Object.entries(filtros)) {
      if (!recurso.filtros.includes(campo) || valor === undefined || valor === "") continue;
      const regra = recurso.campos[campo];
      condicoes.push(`${campo} = ?`);
      valores.push(validarValor(campo, valor, regra));
    }
  }

  return {
    sql: condicoes.length ? ` WHERE ${condicoes.join(" AND ")}` : "",
    valores,
  };
}

function clausulaEscopoAdicional(where) {
  return where.sql ? ` AND ${where.sql.slice(" WHERE ".length)}` : "";
}

export async function listar(caminho, filtros, escopo) {
  const recurso = obterRecurso(caminho);
  const limite = filtros.limite === undefined ? 50 : Number(filtros.limite);
  const deslocamento = filtros.deslocamento === undefined ? 0 : Number(filtros.deslocamento);

  if (!Number.isInteger(limite) || limite < 1 || limite > 100) {
    throw erroValidacao("limite deve ser um número inteiro entre 1 e 100.");
  }
  if (!Number.isInteger(deslocamento) || deslocamento < 0) {
    throw erroValidacao("deslocamento deve ser um número inteiro igual ou maior que zero.");
  }

  const where = montarWhere(recurso, filtros, escopo);
  const [dados] = await pool.query(
    `SELECT ${recurso.colunas.join(", ")} FROM ${recurso.tabela}${where.sql} ORDER BY id LIMIT ? OFFSET ?`,
    [...where.valores, limite, deslocamento],
  );
  const [contagem] = await pool.query(
    `SELECT COUNT(*) AS total FROM ${recurso.tabela}${where.sql}`,
    where.valores,
  );

  return { dados, total: Number(contagem[0].total), limite, deslocamento };
}

export async function buscarPorId(caminho, id, escopo) {
  const recurso = obterRecurso(caminho);
  const where = montarWhere(recurso, null, escopo);
  const [linhas] = await pool.query(
    `SELECT ${recurso.colunas.join(", ")} FROM ${recurso.tabela} WHERE id = ?${clausulaEscopoAdicional(where)} LIMIT 1`,
    [id, ...where.valores],
  );
  return linhas[0] || null;
}

export async function criar(caminho, dados) {
  const recurso = obterRecurso(caminho);
  const nomes = Object.keys(dados);
  const placeholders = nomes.map(() => "?").join(", ");
  const [resultado] = await pool.query(
    `INSERT INTO ${recurso.tabela} (${nomes.join(", ")}) VALUES (${placeholders})`,
    nomes.map((nome) => dados[nome]),
  );
  return buscarPorId(caminho, resultado.insertId);
}

export async function atualizar(caminho, id, dados, escopo) {
  const recurso = obterRecurso(caminho);
  const nomes = Object.keys(dados);
  const definicoes = nomes.map((nome) => `${nome} = ?`).join(", ");
  const where = montarWhere(recurso, null, escopo);
  const [resultado] = await pool.query(
    `UPDATE ${recurso.tabela} SET ${definicoes} WHERE id = ?${clausulaEscopoAdicional(where)}`,
    [...nomes.map((nome) => dados[nome]), id, ...where.valores],
  );
  return resultado.affectedRows > 0;
}

export async function excluir(caminho, id, escopo) {
  const recurso = obterRecurso(caminho);
  const where = montarWhere(recurso, null, escopo);
  const [resultado] = await pool.query(
    `DELETE FROM ${recurso.tabela} WHERE id = ?${clausulaEscopoAdicional(where)}`,
    [id, ...where.valores],
  );
  return resultado.affectedRows > 0;
}

export async function eventoPertenceAoOrganizador(eventoId, organizadorId) {
  const [linhas] = await pool.query(
    "SELECT id FROM eventos WHERE id = ? AND organizador_id = ? LIMIT 1",
    [eventoId, organizadorId],
  );
  return linhas.length > 0;
}

export async function atividadePertenceAoOrganizador(atividadeId, organizadorId) {
  const [linhas] = await pool.query(
    `SELECT a.id FROM atividades a
     JOIN eventos e ON e.id = a.evento_id
     WHERE a.id = ? AND e.organizador_id = ? LIMIT 1`,
    [atividadeId, organizadorId],
  );
  return linhas.length > 0;
}
