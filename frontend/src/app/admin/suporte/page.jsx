"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./suporte.css";
import { apiRequest } from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";

const MENSAGENS_FAKE = [
  {
    id: 101,
    nome: "Mariana Costa",
    email: "mariana.costa@email.com",
    telefone: "(11) 98765-4321",
    mensagem:
      "Olá! Comprei dois ingressos para o Festival de Verão ontem pelo Pix, o valor já foi debitado da minha conta, mas eles ainda não aparecem na aba 'Meus Ingressos'. Podem verificar?",
    status: "PENDENTE",
    criado_em: "2026-11-24T14:20:00Z",
    respostas: [],
  },
  {
    id: 102,
    nome: "Carlos Eduardo Mendes",
    email: "carlos.produtor@eventossp.com.br",
    telefone: "(11) 99123-4567",
    mensagem:
      "Boa tarde, sou organizador do evento 'Noite do Rock Indie'. Preciso alterar a data do lote promocional, mas o botão de salvar está desabilitado para mim.",
    status: "EM_ANDAMENTO",
    criado_em: "2026-11-23T18:45:00Z",
    respostas: [],
  },
  {
    id: 103,
    nome: "Fernanda Oliveira",
    email: "fernanda.oli@email.com",
    telefone: "(11) 97412-8890",
    mensagem:
      "Gostaria de solicitar o cancelamento e reembolso do pedido #4589, pois não poderei comparecer na nova data do show.",
    status: "RESOLVIDO",
    criado_em: "2026-11-22T10:15:00Z",
    respostas: [
      {
        id: 1,
        texto:
          "Olá Fernanda! Seu reembolso referente ao pedido #4589 já foi processado e o estorno constará na sua fatura em até 5 dias úteis.",
        criado_em: "2026-11-22T11:02:00Z",
      },
    ],
  },
];

export default function AdminSuportePage() {
  const router = useRouter();
  const [mensagens, setMensagens] = useState([]);
  const [mensagemSelecionada, setMensagemSelecionada] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [busca, setBusca] = useState("");
  const [respostaTexto, setRespostaTexto] = useState("");
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [loading, setLoading] = useState(true);

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
        const lista = resultado?.mensagens || resultado;
        const inicial = lista && lista.length > 0 ? lista : MENSAGENS_FAKE;
        setMensagens(inicial);
        setMensagemSelecionada(inicial[0] || null);
      })
      .catch(() => {
        if (!ativo) return;
        setMensagens(MENSAGENS_FAKE);
        setMensagemSelecionada(MENSAGENS_FAKE[0]);
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
    } catch {
      // Atualiza localmente mesmo se a API ainda não estiver conectada
    }

    setMensagens((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, status: "RESOLVIDO" } : msg))
    );
    if (mensagemSelecionada?.id === id) {
      setMensagemSelecionada((prev) => ({ ...prev, status: "RESOLVIDO" }));
    }
  };

  const enviarResposta = async (e) => {
    e.preventDefault();
    if (!respostaTexto.trim() || !mensagemSelecionada) return;

    const sessao = obterSessao();
    if (!sessao) return;

    setEnviandoResposta(true);

    let atualizado = null;
    try {
      atualizado = await apiRequest(
        `admin/suporte/${mensagemSelecionada.id}/responder`,
        {
          method: "POST",
          token: sessao.token,
          body: { resposta: respostaTexto },
        }
      );
    } catch {
      // Fallback local enquanto a API não está conectada
    }

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
      texto: atualizado?.texto || respostaTexto,
      criado_em: atualizado?.criado_em || new Date().toISOString(),
    };

    const novaMensagem = {
      ...mensagemSelecionada,
      respostas: [...respostasAnteriores, novaResposta],
      status: "RESOLVIDO",
    };

    setMensagens((prev) =>
      prev.map((msg) => (msg.id === novaMensagem.id ? novaMensagem : msg))
    );
    setMensagemSelecionada(novaMensagem);
    setRespostaTexto("");
    setEnviandoResposta(false);
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
                Nenhuma mensagem encontrada para este filtro.
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