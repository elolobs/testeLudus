"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../[id]/editar/editar.css";
import "./criar.css";
import { apiRequest } from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";

const eventoInicial = {
  titulo: "",
  descricao: "",
  categoriaId: "",
  dataInicio: "",
  dataFim: "",
  capacidadeMaxima: "",
  localNome: "",
  localEndereco: "",
  imagemCapaUrl: "",
  playlistUrl: "",
};

const ingressoInicial = () => ({
  nome: "",
  preco: "300",
  quant_total: "",
});

export default function CriarEvento() {
  const router = useRouter();
  const [evento, setEvento] = useState(eventoInicial);
  const [ingressos, setIngressos] = useState([ingressoInicial()]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [eventoCriado, setEventoCriado] = useState(false);
  const quantidadeIngressos = ingressos.reduce(
    (total, ingresso) => total + (Number(ingresso.quant_total) || 0),
    0,
  );

  useEffect(() => {
    let ativo = true;
    const sessao = obterSessao();

    if (!sessao) {
      router.replace(`/login?redirect=${encodeURIComponent("/organizador/eventos/criar")}`);
      return () => {
        ativo = false;
      };
    }

    if (!["ORGANIZADOR", "ADMIN"].includes(sessao.usuario.cargo)) {
      router.replace("/");
      return () => {
        ativo = false;
      };
    }

    apiRequest("categorias?limite=100", { token: sessao.token })
      .then((resposta) => {
        if (ativo) setCategorias(resposta.dados);
      })
      .catch((erroApi) => {
        if (ativo) setErroCarregamento(erroApi.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [router]);

  function handleEventoChange(event) {
    const { name, value } = event.target;
    setEvento((anterior) => ({ ...anterior, [name]: value }));
  }

  function handleIngressoChange(index, campo, valor) {
    setIngressos((anteriores) =>
      anteriores.map((ingresso, indice) =>
        indice === index ? { ...ingresso, [campo]: valor } : ingresso,
      ),
    );
  }

  function adicionarIngresso() {
    setIngressos((anteriores) => [...anteriores, ingressoInicial()]);
  }

  function removerIngresso(indexParaRemover) {
    setIngressos((anteriores) =>
      anteriores.filter((_, index) => index !== indexParaRemover),
    );
  }

  async function criarEvento(event) {
    event.preventDefault();
    setErro("");
    if (quantidadeIngressos > Number(evento.capacidadeMaxima)) {
      setErro("A quantidade de ingressos não pode exceder a capacidade máxima do evento.");
      return;
    }
    setEnviando(true);

    try {
      const sessao = obterSessao();
      if (!sessao) {
        router.replace(`/login?redirect=${encodeURIComponent("/organizador/eventos/criar")}`);
        return;
      }

      const dadosEvento = {
        categoria_id: Number(evento.categoriaId),
        titulo: evento.titulo,
        descricao: evento.descricao,
        capacidade_maxima: Number(evento.capacidadeMaxima),
        status: "RASCUNHO",
        data_inicio: evento.dataInicio,
        data_fim: evento.dataFim,
        local_nome: evento.localNome,
        local_endereco: evento.localEndereco,
        imagem_capa_url: evento.imagemCapaUrl || null,
        playlist_url: evento.playlistUrl.trim() || null,
        tipos_ingresso: ingressos.map((ingresso) => ({
          nome: ingresso.nome,
          preco: Number(ingresso.preco),
          quant_total: Number(ingresso.quant_total),
        })),
      };

      if (sessao.usuario.cargo === "ADMIN") {
        dadosEvento.organizador_id = Number(sessao.usuario.id);
      }

      await apiRequest("eventos", {
        method: "POST",
        token: sessao.token,
        body: dadosEvento,
      });
      setEventoCriado(true);
      router.push("/organizador");
    } catch (erroApi) {
      setErro(erroApi.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="container-editar">
      <h1 className="title-admin">Criar Evento</h1>

      {carregando && <p role="status">Carregando categorias...</p>}
      {erroCarregamento && (
        <p className="criar-evento-mensagem erro" role="alert">{erroCarregamento}</p>
      )}

      {!carregando && !erroCarregamento && (
        <form onSubmit={criarEvento}>
          <section className="seccao-form">
            <h3 className="form-title">
              <i className="fa-regular fa-address-card" /> Informações Básicas
            </h3>

            <div className="form-group">
              <label className="form-group-label" htmlFor="titulo-evento">Nome do Evento</label>
              <input
                className="form-group-links"
                id="titulo-evento"
                type="text"
                name="titulo"
                maxLength={150}
                value={evento.titulo}
                onChange={handleEventoChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-group-label" htmlFor="categoria-evento">Categoria</label>
              <select
                className="form-group-links"
                id="categoria-evento"
                name="categoriaId"
                value={evento.categoriaId}
                onChange={handleEventoChange}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                ))}
              </select>
              {categorias.length === 0 && (
                <small className="dica-texto">Não há categorias disponíveis para selecionar.</small>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-group-label" htmlFor="data-inicio">Data/Hora de Início</label>
                <input
                  className="form-group-links"
                  id="data-inicio"
                  type="datetime-local"
                  name="dataInicio"
                  value={evento.dataInicio}
                  onChange={handleEventoChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-group-label" htmlFor="data-fim">Data/Hora de Fim</label>
                <input
                  className="form-group-links"
                  id="data-fim"
                  type="datetime-local"
                  name="dataFim"
                  min={evento.dataInicio}
                  value={evento.dataFim}
                  onChange={handleEventoChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-group-label" htmlFor="descricao-evento">Descrição Completa</label>
              <textarea
                className="editor-texto-fixo"
                id="descricao-evento"
                name="descricao"
                maxLength={65535}
                value={evento.descricao}
                onChange={handleEventoChange}
                required
              />
            </div>
          </section>

          <section className="seccao-form">
            <h3 className="form-title">
              <i className="fa-solid fa-ticket" /> Ingressos Disponíveis
            </h3>

            {ingressos.map((ingresso, index) => (
              <div key={index} className="card-ingresso-edit">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-group-label" htmlFor={`ingresso-nome-${index}`}>Setor/Tipo</label>
                    <input
                      className="form-group-input"
                      id={`ingresso-nome-${index}`}
                      type="text"
                      maxLength={100}
                      value={ingresso.nome}
                      onChange={(event) => handleIngressoChange(index, "nome", event.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-group-label" htmlFor={`ingresso-preco-${index}`}>Preço (R$)</label>
                    <input
                      className="form-group-input"
                      id={`ingresso-preco-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={ingresso.preco}
                      onChange={(event) => handleIngressoChange(index, "preco", event.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-group-label" htmlFor={`ingresso-quantidade-${index}`}>Quantidade de ingressos</label>
                    <input
                      className="form-group-input"
                      id={`ingresso-quantidade-${index}`}
                      type="number"
                      min="1"
                      step="1"
                      value={ingresso.quant_total}
                      onChange={(event) => handleIngressoChange(index, "quant_total", event.target.value)}
                      required
                    />
                  </div>
                  {ingressos.length > 1 && (
                    <div className="form-group acao-remover">
                      <button
                        type="button"
                        onClick={() => removerIngresso(index)}
                        className="btn-remover"
                        aria-label={`Remover ingresso ${index + 1}`}
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <p className="dica-texto" aria-live="polite">
              Quantidade total cadastrada: {quantidadeIngressos}
              {evento.capacidadeMaxima ? ` de ${evento.capacidadeMaxima}` : ""}
            </p>

            <div className="form-group">
              <label className="form-group-label" htmlFor="capacidade-evento">Capacidade máxima do evento</label>
              <input
                className="form-group-input"
                id="capacidade-evento"
                type="number"
                min="1"
                step="1"
                name="capacidadeMaxima"
                value={evento.capacidadeMaxima}
                onChange={handleEventoChange}
                required
              />
            </div>

            <button type="button" onClick={adicionarIngresso} className="btn-adicionar">
              + Adicionar Novo Ingresso
            </button>
          </section>

          <section className="seccao-form">
            <h3 className="form-title">
              <i className="fa-regular fa-pen-to-square" /> Localização e Imagem
            </h3>

            <div className="form-group">
              <label className="form-group-label" htmlFor="local-nome">Nome do local</label>
              <input
                className="form-group-links"
                id="local-nome"
                type="text"
                name="localNome"
                maxLength={150}
                value={evento.localNome}
                onChange={handleEventoChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-group-label" htmlFor="local-endereco">Endereço</label>
              <textarea
                className="editor-texto-fixo"
                id="local-endereco"
                name="localEndereco"
                maxLength={65535}
                value={evento.localEndereco}
                onChange={handleEventoChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-group-label" htmlFor="imagem-evento">Link da imagem de capa</label>
              <input
                className="form-group-links"
                id="imagem-evento"
                type="url"
                name="imagemCapaUrl"
                maxLength={255}
                value={evento.imagemCapaUrl}
                onChange={handleEventoChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label className="form-group-label" htmlFor="playlist-artista">Playlist do artista</label>
              <input
                className="form-group-links"
                id="playlist-artista"
                type="url"
                name="playlistUrl"
                maxLength={255}
                value={evento.playlistUrl}
                onChange={handleEventoChange}
                placeholder="https://open.spotify.com/playlist/..."
              />
            </div>
          </section>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => router.push("/organizador")}
              className="btn-cancelar"
              disabled={enviando}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-guardar" disabled={enviando || eventoCriado}>
              {enviando ? "Criando evento..." : "Criar Evento"}
            </button>
          </div>
          {erro && <p className="criar-evento-mensagem erro" role="alert">{erro}</p>}
        </form>
      )}
    </div>
  );
}
