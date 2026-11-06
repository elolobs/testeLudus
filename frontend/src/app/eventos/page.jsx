"use client";

import { useEffect, useMemo, useState } from "react";
import "./eventos.css";
import CardEvento from "@/components/cardEvento";
import { apiRequest, obterDataCard } from "@/lib/api.mjs";

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [local, setLocal] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [ordenacao, setOrdenacao] = useState("recentes");
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    busca: "",
    local: "",
    categoriaId: "",
    periodo: "",
    agora: 0,
  });

  useEffect(() => {
    let ativo = true;

    Promise.all([
      apiRequest("eventos?limite=100"),
      apiRequest("categorias?limite=100"),
    ])
      .then(([respostaEventos, respostaCategorias]) => {
        if (!ativo) return;
        setEventos(respostaEventos.dados);
        setCategorias(respostaCategorias.dados);
      })
      .catch((erroApi) => {
        if (ativo) setErro(erroApi.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const locais = [...new Set(eventos.map((evento) => evento.local_nome).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
  const categoriaPorId = new Map(
    categorias.map((categoria) => [categoria.id, categoria.nome]),
  );
  const eventosFiltrados = useMemo(() => {
    const buscaNormalizada = filtrosAplicados.busca.trim().toLocaleLowerCase("pt-BR");
    const agora = filtrosAplicados.agora;
    const filtrados = eventos.filter((evento) => {
      const texto = [
        evento.titulo,
        evento.descricao,
        evento.local_nome,
        evento.local_endereco,
      ].filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");
      if (buscaNormalizada && !texto.includes(buscaNormalizada)) return false;
      if (filtrosAplicados.local && evento.local_nome !== filtrosAplicados.local) return false;
      if (filtrosAplicados.categoriaId && String(evento.categoria_id) !== filtrosAplicados.categoriaId) {
        return false;
      }

      const inicio = new Date(evento.data_inicio).getTime();
      if (filtrosAplicados.periodo === "7" && (inicio < agora || inicio > agora + 7 * 86400000)) {
        return false;
      }
      if (filtrosAplicados.periodo === "30" && (inicio < agora || inicio > agora + 30 * 86400000)) {
        return false;
      }
      if (filtrosAplicados.periodo === "futuros" && inicio < agora) return false;
      return true;
    });

    return filtrados.sort((a, b) => {
      const diferenca = new Date(a.data_inicio) - new Date(b.data_inicio);
      return ordenacao === "recentes" ? -diferenca : diferenca;
    });
  }, [eventos, filtrosAplicados, ordenacao]);

  function buscarEventos(event) {
    event.preventDefault();
    setFiltrosAplicados({ busca, local, categoriaId, periodo, agora: Date.now() });
  }

  return (
    <main className="pagina-catalogo">
      <section className="hero-section">
        <span className="hero-kicker">CATÁLOGO DE EVENTOS</span>
        <h1 className="hero-titulo">
          Encontre seu <br />
          <span>próximo evento.</span>
        </h1>
        <p className="hero-subtitulo">Explore festivais, shows, palestras, festas e muito mais.</p>
      </section>

      <section className="busca-section">
        <form className="busca-form" onSubmit={buscarEventos}>
          <div className="campo-busca">
            <label htmlFor="busca-eventos">O que você procura?</label>
            <input
              id="busca-eventos"
              type="text"
              placeholder="Ex: shows, festival, artista..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>
          <div className="campo-busca">
            <label htmlFor="local-eventos">Onde?</label>
            <select id="local-eventos" value={local} onChange={(event) => setLocal(event.target.value)}>
              <option value="">Todo o Brasil</option>
              {locais.map((nomeLocal) => <option key={nomeLocal} value={nomeLocal}>{nomeLocal}</option>)}
            </select>
          </div>
          <div className="campo-busca">
            <label htmlFor="categoria-eventos">Categoria</label>
            <select
              id="categoria-eventos"
              value={categoriaId}
              onChange={(event) => setCategoriaId(event.target.value)}
            >
              <option value="">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
              ))}
            </select>
          </div>
          <div className="campo-busca">
            <label htmlFor="periodo-eventos">Data</label>
            <select id="periodo-eventos" value={periodo} onChange={(event) => setPeriodo(event.target.value)}>
              <option value="">Qualquer data</option>
              <option value="7">Próximos 7 dias</option>
              <option value="30">Próximos 30 dias</option>
              <option value="futuros">Todos os próximos eventos</option>
            </select>
          </div>
          <button type="submit" className="btn-buscar">Buscar ➔</button>
        </form>
      </section>

      <section className="lista-eventos-section">
        <header className="lista-header">
          <div>
            <span className="lista-kicker">EVENTOS DISPONÍVEIS</span>
            <h2 className="lista-titulo">Todos os eventos</h2>
          </div>
          <div className="ordenacao">
            <label htmlFor="ordenacao-eventos">Ordenar por</label>
            <select
              id="ordenacao-eventos"
              value={ordenacao}
              onChange={(event) => setOrdenacao(event.target.value)}
            >
              <option value="recentes">Mais recentes</option>
              <option value="proximos">Próximos primeiro</option>
            </select>
          </div>
        </header>

        {carregando && <p role="status">Carregando eventos...</p>}
        {erro && <p role="alert">{erro}</p>}
        {!carregando && !erro && eventosFiltrados.length === 0 && (
          <p>Nenhum evento encontrado para esses filtros.</p>
        )}
        <div className="grid-eventos">
          {eventosFiltrados.map((evento) => {
            const { dia, mes } = obterDataCard(evento.data_inicio);
            return (
              <CardEvento
                key={evento.id}
                id={evento.id}
                categoria={categoriaPorId.get(evento.categoria_id) || "EVENTO"}
                dia={dia}
                mes={mes}
                titulo={evento.titulo}
                local={evento.local_nome}
                imagem={evento.imagem_capa_url || "/img/tech.png"}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}
