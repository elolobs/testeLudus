"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./suporte.css";
import { apiRequest } from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";

export default function AdminSuportePage() {
  const router = useRouter();
  const [mensagens, setMensagens] = useState([]);
  const [mensagemSelecionada, setMensagemSelecionada] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [busca, setBusca] = useState("");
  const [respostaTexto, setRespostaTexto] = useState("");
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ativo = true;
    const sessao = obterSessao();

    if (!sessao) {
      router.replace(`/login?redirect=${encodeURIComponent("/admin/suporte")}`);
      return () => {
        ativo = false;
      };
    }

    if (sessao.usuario?.cargo !== "ADMIN") {
      router.replace("/");
      return () => {
        ativo = false;
      };
    }

    apiRequest("admin/suporte", { token: sessao.token })
      .then((resultado) => {
        if (!ativo) return;
        const lista = Array.isArray(resultado)
          ? resultado
          : resultado?.mensagens || [];
        setMensagens(lista);
        setMensagemSelecionada(lista[0] || null);
      })
      .catch((erroApi) => {
        if (!ativo) return;
        setError(erroApi.message || "Erro ao carregar mensagens do suporte.");
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, [router]);

  const selecionarMensagem = (msg) => {
    setMensagemSelecionada(msg);
    setRespostaTexto("");
  };

  const marcarComoResolvido = async (id) => {
    const sessao = obterSessao();
    if (!sessao) return;

    try {
      await apiRequest(`admin/suporte/${id}`, {
        method: "PATCH",
        token: sessao.token,
        body: { status: "RESOLVIDO" },
      });

      setMensagens((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status: "RESOLVIDO" } : msg))
      );
      if (mensagemSelecionada?.id === id) {
        setMensagemSelecionada((prev) => ({ ...prev, status: "RESOLVIDO" }));
      }
    } catch (err) {
      alert(err.message || "Não foi possível atualizar o status.");
    }
  };

  const enviarResposta = async (e) => {
    e.preventDefault();
    if (!respostaTexto.trim() || !mensagemSelecionada) return;

    const sessao = obterSessao();
    if (!sessao) return;

    setEnviandoResposta(true);

    try {
      const atualizado = await apiRequest(
        `admin/suporte/${mensagemSelecionada.id}/responder`,
        {
          method: "POST",
          token: sessao.token,
          body: { resposta: respostaTexto },
        }
      );

      const respostasAnteriores = Array.isArray(mensagemSelecionada.respostas)
        ? mensagemSelecionada.respostas
        : mensagemSelecionada.resposta
        ? [
            {
              id: "antiga",
              texto: mensagemSelecionada.resposta,
              criado_em: mensagemSelecionada.respondido_em,
            },
          ]
        : [];

      const novaResposta = {
        id: atualizado?.id || Date.now(),
        texto: atualizado?.texto || atualizado?.resposta || respostaTexto,
        criado_em: atualizado?.criado_em || new Date().toISOString(),
      };

      const novaMensagem = {
        ...mensagemSelecionada,
        respostas: [...respostasAnteriores, novaResposta],
        status: atualizado?.status || "RESOLVIDO",
      };

      setMensagens((prev) =>
        prev.map((msg) => (msg.id === novaMensagem.id ? novaMensagem : msg))
      );
      setMensagemSelecionada(novaMensagem);
      setRespostaTexto("");
    } catch (err) {
      alert(err.message || "Erro ao enviar resposta.");
    } finally {
      setEnviandoResposta(false);
    }
  };

  const formatarStatus = (status) => {
    switch (status) {
      case "RESOLVIDO":
        return { texto: "Resolvido", classe: "badge-resolvido" };
      case "EM_ANDAMENTO":
        return { texto: "Em andamento", classe: "badge-andamento" };
      case "PENDENTE":
      default:
        return { texto: "Pendente", classe: "badge-pendente" };
    }
  };

  const mensagensFiltradas = mensagens.filter((msg) => {
    const bateStatus =
      filtroStatus === "TODOS" || msg.status === filtroStatus;
    const termo = busca.toLowerCase();
    const bateBusca =
      !termo ||
      msg.nome?.toLowerCase().includes(termo) ||
      msg.email?.toLowerCase().includes(termo) ||
      msg.mensagem?.toLowerCase().includes(termo);

    return bateStatus && bateBusca;
  });

  if (loading) {
    return (
      <div className="suporte-admin-loading">
        <p>Carregando mensagens do suporte...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="suporte-admin-loading">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="suporte-admin-container">
      <div className="suporte-admin-content">
        <header className="suporte-admin-header">
          <div>
            <Link href="/admin" className="btn-voltar-admin">
              ← Voltar ao Painel
            </Link>
            <h1>Central de Mensagens</h1>
            <p>Gerencie e responda às solicitações enviadas pelo suporte</p>
          </div>

          <div className="suporte-admin-resumo">
            <span className="resumo-pill">
              Pendentes:{" "}
              <strong>
                {mensagens.filter((m) => m.status === "PENDENTE").length}
              </strong>
            </span>
            <span className="resumo-pill">
              Total: <strong>{mensagens.length}</strong>
            </span>
          </div>
        </header>

        <div className="suporte-admin-filtros">
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou assunto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="suporte-input-busca"
          />

          <div className="suporte-tabs-status">
            {[
              { id: "TODOS", label: "Todas" },
              { id: "PENDENTE", label: "Pendentes" },
              { id: "EM_ANDAMENTO", label: "Em andamento" },
              { id: "RESOLVIDO", label: "Resolvidas" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`tab-status ${
                  filtroStatus === tab.id ? "ativa" : ""
                }`}
                onClick={() => setFiltroStatus(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="suporte-inbox-grid">
          <aside className="suporte-lista-coluna">
            {mensagensFiltradas.map((msg) => {
              const statusInfo = formatarStatus(msg.status);
              const selecionada = mensagemSelecionada?.id === msg.id;

              return (
                <button
                  key={msg.id}
                  type="button"
                  className={`suporte-item-card ${
                    selecionada ? "selecionado" : ""
                  }`}
                  onClick={() => selecionarMensagem(msg)}
                >
                  <div className="suporte-item-topo">
                    <strong>{msg.nome}</strong>
                    <span className={`suporte-badge ${statusInfo.classe}`}>
                      {statusInfo.texto}
                    </span>
                  </div>
                  <p className="suporte-item-preview">{msg.mensagem}</p>
                  <div className="suporte-item-rodape">
                    <span>{msg.email}</span>
                    <span>
                      {msg.criado_em
                        ? new Date(msg.criado_em).toLocaleDateString("pt-BR")
                        : ""}
                    </span>
                  </div>
                </button>
              );
            })}

            {mensagensFiltradas.length === 0 && (
              <div className="suporte-vazio">
                Nenhuma mensagem encontrada.
              </div>
            )}
          </aside>

          <section className="suporte-detalhe-coluna">
            {mensagemSelecionada ? (
              <>
                <div className="suporte-detalhe-header">
                  <div>
                    <h2>{mensagemSelecionada.nome}</h2>
                    <p>
                      {mensagemSelecionada.email} •{" "}
                      {mensagemSelecionada.telefone}
                    </p>
                  </div>

                  {mensagemSelecionada.status !== "RESOLVIDO" && (
                    <button
                      type="button"
                      className="btn-marcar-resolvido"
                      onClick={() =>
                        marcarComoResolvido(mensagemSelecionada.id)
                      }
                    >
                      Marcar como Resolvido
                    </button>
                  )}
                </div>

                <div className="suporte-bolha-usuario">
                  <div className="bolha-meta">
                    <span>Mensagem do usuário</span>
                    <span>
                      {mensagemSelecionada.criado_em
                        ? new Date(
                            mensagemSelecionada.criado_em
                          ).toLocaleString("pt-BR")
                        : ""}
                    </span>
                  </div>
                  <p>{mensagemSelecionada.mensagem}</p>
                </div>

                {(mensagemSelecionada.respostas || []).map((resp, idx) => (
                  <div
                    key={resp.id || idx}
                    className="suporte-bolha-admin"
                  >
                    <div className="bolha-meta">
                      <span>Sua resposta #{idx + 1}</span>
                      <span>
                        {resp.criado_em
                          ? new Date(resp.criado_em).toLocaleString("pt-BR")
                          : ""}
                      </span>
                    </div>
                    <p>{resp.texto}</p>
                  </div>
                ))}

                <form
                  onSubmit={enviarResposta}
                  className="suporte-form-resposta"
                >
                  <label htmlFor="campo-resposta">
                    {mensagemSelecionada.respostas?.length > 0
                      ? "Enviar nova resposta"
                      : "Responder solicitação"}
                  </label>
                  <textarea
                    id="campo-resposta"
                    rows={5}
                    placeholder={`Escreva uma resposta para ${mensagemSelecionada.nome}...`}
                    value={respostaTexto}
                    onChange={(e) => setRespostaTexto(e.target.value)}
                    required
                  />
                  <div className="suporte-form-acoes">
                    <button
                      type="submit"
                      className="btn-enviar-resposta"
                      disabled={enviandoResposta || !respostaTexto.trim()}
                    >
                      {enviandoResposta ? "Enviando..." : "Enviar Resposta"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="suporte-vazio">
                Selecione uma mensagem ao lado para ler e responder.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}