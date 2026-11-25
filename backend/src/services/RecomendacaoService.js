import { pool } from "../config/database.js";

export async function listarParaUsuario(usuarioId) {
  const [eventos] = await pool.query(
    `SELECT e.id, e.titulo, e.categoria_id, c.nome AS categoria_nome,
            e.data_inicio, e.local_nome, e.imagem_capa_url
     FROM eventos e
     JOIN categorias c ON c.id = e.categoria_id
     JOIN (
       SELECT historico.categoria_id, COUNT(*) AS compras_categoria
       FROM (
         SELECT DISTINCT p.id AS pedido_id, evento_comprado.categoria_id
         FROM pedidos p
         JOIN itens_pedido ip ON ip.pedido_id = p.id
         JOIN tipo_ingresso ti ON ti.id = ip.tipo_ingresso_id
         JOIN eventos evento_comprado ON evento_comprado.id = ti.evento_id
         WHERE p.usuario_id = ? AND p.status = 'pago'
       ) historico
       GROUP BY historico.categoria_id
     ) preferencias ON preferencias.categoria_id = e.categoria_id
     WHERE e.status = 'PUBLICADO'
       AND e.data_inicio >= CURRENT_TIMESTAMP
       AND NOT EXISTS (
         SELECT 1
         FROM pedidos pedido_comprado
         JOIN itens_pedido item_comprado
           ON item_comprado.pedido_id = pedido_comprado.id
         JOIN tipo_ingresso tipo_comprado
           ON tipo_comprado.id = item_comprado.tipo_ingresso_id
         WHERE pedido_comprado.usuario_id = ?
           AND pedido_comprado.status = 'pago'
           AND tipo_comprado.evento_id = e.id
       )
     ORDER BY preferencias.compras_categoria DESC, e.data_inicio ASC, e.id ASC
     LIMIT 6`,
    [usuarioId, usuarioId],
  );
  return eventos;
}
