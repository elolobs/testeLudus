"use client";

import "./suporte.css";

export default function Suporte() {
  return (
    <div className="suporte-container">
      
      <section className="suporte-hero">
        <div className="suporte-hero-kicker">CENTRO DE AJUDA</div>
        <h1>
          Como podemos<br />
          <span className="destaque-roxo">ajudar?</span>
        </h1>
        <p>
          Conte-nos sobre o problema que você está enfrentando. Nossa equipe de especialistas está pronta para resolver qualquer questão na plataforma.
        </p>
      </section>

      <main className="suporte-content">
        
        <aside className="sidebar-info">
          
          <div className="info-card">
            <h3>Atendimento</h3>
            <div className="status-indicator">
              <span className="status-title">Rápido e Preciso</span>
              <span className="status-desc">Tempo Médio de Resposta: 45 min</span>
            </div>
          </div>

          <div className="info-card">
            <h3>Canais Diretos</h3>
            <div className="contact-list">
              <div className="contact-item">
                <i className="fa-brands fa-whatsapp"></i>
                <span>(11) 4002-8922</span>
              </div>
              <div className="contact-item">
                <i className="fa-regular fa-envelope"></i>
                <span>suporte@ldeventos.com</span>
              </div>
            </div>
          </div>

        </aside>

        <section className="form-container">
          
          <div className="form-header-interno">
            <h2>Abrir Solicitação</h2>
          </div>

          <form className="support-form" onSubmit={(e) => e.preventDefault()}>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nome">Nome Completo</label>
                <div className="input-wrapper">
                  <i className="fa-regular fa-user icon"></i>
                  <input 
                    type="text" 
                    id="nome" 
                    name="nome" 
                    placeholder="Seu nome" 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">E-mail de Contato</label>
                <div className="input-wrapper">
                  <i className="fa-regular fa-envelope icon"></i>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder="nome@email.com" 
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Telefone / WhatsApp</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-phone icon"></i>
                <input 
                  type="tel" 
                  id="telefone" 
                  name="telefone" 
                  placeholder="(11) 4002-8922" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="mensagem">Descrição Detalhada do Problema</label>
              <textarea 
                id="mensagem" 
                name="mensagem" 
                placeholder="Descreva o que aconteceu, onde você clicou ou eventuais códigos de erro..." 
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-submit">
              Enviar Solicitação
            </button>

          </form>
        </section>

      </main>

    </div>
  );
}