import styles from "./home.css";

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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

            <form className="hero-search-bar">
              <div className="search-field">
                <label>O QUE PROCURAS?</label>
                <input type="text" placeholder="Festival, evento, artista..." />
              </div>
              <div className="search-field">
                <label>ONDE?</label>
                <input type="text" placeholder="Todo o Brasil" />
              </div>
              <button type="submit" className="btn-pesquisar">
                Pesquisar ➔
              </button>
            </form>
          </div>
        </section>

        <section className="featured-event-section">
          <button className="nav-arrow prev-arrow" aria-label="Anterior">❮</button>
          <div className="featured-event-content">
            <h2>Evento</h2>
            <p>Descrição Do Evento</p>
            <button className="btn-compre">Compre</button>
          </div>
          <button className="nav-arrow next-arrow" aria-label="Próximo">❯</button>
        </section>

        <section className="experiences-section">
          <h2>Experiências em destaque</h2>
          <div className="carousel-container">
            <button className="nav-arrow prev-arrow" aria-label="Anterior">❮</button>
            
            <div className="cards-wrapper">
              <div className="experience-card">
                <div className="card-image-placeholder"></div>
                <h3>New product</h3>
                <p>Descrição curta</p>
              </div>
              <div className="experience-card">
                <div className="card-image-placeholder"></div>
                <h3>Cool new blog</h3>
                <p>Descrição curta</p>
              </div>
              <div className="experience-card">
                <div className="card-image-placeholder"></div>
                <h3>New product</h3>
                <p>Descrição curta</p>
              </div>
              <div className="experience-card">
                <div className="card-image-placeholder"></div>
                <h3>New product</h3>
                <p>Descrição curta</p>
              </div>
            </div>

            <button className="nav-arrow next-arrow" aria-label="Próximo">❯</button>
          </div>
        </section>

        <section className="categories-section">
          <div className="categories-header">
            <h2>Explorar por categoria</h2>
            <button className="btn-ver-todos">Ver todos eventos disponíveis</button>
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
            <h2>Perguntas Frequentes</h2>
            <p>
              Não achou sua dúvida? Entre em contato com nosso <a href="/suporte">suporte</a>
            </p>
          </div>
          
          <div className="faq-accordion">
            <details className="faq-item">
              <summary>Dúvida 1 <span className="faq-icon">⌄</span></summary>
              <p>Resposta para a dúvida 1 vai aqui.</p>
            </details>
            <details className="faq-item">
              <summary>Dúvida 2 <span className="faq-icon">⌄</span></summary>
              <p>Resposta para a dúvida 2 vai aqui.</p>
            </details>
            <details className="faq-item">
              <summary>Dúvida 3 <span className="faq-icon">⌄</span></summary>
              <p>Resposta para a dúvida 3 vai aqui.</p>
            </details>
            <details className="faq-item">
              <summary>Dúvida 4 <span className="faq-icon">⌄</span></summary>
              <p>Resposta para a dúvida 4 vai aqui.</p>
            </details>
            <details className="faq-item">
              <summary>Dúvida 5 <span className="faq-icon">⌄</span></summary>
              <p>Resposta para a dúvida 5 vai aqui.</p>
            </details>
          </div>
        </section>

        <section className="final-cta-section">
          <h2>Pronto para seu próximo Evento?</h2>
          <p>Junta-se ao Ludus e descubra novos eventos</p>
          <button className="btn-juntar">Junta-se</button>
        </section>
      </main>
    </div>
  );
}
