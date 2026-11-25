"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./home.css";
import CardEvento from "@/components/cardEvento";
import { apiRequest, obterDataCard } from "@/lib/api.mjs";

export default function Home() {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  
  const [indiceAtual, setIndiceAtual] = useState(0);
  const itensPorPagina = 3;

  useEffect(() => {
    let ativo = true;

    Promise.all([
      apiRequest("eventos?limite=100"),
      apiRequest("categorias?limite=100"),
    ])
      .then(([respostaEventos, respostaCategorias]) => {
        if (!ativo) return;
        const destaques = [...respostaEventos.dados].sort(
          (a, b) => new Date(a.data_inicio) - new Date(b.data_inicio),
        );
        setEventos(destaques.slice(0, 12));
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
  
  const categoriasAgrupadas = new Map();
  categorias.forEach((categoria) => {
    const chave = categoria.nome.trim().toLocaleLowerCase("pt-BR");
    const categoriaExistente = categoriasAgrupadas.get(chave);
    if (categoriaExistente) {
      categoriaExistente.ids.push(String(categoria.id));
    } else {
      categoriasAgrupadas.set(chave, {
        ...categoria,
        ids: [String(categoria.id)],
      });
    }
  });
  const categoriasExibidas = [...categoriasAgrupadas.values()].slice(0, 7);

  const irParaProximo = () => {
    if (indiceAtual + itensPorPagina < eventos.length) {
      setIndiceAtual(indiceAtual + itensPorPagina); 
    }
  };

  const irParaAnterior = () => {
    if (indiceAtual - itensPorPagina >= 0) {
      setIndiceAtual(indiceAtual - itensPorPagina); 
    }
  };

  const eventosExibidos = eventos.slice(indiceAtual, indiceAtual + itensPorPagina);

  return (
    <div className="home-page-container">
      <main className="home-main">
        <section className="home-hero-section">
          <div className="home-hero-content">
            <span className="home-hero-kicker">O SEU PRÓXIMO MOMENTO COMEÇA AQUI</span>
            <h1 className="home-hero-title">
              O que você quer viver.<br />
              <span>A gente encontra.</span>
            </h1>
            <p className="home-hero-subtitle">
              Shows, festivais, teatro, stand-up. A maior curadoria de eventos do <br></br>Brasil em um só lugar, com checkout seguro e ingressos no seu app.
            </p>

            <Link href="/eventos" className="home-btn-explorar-novo">
              Explorar mais
              <svg viewBox="0 0 448 512" fill="currentColor" height="1em" width="1em">
                <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
              </svg>
            </Link>
          </div>

          <div className="home-hero-stats-badge">
            <span className="home-stats-number">+480</span>
            <span className="home-stats-text">EVENTOS<br />ESTE MÊS</span>
          </div>
        </section>

        <section className="home-experiences-section">
          <div className="home-experiences-header">
            <div className="home-experiences-title">
              <span className="home-experiences-kicker">CURADORIA LUDUS</span>
              <h2>Eventos em destaque</h2>
            </div>
            <Link href="/eventos" className="home-btn-ver-todos-destaque">
              Ver todos <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          {carregando && <p role="status">Carregando eventos...</p>}
          {erro && <p role="alert">{erro}</p>}
          {!carregando && !erro && eventos.length === 0 && (
            <p>Nenhum evento publicado no momento.</p>
          )}
          <div className="home-carousel-container">
            <button 
              className="home-nav-arrow home-prev-arrow" 
              aria-label="Anterior" 
              type="button"
              onClick={irParaAnterior}
              disabled={indiceAtual === 0}
              style={{ opacity: indiceAtual === 0 ? 0.3 : 1, cursor: indiceAtual === 0 ? 'default' : 'pointer' }}
            >
              ❮
            </button>
            
            <div className="home-grid-eventos" key={indiceAtual}>
              {eventosExibidos.map((evento) => {
                const { dia, mes } = obterDataCard(evento.data_inicio);
                return (
                  <div className="card-evento-wrapper" key={evento.id}>
                    <CardEvento
                      id={evento.id}
                      categoria={categoriaPorId.get(evento.categoria_id) || "EVENTO"}
                      dia={dia}
                      mes={mes}
                      titulo={evento.titulo}
                      local={evento.local_nome}
                      imagem={evento.imagem_capa_url}
                    />
                  </div>
                );
              })}
            </div>

            <button 
              className="home-nav-arrow home-next-arrow" 
              aria-label="Próximo" 
              type="button"
              onClick={irParaProximo}
              disabled={indiceAtual + itensPorPagina >= eventos.length}
              style={{ opacity: indiceAtual + itensPorPagina >= eventos.length ? 0.3 : 1, cursor: indiceAtual + itensPorPagina >= eventos.length ? 'default' : 'pointer' }}
            >
              ❯
            </button>
          </div>
        </section>

       <div className="home-categories-wrapper">
          <section className="home-categories-section">
            <div className="home-categories-intro">
              <span className="home-categories-kicker">PARA CADA VIBE</span>
              <h2>Explorar por<br />categoria</h2>
            </div>
            <ul className="home-categories-list">
              {categoriasExibidas.map((categoria, indice) => (
                <li className="home-category-item" key={categoria.id}>
                  <Link
                    className="home-category-link"
                    href={`/eventos?categoria=${encodeURIComponent(categoria.ids.join(","))}`}
                    aria-label={`Ver eventos de ${categoria.nome}`}
                  >
                    <span className="home-category-number">
                      {String(indice + 1).padStart(2, '0')}
                    </span>
                    <span className="home-category-name">{categoria.nome}</span>
                    <i className="fa-solid fa-arrow-right home-category-arrow" aria-hidden="true"></i>
                  </Link>
                </li>
              ))}
              {!carregando && !erro && categorias.length === 0 && (
                <li className="home-category-item">Nenhuma categoria disponível.</li>
              )}
            </ul>
          </section>
        </div>

        <section className="home-faq-section">
          <div className="home-faq-intro">
            <div className="home-faq-line"></div>
            <h2>Perguntas<br />frequentes</h2>
            <p>
              Não achou sua dúvida?<br />
              Entre em contato com nosso <span><a href="/suporte">Suporte</a></span>
            </p>
          </div>
          <div className="home-faq-accordion">
            <details className="home-faq-item">
              <summary>
                Como recebo o meu bilhete?
                <i className="fa-solid fa-chevron-down home-faq-icon"></i>
              </summary>
              <p>Após a inscrição, o bilhete com QR Code aparece na tua área de ingressos e fica disponível no telemóvel.</p>
            </details>
            <details className="home-faq-item">
              <summary>
                Preciso de imprimir o bilhete?
                <i className="fa-solid fa-chevron-down home-faq-icon"></i>
              </summary>
              <p>Não. Basta mostrar o QR Code no ecrã ao staff, que faz o check-in em segundos.</p>
            </details>
            <details className="home-faq-item">
              <summary>
                O que é a lista de espera?
                <i className="fa-solid fa-chevron-down home-faq-icon"></i>
              </summary>
              <p>Quando um evento esgota, podes entrar na lista de espera e <br />recebes aviso assim que houver vagas ou devoluções.</p>
            </details>
            <details className="home-faq-item">
              <summary>
                Os organizadores podem gerir vários eventos?
                <i className="fa-solid fa-chevron-down home-faq-icon"></i>
              </summary>
              <p>Sim. O dashboard do organizador permite criar, editar e acompanhar eventos,<br /> gerir equipes e consultar relatórios financeiros.</p>
            </details>
            <details className="home-faq-item">
              <summary>
                É necessário CPF para criar conta?
                <i className="fa-solid fa-chevron-down home-faq-icon"></i>
              </summary>
              <p>Sim, o registo exige nome, e-mail válido e CPF para garantir a segurança de participantes e organizadores.</p>
            </details>
          </div>
        </section>

        <section className="home-final-cta-section">
          <h2 className="home-final-cta-section-h2">Pronto para seu <br />próximo Evento?</h2>
          <p className="home-final-cta-section-p">Junta-se ao Ludus e descubra novos eventos</p><br />
          <Link className="home-btn-juntar" href="/cadastro">Começar agora  <svg viewBox="0 0 448 512" fill="currentColor" height="1em" width="1em">
            <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
          </svg></Link>
        </section>
      </main>
    </div>
  );
}