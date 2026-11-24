import { pool } from "../config/database.js";

const LIMITE_INGRESSOS_POR_PEDIDO = 5;

function erroPedido(status, mensagem) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

export function normalizarItensPedido(itens) {
  if (!Array.isArray(itens) || itens.length === 0) {
    throw erroPedido(422, "Selecione ao menos um tipo de ingresso.");
  }

  const ids = new Set();
  const normalizados = [];
  let quantidadeTotal = 0;

  for (const item of itens) {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item) ||
      !Number.isInteger(item.tipo_ingresso_id) ||
      item.tipo_ingresso_id < 1 ||
      !Number.isInteger(item.quantidade) ||
      item.quantidade < 1 ||
      (item.categoria !== undefined && !["inteira", "meia"].includes(item.categoria))
    ) {
      throw erroPedido(422, "Os ingressos selecionados são inválidos.");
    }
    const categoria = item.categoria || "inteira";
    const chave = `${item.tipo_ingresso_id}:${categoria}`;
    if (ids.has(chave)) {
      throw erroPedido(422, "Cada tipo de ingresso e categoria deve aparecer uma única vez.");
    }

    ids.add(chave);
    quantidadeTotal += item.quantidade;
    normalizados.push({
      tipo_ingresso_id: item.tipo_ingresso_id,
      categoria,
      quantidade: item.quantidade,
    });
  }

  if (quantidadeTotal > LIMITE_INGRESSOS_POR_PEDIDO) {
    throw erroPedido(
      422,
      `Cada pedido permite até ${LIMITE_INGRESSOS_POR_PEDIDO} ingressos.`,
    );
  }

  return normalizados;
}

export function calcularPrecoCentavos(
  preco,
  categoria,
  mensagemErro = "O tipo de ingresso está sem preço válido.",
) {
  const precoInteiroCentavos = Math.round(Number(preco) * 100);
  if (
    preco === null ||
    !Number.isSafeInteger(precoInteiroCentavos) ||
    precoInteiroCentavos < 0
  ) {
    throw erroPedido(409, mensagemErro);
  }

  return categoria === "meia"
    ? Math.round(precoInteiroCentavos / 2)
    : precoInteiroCentavos;
}

