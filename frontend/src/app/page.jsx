import styles from "./home.css";
import CardEvento from "@/components/cardEvento";

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

  const listaEventos = [
    { id: 1, categoria: "MÚSICA", dia: "18", mes: "OUT", titulo: "Future Summit 2026", local: "São Paulo, SP", imagem: "/caminho-da-imagem1.jpg" },
    { id: 2, categoria: "FESTIVAL", dia: "24", mes: "OUT", titulo: "Festival Aurora", local: "Parque Villa-Lobos, SP", imagem: "/caminho-da-imagem2.jpg" },
    { id: 3, categoria: "EXPERIÊNCIA", dia: "02", mes: "NOV", titulo: "Ludus Experience", local: "Marina da Glória, RJ", imagem: "/caminho-da-imagem3.jpg" },
];

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
           
              <button type="submit" className="btn-pesquisar">
                Explorar 
              </button>
           
          </div>
        </section>

        <section className="experiences-section">
          <h2>Experiências em destaque</h2><br></br>
          <div className="carousel-container">
            <button className="nav-arrow prev-arrow" aria-label="Anterior">❮</button>
            
                <div className="grid-eventos">
                                  {listaEventos.map((evento) => (
                                      <CardEvento 
                                          key={evento.id}
                                          categoria={evento.categoria}
                                          dia={evento.dia}
                                          mes={evento.mes}
                                          titulo={evento.titulo}
                                          local={evento.local}
                                          imagem={evento.imagem}
                                      />
                                  ))}
                              </div>

            <button className="nav-arrow next-arrow" aria-label="Próximo">❯</button>
          </div>
        </section>

        <section className="categories-section">
          <div className="categories-header">
            <h2>Explorar por categoria</h2>
            <button className="btn-ver-todos">Ver todos</button>
          </div>
          
          <ul className="categories-list">
            <li className="category-item">
              <span className="category-number">1</span>
              <span className="category-name">Música</span>
              <span className="category-arrow">➔</span>
            </li>
            <li className="category-item">
              <span className="category-number">2</span>
              <span className="category-name">Gastronomia</span>
              <span className="category-arrow">➔</span>
            </li>
            <li className="category-item">
              <span className="category-number">3</span>
              <span className="category-name">Beleza</span>
              <span className="category-arrow">➔</span>
            </li>
            <li className="category-item">
              <span className="category-number">4</span>
              <span className="category-name">Educação</span>
              <span className="category-arrow">➔</span>
            </li>
          </ul>
        </section>

        <section className="faq-section">
          <div className="faq-intro">
            <h2>Perguntas Frequentes</h2> <br></br>
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
              <p>Quando um evento esgota, podes entrar na lista de espera e <br></br>recebes aviso assim que houver vagas ou devoluções.</p>
            </details>
            <details className="faq-item">
              <summary>Os organizadores podem gerir vários eventos? <span className="faq-icon">⌄</span></summary>
              <p>Sim. O dashboard do organizador permite criar, editar e acompanhar eventos,<br></br> gerir equipes e consultar relatórios financeiros.</p>
            </details>
            <details className="faq-item">
              <summary>É necessário CPF para criar conta? <span className="faq-icon">⌄</span></summary>
              <p>Sim, o registo exige nome, e-mail válido e CPF para garantir a segurança de participantes e organizadores.</p>
            </details>
          </div>
        </section>

        <section className="final-cta-section">
          <h2>Pronto para seu <br></br>próximo Evento?</h2>
          <p>Junta-se ao Ludus e descubra novos eventos</p> <br></br>
          <button className="btn-juntar">Começar agora</button>
        </section>
      </main>
    </div>
  );
}
