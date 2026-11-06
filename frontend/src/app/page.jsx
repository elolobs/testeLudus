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
              Vive mais.<br />
              <span>Descobre agora.</span>
            </h1>
            <p className="hero-subtitle">
              Eventos, festivais e experiências que ficam contigo.
            </p>
            <Link href="/eventos" className="btn-pesquisar">Explorar</Link>
          </div>
        </section>

        <section className="experiences-section">
          <h2>Experiências em destaque</h2><br />
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

        <section className="categories-section">
          <div className="categories-header">
            <h2>Explorar por categoria</h2>
            <Link href="/eventos" className="btn-ver-todos">Ver todos</Link>
          </div>
          <ul className="categories-list">
            {categorias.map((categoria, indice) => (
              <li className="category-item" key={categoria.id}>
                <span className="category-number">{indice + 1}</span>
                <span className="category-name">{categoria.nome}</span>
                <span className="category-arrow">➔</span>
              </li>
            ))}
            {!carregando && !erro && categorias.length === 0 && (
              <li className="category-item">Nenhuma categoria disponível.</li>
            )}
          </ul>
        </section>

        <section className="faq-section">
          <div className="faq-intro">
            <h2>Perguntas Frequentes</h2><br />
            <p>
              Não achou sua dúvida? Entre em contato com nosso <span><a href="/suporte">suporte</a></span>
            </p>
          </div>
          <div className="faq-accordion">
            <details className="faq-item">
              <summary>Como recebo o meu bilhete?<span className="faq-icon">⌄</span></summary>
              <p>Após a inscrição, o bilhete com QR Code aparece na tua área de ingressos e fica disponível no telemóvel.</p>
            </details>
            <details className="faq-item">
              <summary>Preciso de imprimir o bilhete?<span className="faq-icon">⌄</span></summary>
              <p>Não. Basta mostrar o QR Code no ecrã ao staff, que faz o check-in em segundos.</p>
            </details>
            <details className="faq-item">
              <summary>O que é a lista de espera? <span className="faq-icon">⌄</span></summary>
              <p>Quando um evento esgota, podes entrar na lista de espera e <br />recebes aviso assim que houver vagas ou devoluções.</p>
            </details>
            <details className="faq-item">
              <summary>Os organizadores podem gerir vários eventos? <span className="faq-icon">⌄</span></summary>
              <p>Sim. O dashboard do organizador permite criar, editar e acompanhar eventos,<br /> gerir equipes e consultar relatórios financeiros.</p>
            </details>
            <details className="faq-item">
              <summary>É necessário CPF para criar conta? <span className="faq-icon">⌄</span></summary>
              <p>Sim, o registo exige nome, e-mail válido e CPF para garantir a segurança de participantes e organizadores.</p>
            </details>
          </div>
        </section>

        <section className="final-cta-section">
          <h2>Pronto para seu <br />próximo Evento?</h2>
          <p>Junta-se ao Ludus e descubra novos eventos</p><br />
          <Link className="btn-juntar" href="/cadastro">Começar agora</Link>
        </section>
      </main>
    </div>
  );
}
