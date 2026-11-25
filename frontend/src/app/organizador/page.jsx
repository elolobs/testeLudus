"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import "./organizador.css";
import { apiRequest } from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";

const CONFIG_STATUS = {
    PUBLICADO: { label: "Ativo", cor: "green" },
    RASCUNHO: { label: "Rascunho", cor: "goldenrod" },
    ESGOTADO: { label: "Esgotado", cor: "red" },
    SUSPENSO: { label: "Suspenso", cor: "orangered" },
    CANCELADO: { label: "Cancelado", cor: "crimson" },
    CONCLUIDO: { label: "Concluído", cor: "gray" },
};

const ROTA_EVENTOS = "eventos";
const rotaPublicarEvento = (id) => `/eventos/${id}/publicar`;

export default function Organizador() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);

    const [metricas, setMetricas] = useState({
        receita: "0,00",
        ingressos: "0",
        ativos: "0",
        clientes: "0",
    });

    function extrairListaEventos(payload) {
        if (Array.isArray(payload)) return payload;
        if (!payload || typeof payload !== "object") return [];
        if (Array.isArray(payload.eventos)) return payload.eventos;
        if (Array.isArray(payload.dados)) return payload.dados;
        if (Array.isArray(payload.data)) return payload.data;
        if (Array.isArray(payload.content)) return payload.content;
        return [];
    }

    const carregarDados = useCallback(async () => {
        const sessao = obterSessao();
        const [resp, respTipos] = await Promise.all([
            apiRequest(ROTA_EVENTOS, { method: "GET", token: sessao?.token }),
            apiRequest("tipos-ingresso?limite=100", { token: sessao?.token }),
        ]);
        const listaBruta = extrairListaEventos(resp);
        const todosTipos = extrairListaEventos(respTipos);

        let totalReceita = 0;
        let totalIngressos = 0;
        let totalAtivos = 0;

        const eventosFormatados = listaBruta.map((ev) => {
            const statusBanco = String(ev.status || "RASCUNHO").toUpperCase();
            if (statusBanco === "PUBLICADO" || statusBanco === "ATIVO") {
                totalAtivos += 1;
            }

            const tiposAninhados = Array.isArray(ev.tiposIngresso)
                ? ev.tiposIngresso
                : Array.isArray(ev.tipo_ingresso)
                    ? ev.tipo_ingresso
                    : null;
            const tipos = tiposAninhados || todosTipos.filter(
                (tipo) => Number(tipo.evento_id) === Number(ev.id)
            );

            const totalEvento =
                tipos.length > 0
                    ? tipos.reduce((acc, t) => acc + Number(t.quant_total ?? t.quantTotal ?? 0), 0)
                    : Number(ev.capacidade_maxima ?? ev.capacidadeMaxima ?? ev.total ?? 0);

            const vendidosEvento =
                tipos.length > 0
                    ? tipos.reduce((acc, t) => acc + Number(t.quant_vendida ?? t.quantVendida ?? 0), 0)
                    : Number(ev.vendidos ?? ev.quant_vendida ?? 0);

            const receitaEvento =
                tipos.length > 0
                    ? tipos.reduce(
                        (acc, t) =>
                            acc + Number(t.preco ?? 0) * Number(t.quant_vendida ?? t.quantVendida ?? 0),
                        0
                    )
                    : Number(ev.receita_total ?? ev.receitaTotal ?? 0);

            totalIngressos += vendidosEvento;
            totalReceita += receitaEvento;

            const esgotado =
                statusBanco === "PUBLICADO" &&
                totalEvento > 0 &&
                vendidosEvento >= totalEvento;

            const chaveStatus = esgotado ? "ESGOTADO" : statusBanco;
            const cfg = CONFIG_STATUS[chaveStatus] || {
                label: ev.status || "Indefinido",
                cor: "black",
            };

            return {
                id: ev.id,
                nome: ev.titulo || ev.nome || "Sem título",
                data: ev.data_inicio || ev.dataInicio || ev.data,
                vendidos: vendidosEvento,
                total: totalEvento,
                statusBanco,
                statusLabel: cfg.label,
                statusCor: cfg.cor,
            };
        });

        return {
            eventos: eventosFormatados,
            metricas: {
                receita: totalReceita.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }),
                ingressos: totalIngressos.toLocaleString("pt-BR"),
                ativos: totalAtivos.toString(),
                clientes: Number(resp?.totalClientes ?? totalIngressos).toLocaleString("pt-BR"),
            },
        };
    }, []);

    useEffect(() => {
        let ativo = true;

        carregarDados()
            .then((dados) => {
                if (!ativo) return;
                setEventos(dados.eventos);
                setMetricas(dados.metricas);
                setErro(null);
            })
            .catch((err) => {
                if (!ativo) return;
                console.error("Erro ao carregar painel do organizador:", err);
                setErro(`Erro (${err?.message || "404/403"}) ao acessar "/api/${ROTA_EVENTOS}".`);
            })
            .finally(() => {
                if (ativo) setLoading(false);
            });

        return () => {
            ativo = false;
        };
    }, [carregarDados]);

    async function handlePublicarEvento(id) {
        try {
            await apiRequest(rotaPublicarEvento(id), { method: "PATCH" });
            const dados = await carregarDados();
            setEventos(dados.eventos);
            setMetricas(dados.metricas);
            setErro(null);
        } catch (err) {
            console.error("Erro ao publicar evento:", err);
            alert("Erro ao publicar o evento. Tente novamente.");
        }
    }

    function formatarData(dataString) {
        if (!dataString) return "-";
        if (String(dataString).includes("/")) return dataString;
        const data = new Date(dataString);
        if (Number.isNaN(data.getTime())) return String(dataString);
        return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
    }

    return (
        <>
            <h1 className="title-organizador">Painel Organizador</h1>
            <p className="suborganizador">Visão geral dos seus eventos e vendas</p>

            {erro && <p style={{ color: "red", marginBottom: "1rem" }}>{erro}</p>}

            <div className="dashboard-grid-organizador">
                <div className="card-metrica-organizador">
                    <h3>R$ {loading ? "..." : metricas.receita}</h3>
                    <p>Receita do mês</p>
                </div>

                <div className="card-metrica-organizador">
                    <h3>{loading ? "..." : metricas.ingressos}</h3>
                    <p>Ingressos vendidos</p>
                </div>

                <div className="card-metrica-organizador">
                    <h3>{loading ? "..." : metricas.ativos}</h3>
                    <p>Eventos ativos</p>
                </div>

                <div className="card-metrica-organizador">
                    <h3>{loading ? "..." : metricas.clientes}</h3>
                    <p>Novos clientes</p>
                </div>
            </div>

            <div className="eventos-organizador-heading">
                <h3 className="title-organizador">Eventos</h3>
                <Link href="./organizador/eventos/criar" className="btn-criar-evento">
                    + Criar evento
                </Link>
            </div>

            <div className="lista-eventos">
                <div className="linha-grid cabecalho">
                    <div>Evento</div>
                    <div>Data</div>
                    <div>Vendidos / Total</div>
                    <div>Status</div>
                    <div>Ações</div>
                </div>

                {loading ? (
                    <div style={{ padding: "20px", textAlign: "center" }}>
                        Carregando eventos...
                    </div>
                ) : eventos.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center" }}>
                        Nenhum evento encontrado.
                    </div>
                ) : (
                    eventos.map((evento) => (
                        <div key={evento.id} className="linha-grid item">
                            <div>{evento.nome}</div>
                            <div>{formatarData(evento.data)}</div>
                            <div>
                                {evento.vendidos} / {evento.total}
                            </div>

                            <div style={{ color: evento.statusCor, fontWeight: "bold" }}>
                                {evento.statusLabel}
                            </div>

                            <div className="acoes">
                                <Link href={`/organizador/eventos/${evento.id}/editar`} className="acao-link">
                                    Editar
                                </Link>

                                {" | "}

                                {evento.statusBanco === "RASCUNHO" ? (
                                    <span
                                        className="acao-link"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handlePublicarEvento(evento.id)}
                                    >
                                        Publicar
                                    </span>
                                ) : (
                                    <Link href={`/organizador/eventos/${evento.id}/vendas`} className="acao-link">
                                        Ver vendas
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}