// src/controllers/AdminController.js
const db = require('../config/database');

class AdminController {
    static async getDashboard(req, res) {
        try {
    
            const [usersRows] = await db.query(`SELECT COUNT(id) AS total_usuarios FROM usuarios`);
            
 
            const [eventsRows] = await db.query(`SELECT COUNT(id) AS eventos_publicados FROM eventos WHERE status = 'PUBLICADO'`);
            
            const [revenueRows] = await db.query(`SELECT IFNULL(SUM(valor_total), 0) AS receita_total FROM pedidos WHERE status = 'pago'`);

            const [recentEvents] = await db.query(`
                SELECT e.titulo, e.status, u.nome_completo AS organizador, e.criado_em 
                FROM eventos e
                JOIN usuarios u ON e.organizador_id = u.id
                ORDER BY e.criado_em DESC
                LIMIT 5
            `);

            const dashboardData = {
                metricas: {
                    totalUsuarios: usersRows[0].total_usuarios,
                    eventosPublicados: eventsRows[0].eventos_publicados,
                    receitaTotal: revenueRows[0].receita_total
                },
                eventosRecentes: recentEvents
            };

      
            return res.json(dashboardData);


        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao carregar o dashboard admin." });
        }
    }
}

module.exports = AdminController;