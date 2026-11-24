"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./chamados.css";
import { apiRequest } from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";

export default function MeusChamadosPage() {
  const router = useRouter();
  const [chamados, setChamados] = useState([]);
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  const [novaMensagemTexto, setNovaMensagemTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ativo = true;
    const sessao = obterSessao();

    if (!sessao) {
      router.replace(`/login?redirect=${encodeURIComponent("/meus-chamados")}`);
      return () => {
        ativo = false;
      };
    }

    apiRequest("suporte/meus-chamados", { token: sessao.token })
      .then((resultado) => {
        if (!ativo) return;
        const lista = Array.isArray(resultado)
          ? resultado
          : resultado?.chamados || [];
        setChamados(lista);
        setChamadoSelecionado(lista[0] || null);
      })
      .catch((erroApi) => {
        if (!ativo) return;
        setError(erroApi.message || "Erro ao carregar suas solicitações.");
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, [router]);

  const selecionarChamado = (chamado) => {
    setChamadoSelecionado(chamado);
    setNovaMensagemTexto("");
  };

  const enviarReplica = async (e) => {
    e.preventDefault();
    if (!novaMensagemTexto.trim() || !chamadoSelecionado) return;

    const sessao = obterSessao();
    if (!sessao) return;

    setEnviando(true);

    try {
      const criado = await apiRequest(
        `suporte/meus-chamados/${chamadoSelecionado.id}/mensagens`,
        {
          method: "POST",
          token: sessao.token,
          body: { texto: novaMensagemTexto },
        }
      );

      const novaReplica = {
        id: criado?.id || Date.now(),
        autor: "CLIENTE",
        nome_autor: sessao.usuario?.nome || "Você",
        texto: criado?.texto || novaMensagemTexto,
        criado_em: criado?.criado_em || new Date().toISOString(),
      };

      const chamadoAtualizado = {
        ...chamadoSelecionado,
        respostas: [...(chamadoSelecionado.respostas || []), novaReplica],
        status: "PENDENTE",
      };

      setChamados((prev) =>
        prev.map((c) => (c.id === chamadoAtualizado.id ? chamadoAtualizado : c))
      );
      setChamadoSelecionado(chamadoAtualizado);
      setNovaMensagemTexto("");
    } catch (err) {
      alert(err.message || "Erro ao enviar mensagem.");
    } finally {
      setEnviando(false);
    }
  };

  const formatarStatus = (status) => {
    switch (status) {
      case "RESPONDIDO":
        return { texto: "Respondido", classe: "badge-respondido" };
      case "RESOLVIDO":
        return { texto: "Concluído", classe: "badge-resolvido" };
      case "PENDENTE":
      default:
        return { texto: "Aguardando suporte", classe: "badge-pendente" };
    }
  };

  if (loading) {
    return (
      <div className="cliente-suporte-loading">
        <p>Carregando suas solicitações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cliente-suporte-loading">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="cliente-suporte-container">
      <div className="cliente-suporte-content">
        <header className="cliente-suporte-header">
          <div>
            <h1>Minhas Solicitações</h1>
            <p>Acompanhe as respostas da nossa equipe de atendimento</p>
          </div>

          <Link href="/suporte" className="btn-novo-chamado">
            + Abrir Nova Solicitação
          </Link>
        </header>

        <div className="cliente-inbox-grid">
          <aside className="cliente-lista-coluna">
            {chamados.map((item) => {
              const statusInfo = formatarStatus(item.status);
              const selecionado = chamadoSelecionado?.id === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`cliente-item-card ${
                    selecionado ? "selecionado" : ""
                  }`}
                  onClick={() => selecionarChamado(item)}
                >
                  <div className="cliente-item-topo">
                    <span className="cliente-ticket-id">#{item.id}</span>
                    <span className={`cliente-badge ${statusInfo.classe}`}>
                      {statusInfo.texto}
                    </span>
                  </div>
                  <strong className="cliente-item-assunto">
                    {item.assunto || "Solicitação de Suporte"}
                  </strong>
                  <p className="cliente-item-preview">{item.mensagem}</p>
                  <span className="cliente-item-data">
                    {item.criado_em
                      ? new Date(item.criado_em).toLocaleDateString("pt-BR")
                      : ""}
                  </span>
                </button>
              );
            })}

            {chamados.length === 0 && (
              <div className="cliente-vazio">
                <p>Você ainda não abriu nenhuma solicitação.</p>
                <Link href="/suporte" className="btn-novo-chamado">
                  Falar com o Suporte
                </Link>
              </div>
            )}
          </aside>

          <section className="cliente-detalhe-coluna">
            {chamadoSelecionado ? (
              <>
                <div className="cliente-detalhe-header">
                  <div>
                    <h2>
                      {chamadoSelecionado.assunto ||
                        `Solicitação #${chamadoSelecionado.id}`}
                    </h2>
                    <span>
                      Aberta em{" "}
                      {chamadoSelecionado.criado_em
                        ? new Date(
                            chamadoSelecionado.criado_em
                          ).toLocaleString("pt-BR")
                        : ""}
                    </span>
                  </div>
                  <span
                    className={`cliente-badge ${
                      formatarStatus(chamadoSelecionado.status).classe
                    }`}
                  >
                    {formatarStatus(chamadoSelecionado.status).texto}
                  </span>
                </div>

                <div className="cliente-chat-historico">
                  <div className="chat-bolha bolha-cliente">
                    <div className="bolha-topo">
                      <strong>Você</strong>
                      <span>
                        {chamadoSelecionado.criado_em
                          ? new Date(
                              chamadoSelecionado.criado_em
                            ).toLocaleString("pt-BR")
                          : ""}
                      </span>
                    </div>
                    <p>{chamadoSelecionado.mensagem}</p>
                  </div>

                  {(chamadoSelecionado.respostas || []).map((msg, idx) => {
                    const ehCliente = msg.autor === "CLIENTE";
                    return (
                      <div
                        key={msg.id || idx}
                        className={`chat-bolha ${
                          ehCliente ? "bolha-cliente" : "bolha-suporte"
                        }`}
                      >
                        <div className="bolha-topo">
                          <strong>
                            {ehCliente
                              ? "Você"
                              : msg.nome_autor || "Suporte LD Eventos"}
                          </strong>
                          <span>
                            {msg.criado_em
                              ? new Date(msg.criado_em).toLocaleString("pt-BR")
                              : ""}
                          </span>
                        </div>
                        <p>{msg.texto}</p>
                      </div>
                    );
                  })}
                </div>

                {chamadoSelecionado.status !== "RESOLVIDO" ? (
                  <form
                    onSubmit={enviarReplica}
                    className="cliente-form-replica"
                  >
                    <textarea
                      rows={3}
                      placeholder="Escreva uma nova mensagem para o suporte..."
                      value={novaMensagemTexto}
                      onChange={(e) => setNovaMensagemTexto(e.target.value)}
                      required
                    />
                    <div className="cliente-form-acoes">
                      <button
                        type="submit"
                        className="btn-enviar-replica"
                        disabled={enviando || !novaMensagemTexto.trim()}
                      >
                        {enviando ? "Enviando..." : "Enviar Mensagem"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="chamado-encerrado-aviso">
                    Esta solicitação foi marcada como concluída. Caso precise de
                    mais ajuda, <Link href="/suporte">abra um novo chamado</Link>.
                  </div>
                )}
              </>
            ) : (
              <div className="cliente-vazio">
                Selecione uma solicitação ao lado para visualizar a conversa.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}