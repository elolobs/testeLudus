"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import "./vendas.css"; 

export default function VerVendas() {
    const params = useParams();
    const router = useRouter();
    const idDoEvento = params.id;

    const [eventoNome, setEventoNome] = useState("A carregar...");
    const [resumo, setResumo] = useState({ total: 0, vendidos: 0, pendentes: 0 });
    const [vendasSetores, setVendasSetores] = useState([]);
    const [pedidos, setPedidos] = useState([]);

    // Simulação da busca de dados (API)
    useEffect(() => {
        setEventoNome("Festa de Verão 2026");

        setResumo({
            total: 15450.00,
            vendidos: 185,
            pendentes: 12
        });

        setVendasSetores([
            { id: 1, nome: "Pista", vendidasInteira: 100, vendidasMeia: 50, receita: 6250 },
            { id: 2, nome: "Área VIP", vendidasInteira: 25, vendidasMeia: 10, receita: 3600 }
        ]);

        setPedidos([
            { id: "PED-1001", cliente: "João Silva", setor: "Área VIP", tipo: "Inteira", qtd: 2, total: 240, data: "12/10/2026 14:30", status: "Pago" },
            { id: "PED-1002", cliente: "Maria Fernandes", setor: "Pista", tipo: "Meia", qtd: 1, total: 25, data: "12/10/2026 15:15", status: "Pendente" },
            { id: "PED-1003", cliente: "Carlos Pereira", setor: "Pista", tipo: "Inteira", qtd: 3, total: 150, data: "12/10/2026 16:05", status: "Pago" },
            { id: "PED-1004", cliente: "Ana Costa", setor: "Área VIP", tipo: "Meia", qtd: 1, total: 60, data: "13/10/2026 09:10", status: "Cancelado" },
        ]);
    }, [idDoEvento]);

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    return (
        <div className="container-vendas">
            <div className="header-vendas">
                <div>
                    <button onClick={() => router.back()} className="btn-voltar">
                        &larr; Voltar
                    </button>
                    <h1 className="title-admin">Relatório de Vendas</h1>
                    <p className="subtitle-admin">Evento: <strong>{eventoNome}</strong></p>
                </div>
                <button className="btn-exportar">Exportar CSV</button>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card">
                    <span className="kpi-title">Receita Total</span>
                    <span className="kpi-value destaque-verde">{formatarMoeda(resumo.total)}</span>
                </div>
                <div className="kpi-card">
                    <span className="kpi-title">Ingressos Vendidos</span>
                    <span className="kpi-value">{resumo.vendidos}</span>
                </div>
                <div className="kpi-card">
                    <span className="kpi-title">Pedidos Pendentes</span>
                    <span className="kpi-value destaque-amarelo">{resumo.pendentes}</span>
                </div>
            </div>

            <section className="seccao-vendas">
                <h3>Vendas por Setor</h3>
                <div className="setores-grid">
                    {vendasSetores.map(setor => (
                        <div key={setor.id} className="setor-card">
                            <h4>{setor.nome}</h4>
                            <div className="setor-stats">
                                <div className="stat-item">
                                    <span>Inteiras:</span>
                                    <strong>{setor.vendidasInteira}</strong>
                                </div>
                                <div className="stat-item">
                                    <span>Meias:</span>
                                    <strong>{setor.vendidasMeia}</strong>
                                </div>
                                <div className="stat-item total-setor">
                                    <span>Receita:</span>
                                    <strong>{formatarMoeda(setor.receita)}</strong>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="seccao-vendas">
                <h3>Pedidos Recentes</h3>
                <div className="table-container">
                    <table className="table-pedidos">
                        <thead>
                            <tr>
                                <th>ID Pedido</th>
                                <th>Cliente</th>
                                <th>Setor / Tipo</th>
                                <th>Qtd</th>
                                <th>Data</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map(pedido => (
                                <tr key={pedido.id}>
                                    <td className="fw-bold text-gray">{pedido.id}</td>
                                    <td>{pedido.cliente}</td>
                                    <td>{pedido.setor} <small className="tag-tipo">{pedido.tipo}</small></td>
                                    <td>{pedido.qtd}</td>
                                    <td>{pedido.data}</td>
                                    <td className="fw-bold">{formatarMoeda(pedido.total)}</td>
                                    <td>
                                        <span className={`badge-status status-${pedido.status.toLowerCase()}`}>
                                            {pedido.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {pedidos.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center">Nenhum pedido encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}