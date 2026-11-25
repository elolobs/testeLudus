"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./admin.css";
import { apiRequest } from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ativo = true;
    const sessao = obterSessao();

    if (!sessao) {
      router.replace(`/login?redirect=${encodeURIComponent("/admin")}`);
      return () => {
        ativo = false;
      };
    }

    if (sessao.usuario.cargo !== "ADMIN") {
      router.replace("/");
      return () => {
        ativo = false;
      };
    }

    apiRequest("admin/dashboard", { token: sessao.token })
      .then((resultado) => {
        if (ativo) setData(resultado);
      })
      .catch((erroApi) => {
        if (ativo) setError(erroApi.message);
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, [router]);

  const handleExportarCSV = () => {
    if (!data?.eventosRecentes || data.eventosRecentes.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    const headers = ["Evento", "Organizador", "Data", "Status"];
    
    const rows = data.eventosRecentes.map((evento) => [
      `"${evento.titulo}"`, 
      `"${evento.organizador}"`,
      new Date(evento.criado_em).toLocaleDateString("pt-BR"),
      evento.status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "eventos_admin.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="admin-estado-tela">
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-estado-tela admin-estado-erro">
        <p>{error}</p>
      </div>
    );
  }

  const formatarStatus = (status) => {
    switch (status) {
      case "PUBLICADO":
        return { texto: "Publicado", classe: "status-publicado" };
      case "RASCUNHO":
        return { texto: "Rascunho", classe: "status-rascunho" };
      case "CANCELADO":
      case "SUSPENSO":
        return {
          texto: status === "CANCELADO" ? "Cancelado" : "Suspenso",
          classe: "status-cancelado",
        };
      case "CONCLUIDO":
        return { texto: "Concluído", classe: "status-concluido" };
      default:
        return { texto: status, classe: "" };
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-content">
        <header className="admin-header">
          <div className="admin-header-title-row">
            <h1>Painel Administrador</h1>
            <button onClick={handleExportarCSV} className="admin-btn-exportar">
              Exportar CSV
            </button>
          </div>
          <p>Visão geral da plataforma, usuários e eventos</p>
        </header>

        <section className="admin-metrics-grid">
          <div className="admin-metric-card">
            <p className="admin-metric-value">
              R$ {Number(data?.metricas?.receitaTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="admin-metric-label">Receita total</p>
          </div>

          <div className="admin-metric-card">
            <p className="admin-metric-value">
              {Number(data?.metricas?.ingressosVendidos || 0).toLocaleString("pt-BR")}
            </p>
            <p className="admin-metric-label">Ingressos vendidos</p>
          </div>

          <div className="admin-metric-card">
            <p className="admin-metric-value">
              {Number(data?.metricas?.eventosPublicados || 0).toLocaleString("pt-BR")}
            </p>
            <p className="admin-metric-label">Eventos ativos</p>
          </div>

          <div className="admin-metric-card">
            <p className="admin-metric-value">
              {Number(data?.metricas?.totalUsuarios || 0).toLocaleString("pt-BR")}
            </p>
            <p className="admin-metric-label">Usuários registrados</p>
          </div>
        </section>

        <div className="admin-section-header">
          <h2>Todos os Eventos</h2>
        </div>
        <div className="admin-table-wrapper">
          <div className="admin-table-list">
            <div className="admin-table-header">
              <div>Evento</div>
              <div>Organizador</div>
              <div>Data</div>
              <div>Status</div>
              <div className="admin-col-acoes">Ações</div>
            </div>

            {data?.eventosRecentes?.map((evento, index) => {
              const statusInfo = formatarStatus(evento.status);
              return (
                <div key={evento.id || index} className="admin-table-row">
                  <div className="admin-col-titulo">{evento.titulo}</div>
                  <div className="admin-col-organizador">{evento.organizador}</div>
                  <div>{new Date(evento.criado_em).toLocaleDateString("pt-BR")}</div>
                  <div className={`status-badge ${statusInfo.classe}`}>
                    {statusInfo.texto}
                  </div>
                  <div className="admin-col-acoes">
                    {evento.id ? (
                      <>
                        <Link href={`/eventos/${evento.id}`} className="admin-link-acao">
                          Ver
                        </Link>{" "}
                        <Link
                          href={`/admin/eventos/${evento.id}/editar`}
                          className="admin-link-acao"
                        >
                          Editar
                        </Link>
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              );
            })}

            {(!data?.eventosRecentes || data.eventosRecentes.length === 0) && (
              <div className="admin-empty-row">Nenhum evento encontrado.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}