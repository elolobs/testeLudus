import { pool } from "../config/database.js";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUS_CHAMADO = new Set([
  "PENDENTE",
  "EM_ANDAMENTO",
  "RESPONDIDO",
  "RESOLVIDO",
]);

function erroSuporte(status, mensagem) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

function validarObjeto(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    throw erroSuporte(422, "Informe os dados da solicitação.");
  }
}

function validarTexto(valor, campo, limite) {
  if (typeof valor !== "string" || !valor.trim()) {
    throw erroSuporte(422, `Informe ${campo}.`);
  }
  const texto = valor.trim();
  if (texto.length > limite) {
    throw erroSuporte(422, `${campo} deve ter no máximo ${limite} caracteres.`);
  }
  return texto;
}

export function normalizarNovoChamado(dados) {
  validarObjeto(dados);

  const nome = validarTexto(dados.nome, "seu nome", 120);
  const email = validarTexto(dados.email, "um e-mail válido", 150).toLowerCase();
  const telefone = validarTexto(dados.telefone, "seu telefone", 20);
  const mensagem = validarTexto(dados.mensagem, "a descrição do problema", 5000);

  if (!EMAIL_VALIDO.test(email)) {
    throw erroSuporte(422, "Informe um e-mail válido.");
  }

  return { nome, email, telefone, mensagem };
}

export function normalizarTextoResposta(valor, campo = "a mensagem") {
  const texto = validarTexto(valor, campo, 5000);
  if (texto.length < 2) {
    throw erroSuporte(422, `${campo} deve ter pelo menos 2 caracteres.`);
  }
  return texto;
}

export function validarStatusChamado(status) {
  if (!STATUS_CHAMADO.has(status)) {
    throw erroSuporte(422, "O status informado para o chamado é inválido.");
  }
  return status;
}

async function anexarRespostas(chamados) {
  if (!chamados.length) return chamados;

  const ids = chamados.map((chamado) => chamado.id);
  const [respostas] = await pool.query(
    `SELECT sr.id, sr.chamado_id, sr.autor, sr.texto, sr.criado_em,
            COALESCE(
              u.nome_completo,
              IF(sr.autor = 'SUPORTE', 'Suporte LD Eventos', 'Cliente')
            ) AS nome_autor
     FROM suporte_respostas sr
     LEFT JOIN usuarios u ON u.id = sr.autor_usuario_id
     WHERE sr.chamado_id IN (?)
     ORDER BY sr.criado_em ASC, sr.id ASC`,
    [ids],
  );

  const respostasPorChamado = new Map(chamados.map((chamado) => [chamado.id, []]));
  for (const resposta of respostas) {
    respostasPorChamado.get(resposta.chamado_id)?.push(resposta);
  }
  return chamados.map((chamado) => ({
    ...chamado,
    respostas: respostasPorChamado.get(chamado.id) || [],
  }));
}

export async function criarChamado(dados, usuarioId) {
  const chamado = normalizarNovoChamado(dados);
  const [resultado] = await pool.query(
    `INSERT INTO suporte_chamados
      (usuario_id, nome, email, telefone, mensagem, status)
     VALUES (?, ?, ?, ?, ?, 'PENDENTE')`,
    [
      usuarioId,
      chamado.nome,
      chamado.email,
      chamado.telefone,
      chamado.mensagem,
    ],
  );

  const [[criado]] = await pool.query(
    `SELECT id, nome, email, telefone, mensagem, status, criado_em
     FROM suporte_chamados WHERE id = ?`,
    [resultado.insertId],
  );
  return criado;
}

export async function listarChamadosDoUsuario(usuarioId) {
  const [chamados] = await pool.query(
    `SELECT id, nome, email, telefone, mensagem, status, criado_em
     FROM suporte_chamados
     WHERE usuario_id = ?
     ORDER BY criado_em DESC, id DESC`,
    [usuarioId],
  );
  return anexarRespostas(chamados);
}

export async function listarTodosChamados() {
  const [chamados] = await pool.query(
    `SELECT id, usuario_id, nome, email, telefone, mensagem, status, criado_em
     FROM suporte_chamados
     ORDER BY criado_em DESC, id DESC`,
  );
  return anexarRespostas(chamados);
}

async function criarResposta(chamadoId, usuarioId, autor, texto) {
  const conexao = await pool.getConnection();
  let transacaoAberta = false;

  try {
    await conexao.beginTransaction();
    transacaoAberta = true;

    const [chamados] = await conexao.query(
      `SELECT id, status
       FROM suporte_chamados
       WHERE id = ?${autor === "CLIENTE" ? " AND usuario_id = ?" : ""}
       FOR UPDATE`,
      autor === "CLIENTE" ? [chamadoId, usuarioId] : [chamadoId],
    );
    const chamado = chamados[0];
    if (!chamado) {
      throw erroSuporte(404, "Solicitação não encontrada.");
    }
    if (autor === "CLIENTE" && chamado.status === "RESOLVIDO") {
      throw erroSuporte(409, "Esta solicitação já foi concluída.");
    }

    const [insercao] = await conexao.query(
      `INSERT INTO suporte_respostas
        (chamado_id, autor_usuario_id, autor, texto)
       VALUES (?, ?, ?, ?)`,
      [chamadoId, usuarioId, autor, texto],
    );
    const status = autor === "SUPORTE" ? "RESPONDIDO" : "PENDENTE";
    await conexao.query(
      "UPDATE suporte_chamados SET status = ? WHERE id = ?",
      [status, chamadoId],
    );
    const [[resposta]] = await conexao.query(
      `SELECT id, autor, texto, criado_em
       FROM suporte_respostas WHERE id = ?`,
      [insercao.insertId],
    );

    await conexao.commit();
    transacaoAberta = false;
    return { ...resposta, status };
  } catch (erro) {
    if (transacaoAberta) {
      try {
        await conexao.rollback();
      } catch (erroRollback) {
        erro.erroRollback = erroRollback;
      }
    }
    throw erro;
  } finally {
    conexao.release();
  }
}

export async function responderComoCliente(chamadoId, usuarioId, textoInformado) {
  const texto = normalizarTextoResposta(textoInformado);
  return criarResposta(chamadoId, usuarioId, "CLIENTE", texto);
}

export async function responderComoAdmin(chamadoId, usuarioId, textoInformado) {
  const texto = normalizarTextoResposta(textoInformado, "a resposta");
  return criarResposta(chamadoId, usuarioId, "SUPORTE", texto);
}

export async function atualizarStatus(chamadoId, statusInformado) {
  const status = validarStatusChamado(statusInformado);
  const [resultado] = await pool.query(
    "UPDATE suporte_chamados SET status = ? WHERE id = ?",
    [status, chamadoId],
  );
  if (resultado.affectedRows === 0) {
    const [encontrados] = await pool.query(
      "SELECT id FROM suporte_chamados WHERE id = ?",
      [chamadoId],
    );
    if (!encontrados.length) {
      throw erroSuporte(404, "Solicitação não encontrada.");
    }
  }
  return { id: chamadoId, status };
}