export async function criarPedido(usuarioId, itensInformados) {
  const itens = normalizarItensPedido(itensInformados);
  const conexao = await pool.getConnection();
  let transacaoAberta = false;

  try {
    await conexao.beginTransaction();
    transacaoAberta = true;

    const ids = [...new Set(itens.map((item) => item.tipo_ingresso_id))];
    const placeholders = ids.map(() => "?").join(", ");
    const [tipos] = await conexao.query(
      `SELECT ti.id, ti.evento_id, ti.nome, ti.preco, ti.quant_total,
              COALESCE(ti.quant_vendida, 0) AS quant_vendida,
              (e.status = 'PUBLICADO') AS evento_publicado,
              (ti.venda_inicio IS NULL OR ti.venda_inicio <= NOW()) AS venda_iniciada,
              (ti.venda_final IS NULL OR ti.venda_final >= NOW()) AS venda_aberta
       FROM tipo_ingresso ti
       JOIN eventos e ON e.id = ti.evento_id
       WHERE ti.id IN (${placeholders})
       ORDER BY ti.id
       FOR UPDATE`,
      ids,
    );

    if (tipos.length !== ids.length) {
      throw erroPedido(422, "Um ou mais tipos de ingresso não existem.");
    }

    const eventoId = tipos[0].evento_id;
    if (tipos.some((tipo) => tipo.evento_id !== eventoId)) {
      throw erroPedido(422, "Um pedido pode conter ingressos de apenas um evento.");
    }

    const tiposPorId = new Map(tipos.map((tipo) => [tipo.id, tipo]));
    const quantidadePorTipo = new Map();
    let totalCentavos = 0;

    for (const item of itens) {
      const tipo = tiposPorId.get(item.tipo_ingresso_id);
      if (!tipo.evento_publicado) {
        throw erroPedido(409, "O evento não está disponível para compra.");
      }
      if (!tipo.venda_iniciada || !tipo.venda_aberta) {
        throw erroPedido(409, `A venda de ${tipo.nome} não está aberta.`);
      }

      item.preco_centavos = calcularPrecoCentavos(
        tipo.preco,
        item.categoria,
        `${tipo.nome} está sem preço válido.`,
      );
      quantidadePorTipo.set(
        item.tipo_ingresso_id,
        (quantidadePorTipo.get(item.tipo_ingresso_id) || 0) + item.quantidade,
      );
      totalCentavos += item.preco_centavos * item.quantidade;
    }

    for (const [tipoId, quantidade] of quantidadePorTipo) {
      const tipo = tiposPorId.get(tipoId);
      const restantes = Number(tipo.quant_total) - Number(tipo.quant_vendida);
      if (quantidade > restantes) {
        throw erroPedido(409, `Não há ingressos suficientes de ${tipo.nome}.`);
      }
    }

    const valorTotal = totalCentavos / 100;
    const [pedido] = await conexao.query(
      "INSERT INTO pedidos (usuario_id, valor_total, status) VALUES (?, ?, 'pendente')",
      [usuarioId, valorTotal],
    );

    for (const item of itens) {
      await conexao.query(
        `INSERT INTO itens_pedido
         (pedido_id, tipo_ingresso_id, categoria, quantidade, preco_unitario)
         VALUES (?, ?, ?, ?, ?)`,
        [
          pedido.insertId,
          item.tipo_ingresso_id,
          item.categoria,
          item.quantidade,
          item.preco_centavos / 100,
        ],
      );
    }

    for (const [tipoId, quantidade] of quantidadePorTipo) {
      await conexao.query(
        "UPDATE tipo_ingresso SET quant_vendida = quant_vendida + ? WHERE id = ?",
        [quantidade, tipoId],
      );
    }

    await conexao.commit();
    transacaoAberta = false;

    return {
      id: pedido.insertId,
      valor_total: valorTotal,
      status: "pendente",
    };
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

export async function listarPedidos(usuarioId, pedidoId) {
  const filtroPedido = pedidoId === undefined ? "" : " AND p.id = ?";
  const parametros = pedidoId === undefined ? [usuarioId] : [usuarioId, pedidoId];
  const [linhas] = await pool.query(
    `SELECT p.id AS pedido_id, p.valor_total, p.status AS pedido_status,
            p.criado_em, ip.id AS item_id, ip.quantidade,
            ip.preco_unitario, ip.categoria AS item_categoria,
            ti.nome AS tipo_ingresso_nome,
            e.id AS evento_id, e.titulo AS evento_titulo,
            e.data_inicio, e.local_nome, ing.id AS ingresso_id,
            ing.status AS ingresso_status
     FROM pedidos p
     LEFT JOIN itens_pedido ip ON ip.pedido_id = p.id
     LEFT JOIN tipo_ingresso ti ON ti.id = ip.tipo_ingresso_id
     LEFT JOIN eventos e ON e.id = ti.evento_id
     LEFT JOIN ingressos ing
       ON ing.pedido_id = p.id
       AND ing.tipo_ingresso_id = ip.tipo_ingresso_id
       AND ing.usuario_id = p.usuario_id
     WHERE p.usuario_id = ?${filtroPedido}
     ORDER BY p.criado_em DESC, p.id DESC, ip.id ASC, ing.id ASC`,
    parametros,
  );

  const pedidos = new Map();
  const itensPorId = new Map();
  for (const linha of linhas) {
    let pedido = pedidos.get(linha.pedido_id);
    if (!pedido) {
      pedido = {
        id: linha.pedido_id,
        valor_total: linha.valor_total,
        status: linha.pedido_status,
        criado_em: linha.criado_em,
        evento_id: linha.evento_id,
        evento_titulo: linha.evento_titulo,
        data_inicio: linha.data_inicio,
        local_nome: linha.local_nome,
        itens: [],
      };
      pedidos.set(linha.pedido_id, pedido);
    }

    if (linha.item_id === null) continue;

    let item = itensPorId.get(linha.item_id);
    if (!item) {
      item = {
        id: linha.item_id,
        tipo_ingresso_nome: linha.tipo_ingresso_nome,
        categoria: linha.item_categoria,
        quantidade: linha.quantidade,
        preco_unitario: linha.preco_unitario,
        ingressos: [],
      };
      itensPorId.set(linha.item_id, item);
      pedido.itens.push(item);
    }

    if (linha.ingresso_id !== null) {
      item.ingressos.push({
        id: linha.ingresso_id,
        status: linha.ingresso_status,
      });
    }
  }

  return [...pedidos.values()];
}

export async function buscarPedido(usuarioId, pedidoId) {
  const [pedido] = await listarPedidos(usuarioId, pedidoId);
  return pedido || null;
}
