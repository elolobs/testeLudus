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
  const [categoriaAtiva, setCategoriaAtiva] = useState(""); 

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

  const categoriaPorId = new Map(
    categorias.map((categoria) => [categoria.id, categoria.nome]),
  );

  const eventosFiltrados = useMemo(() => {
    const buscaNormalizada = busca.trim().toLocaleLowerCase("pt-BR");

    return eventos.filter((evento) => {
      const texto = [
        evento.titulo,
        evento.descricao,
        evento.local_nome,
        categoriaPorId.get(evento.categoria_id) 
      ].filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");

      if (buscaNormalizada && !texto.includes(buscaNormalizada)) {
        return false;
      }

      if (categoriaAtiva && String(evento.categoria_id) !== String(categoriaAtiva)) {
        return false;
      }

      return true;
    });
  }, [eventos, busca, categoriaAtiva, categoriaPorId]);

  return (
    <main className="pagina-catalogo">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-kicker">AGENDA LUDUS</span>
          <h1 className="hero-titulo">
            Encontre seu <br />
            <span>próximo evento.</span>
          </h1>
          <p className="hero-subtitulo">
            Explore experiências selecionadas para aprender, celebrar e criar novas conexões.
          </p>
        </div>
      </section>

      <section className="busca-simples-section">
        <form className="busca-input-container" onSubmit={(e) => e.preventDefault()}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Pesquisar por evento, categoria ou cidade"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
          <button type="submit" className="btn-pesquisar-interno">Buscar<i className="fa-solid fa-arrow-right"></i></button>
        </form>
      </section>

      <section className="lista-eventos-section">
        <header className="lista-header">
          <div className="header-textos">
            <span className="lista-kicker">EXPLORE DO SEU JEITO</span>
            <h2 className="lista-titulo">Todos os eventos</h2>
          </div>
          <div className="experiencias-encontradas">
            <span>{eventosFiltrados.length}</span> experiências encontradas
          </div>
        </header>

        <div className="categorias-filtros">
          <button
            className={`btn-categoria ${categoriaAtiva === "" ? "ativo" : ""}`}
            onClick={() => setCategoriaAtiva("")}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              className={`btn-categoria ${categoriaAtiva === String(cat.id) ? "ativo" : ""}`}
              onClick={() => setCategoriaAtiva(String(cat.id))}
            >
              {cat.nome}
            </button>
          ))}
        </div>

        {carregando && <p role="status">Carregando eventos...</p>}
        {erro && <p role="alert">{erro}</p>}
        {!carregando && !erro && eventosFiltrados.length === 0 && (
          <p>Nenhum evento encontrado para a sua busca.</p>
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

      <section className="cta-organizador">
        <div className="cta-content">
          <div className="cta-text-side">
            <span className="cta-kicker">Não encontrou o que procurava?</span>
            <h3>Crie o evento <br/> que você quer <br/> viver.</h3>
          </div>
          <div className="cta-action-side">
            <p>Transforme uma ideia em uma experiência inesquecível com as ferramentas da Ludus.</p>
            <a href="/login" className="btn-organizar">
              Começar a organizar <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}