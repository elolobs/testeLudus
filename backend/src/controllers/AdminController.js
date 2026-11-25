import { pool } from "../config/database.js";

export async function obterDashboard(request, response, next) {
  try {
    const [[metricas]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM usuarios) AS totalUsuarios,
        (SELECT COUNT(*) FROM eventos WHERE status = 'PUBLICADO') AS eventosPublicados,
        (SELECT COALESCE(SUM(valor_total), 0) FROM pedidos WHERE status = 'pago') AS receitaTotal,
        (SELECT COALESCE(SUM(ip.quantidade), 0)
         FROM itens_pedido ip
         JOIN pedidos p ON p.id = ip.pedido_id
         WHERE p.status = 'pago') AS ingressosVendidos
    `);

    const [eventosRecentes] = await pool.query(`
      SELECT e.id, e.titulo, e.status, u.nome_completo AS organizador, e.criado_em
      FROM eventos e
      JOIN usuarios u ON e.organizador_id = u.id
      ORDER BY e.criado_em DESC
    `);

    return response.json({ metricas, eventosRecentes });
  } catch (error) {
    return next(error);
  }
}