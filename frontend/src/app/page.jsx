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
        setEventos(destaques.slice(0, 3));
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

  return (
    <div className="page-container">
      <main className="home-main">
        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-kicker">O SEU PRÓXIMO MOMENTO COMEÇA AQUI</span>
            <h1 className="hero-title">
              O que você quer viver.<br />
              <span>A gente encontra.</span>
            </h1>
            <p className="hero-subtitle">
              Shows, festivais, teatro, stand-up. A maior curadoria de eventos do <br></br>Brasil em um só lugar, com checkout seguro e ingressos no seu app.
            </p>

            <Link href="/eventos" className="btn-explorar-novo">
              Explorar mais
              <svg viewBox="0 0 448 512" fill="currentColor" height="1em" width="1em">
                <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
              </svg>
            </Link>
          </div>

          <div className="hero-stats-badge">
            <span className="stats-number">+480</span>
            <span className="stats-text">EVENTOS<br />ESTE MÊS</span>
          </div>
        </section>

        <section className="experiences-section">
          <div className="experiences-header">
            <div className="experiences-title">
              <span className="experiences-kicker">CURADORIA LUDUS</span>
              <h2>Eventos em destaque</h2>
            </div>
            <Link href="/eventos" className="btn-ver-todos-destaque">
              Ver todos <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          {carregando && <p role="status">Carregando eventos...</p>}
          {erro && <p role="alert">{erro}</p>}
          {!carregando && !erro && eventos.length === 0 && (
            <p>Nenhum evento publicado no momento.</p>
          )}
          <div className="carousel-container">
            <button className="nav-arrow prev-arrow" aria-label="Anterior" type="button">❮</button>
            <div className="grid-eventos">
              {eventos.map((evento) => {
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
            <button className="nav-arrow next-arrow" aria-label="Próximo" type="button">❯</button>
          </div>
        </section>

       <div className="categories-wrapper">
          <section className="categories-section">
            <div className="categories-intro">
              <span className="categories-kicker">PARA CADA VIBE</span>
              <h2>Explorar por<br />categoria</h2>
            </div>
            <ul className="categories-list">
              {categorias.map((categoria, indice) => (
                <li className="category-item" key={categoria.id}>
                  <span className="category-number">
                    {String(indice + 1).padStart(2, '0')}
                  </span>
                  <span className="category-name">{categoria.nome}</span>
                  <i className="fa-solid fa-arrow-right category-arrow"></i>
                </li>
              ))}
              {!carregando && !erro && categorias.length === 0 && (
                <li className="category-item">Nenhuma categoria disponível.</li>
              )}
            </ul>
          </section>
        </div>

        <section className="faq-section">
          <div className="faq-intro">
            <div className="faq-line"></div>
            <h2>Perguntas<br />frequentes</h2>
            <p>
              Não achou sua dúvida?<br />
              Entre em contato com nosso <span><a href="/suporte">Suporte</a></span>
            </p>
          </div>
          <div className="faq-accordion">
            <details className="faq-item">
              <summary>
                Como recebo o meu bilhete?
                <i className="fa-solid fa-chevron-down faq-icon"></i>
              </summary>
              <p>Após a inscrição, o bilhete com QR Code aparece na tua área de ingressos e fica disponível no telemóvel.</p>
            </details>
            <details className="faq-item">
              <summary>
                Preciso de imprimir o bilhete?
                <i className="fa-solid fa-chevron-down faq-icon"></i>
              </summary>
              <p>Não. Basta mostrar o QR Code no ecrã ao staff, que faz o check-in em segundos.</p>
            </details>
            <details className="faq-item">
              <summary>
                O que é a lista de espera?
                <i className="fa-solid fa-chevron-down faq-icon"></i>
              </summary>
              <p>Quando um evento esgota, podes entrar na lista de espera e <br />recebes aviso assim que houver vagas ou devoluções.</p>
            </details>
            <details className="faq-item">
              <summary>
                Os organizadores podem gerir vários eventos?
                <i className="fa-solid fa-chevron-down faq-icon"></i>
              </summary>
              <p>Sim. O dashboard do organizador permite criar, editar e acompanhar eventos,<br /> gerir equipes e consultar relatórios financeiros.</p>
            </details>
            <details className="faq-item">
              <summary>
                É necessário CPF para criar conta?
                <i className="fa-solid fa-chevron-down faq-icon"></i>
              </summary>
              <p>Sim, o registo exige nome, e-mail válido e CPF para garantir a segurança de participantes e organizadores.</p>
            </details>
          </div>
        </section>

        <section className="final-cta-section">
          <h2 className="final-cta-section-h2">Pronto para seu <br />próximo Evento?</h2>
          <p className="final-cta-section-p">Junta-se ao Ludus e descubra novos eventos</p><br />
          <Link className="btn-juntar" href="/cadastro">Começar agora  <svg viewBox="0 0 448 512" fill="currentColor" height="1em" width="1em">
            <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
          </svg></Link>
        </section>
      </main>
    </div>
  );
}