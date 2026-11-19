"use client"

import { useState, useEffect } from "react";
import Link from "next/link"; // Mantive caso vá usar no futuro
import "./organizador.css";
import { apiRequest } from "@/lib/api.mjs";

const coresStatus = {
    "Ativo": "green",
    "Esgotado": "red",
    "Rascunho": "goldenrod"
};

export default function organizador() {

    const [eventos, setEventos] = useState([]);

    //exemplo, apagar e usar do banco depois!
    const [metricas, setMetricas] = useState({
        receita: "48.250",
        ingressos: "1.320",
        ativos: "8",
        clientes: "540"
    });

    useEffect(() => {
        // Quando ligar a sua apiRequest, a rota do backend (ex: '/api/meus-dados') 
        // tem de ler o token de quem está logado e devolver APENAS os dados dele.

        //exemplo, apagar depois!
        setEventos([
            { id: 1, nome: "Festa de Verão", data: "12/12/2026", vendidos: 320, total: 500, status: "Ativo" },
            { id: 2, nome: "Workshop React", data: "15/01/2027", vendidos: 500, total: 500, status: "Esgotado" },
            { id: 3, nome: "Show de Rock", data: "20/02/2027", vendidos: 0, total: 300, status: "Rascunho" }
        ]);
    }, []);

    return (
        <>
            <h1 className="title-organizador">Painel Organizador</h1>
            <p className="suborganizador">Visão geral dos seus eventos e vendas</p>

            <div className="dashboard-grid-organizador">
                <div className="card-metrica-organizador">
                    <h3>R$ {metricas.receita}</h3>
                    <p>Receita do mês</p>
                </div>

                <div className="card-metrica-organizador">
                    <h3>{metricas.ingressos}</h3>
                    <p>Ingressos vendidos</p>
                </div>

                <div className="card-metrica-organizador">
                    <h3>{metricas.ativos}</h3>
                    <p>Eventos ativos</p>
                </div>

                <div className="card-metrica-organizador">
                    <h3>{metricas.clientes}</h3>
                    <p>Novos clientes</p>
                </div>
            </div>

            <h3 className="title-organizador">Eventos</h3>
            <div className="lista-eventos">
                <div className="linha-grid cabecalho">
                    <div>Evento</div>
                    <div>Data</div>
                    <div>Vendidos / Total</div>
                    <div>Status</div>
                    <div>Ações</div>
                </div>

                {eventos.map((evento) => (
                    <div key={evento.id} className="linha-grid item">
                        <div>{evento.nome}</div>
                        <div>{evento.data}</div>
                        <div>{evento.vendidos} / {evento.total}</div>

                        <div style={{ color: coresStatus[evento.status], fontWeight: "bold" }}>
                            {evento.status}
                        </div>

                        <div className="acoes">
                            <Link href={`/organizador/eventos/${evento.id}/editar`} className="acao-link">
                                Editar
                            </Link>

                            {' | '}

                            {evento.status === "Rascunho" ? (
                                <span
                                    className="acao-link"
                                    onClick={() => alert(`Vai publicar o evento ID: ${evento.id}`)}
                                >
                                    {/* QUANDO CLICAR AQUI TEM QUE PUBLICAR O EVENTO */}
                                    Publicar
                                </span>
                            ) : (
                                <Link href={`/organizador/eventos/${evento.id}/vendas`} className="acao-link">
                                    Ver vendas
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}