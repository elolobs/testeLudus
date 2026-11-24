import Link from "next/link";
import "./sobre.css";

export default function SobreNos() {
  return (
    <div className="sobre-container">
      <section className="sobre-hero">
        <span className="sobre-hero-kicker">Nossa Essência</span>
        <h1 className="sobre-hero-title">
          Muito mais que <br />
          <span className="sobre-destaque">ingressos.</span>
        </h1>
        <p>
          Nascemos para conectar pessoas apaixonadas por cultura, tecnologia e entretenimento 
          a experiências que ficam para sempre na memória.
        </p>
      </section>

      <div className="sobre-stats-wrapper">
        <div className="sobre-stats">
          <div className="stat-item">
            <span className="stat-numero">+500</span>
            <span className="stat-label">Eventos Realizados</span>
          </div>
          <div className="stat-divisor"></div>
          <div className="stat-item">
            <span className="stat-numero">150k</span>
            <span className="stat-label">Ingressos Emitidos</span>
          </div>
          <div className="stat-divisor"></div>
          <div className="stat-item">
            <span className="stat-numero">98%</span>
            <span className="stat-label">Satisfação do Público</span>
          </div>
        </div>
      </div>

      <section className="sobre-historia">
        <div className="historia-texto">
          <span className="secao-kicker">QUEM SOMOS</span>
          <h2>A ponte entre a ideia e o aplauso.</h2>
          <p>
            Tudo começou com uma frustração comum: organizar e participar de eventos era burocrático, 
            lento e sem personalidade. Nós decidimos mudar o jogo. A <span className="destaque">Ludus</span> foi 
            criada para ser uma plataforma fluida, bonita e intuitiva.
          </p>
          <p>
            Não somos apenas uma bilheteria. Somos parceiros dos produtores e os melhores guias 
            para o público. Cuidamos da tecnologia pesada para que nossos clientes possam focar no 
            que realmente importa: <strong>viver o momento</strong>.
          </p>
        </div>
        <div className="historia-imagem">
          <div className="imagem-placeholder"></div>
          <div className="badge-flutuante">
            <i className="fa-solid fa-ticket-simple"></i>
            <span>Feito para fãs.</span>
          </div>
        </div>
      </section>

      <section className="sobre-valores">
        <div className="secao-header texto-centralizado">
          <span className="secao-kicker">O QUE NOS MOVE</span>
          <h2 className="secao-titulo">Nossos Pilares</h2>
        </div>

        <div className="valores-grid">
          <div className="valor-card">
            <div className="valor-icone">
              <i className="fa-solid fa-bolt"></i>
            </div>
            <h3>Agilidade Absoluta</h3>
            <p>Do clique à compra em segundos. Sem filas virtuais travadas, sem formulários intermináveis. Tudo é pensado para a velocidade.</p>
          </div>

          <div className="valor-card">
            <div className="valor-icone">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3>Segurança de Ponta</h3>
            <p>Seus dados e seus ingressos estão protegidos pelas mais modernas tecnologias de criptografia. Confiança é a base do nosso palco.</p>
          </div>

          <div className="valor-card">
            <div className="valor-icone">
              <i className="fa-solid fa-face-smile-wink"></i>
            </div>
            <h3>Experiência Premium</h3>
            <p>Acreditamos que a beleza importa. Nossa interface é limpa, acessível e feita para tornar sua jornada prazerosa desde o início.</p>
          </div>
        </div>
      </section>

      <section className="sobre-features">
        <div className="features-header">
          <div className="kicker-linha-centro"></div>
          <h2>Construído para o seu evento</h2>
          <p>Ferramentas modernas que acompanham o evento do primeiro clique ao relatório final.</p>
        </div>

        <div className="feature-row">
          <div className="feature-imagem img-detalhes"></div>
          <div className="feature-texto">
            <div className="kicker-linha-esquerda"></div>
            <h3>Detalhes completos de cada evento</h3>
            <p>Tudo o que você precisa para decidir e participar, reunido em uma única tela, com design impecável.</p>
            <ul className="feature-lista">
              <li><i className="fa-solid fa-check"></i> Horários e local</li>
              <li><i className="fa-solid fa-check"></i> Palestrantes e convidados</li>
              <li><i className="fa-solid fa-check"></i> Lotes de ingressos e vagas</li>
            </ul>
          </div>
        </div>

        <div className="feature-row reverse">
          <div className="feature-imagem img-organizador"></div>
          <div className="feature-texto">
            <div className="kicker-linha-esquerda"></div>
            <h3>Dashboard do organizador</h3>
            <p>Crie, edite e acompanhe o desempenho dos seus eventos em tempo real, com os dados que realmente importam.</p>
            <ul className="feature-lista">
              <li><i className="fa-solid fa-check"></i> Ocupação e inscritos por dia</li>
              <li><i className="fa-solid fa-check"></i> Gestão de equipe</li>
              <li><i className="fa-solid fa-check"></i> Relatórios financeiros</li>
            </ul>
          </div>
        </div>

        <div className="feature-row">
          <div className="feature-imagem img-ingresso"></div>
          <div className="feature-texto">
            <div className="kicker-linha-esquerda"></div>
            <h3>Área do ingresso</h3>
            <p>Uma interface limpa com seu bilhete digital e QR Code pronto para o check-in na portaria do evento.</p>
            <ul className="feature-lista">
              <li><i className="fa-solid fa-check"></i> QR Code único e seguro</li>
              <li><i className="fa-solid fa-check"></i> Check-in rápido na entrada</li>
              <li><i className="fa-solid fa-check"></i> Acesso na palma da mão</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="sobre-depoimentos">
        <div className="secao-header texto-centralizado">
          <span className="secao-kicker">O IMPACTO</span>
          <h2 className="secao-titulo">O que dizem sobre nós</h2>
        </div>

        <div className="depoimentos-grid">
          <div className="depoimento-card">
            <i className="fa-solid fa-quote-left depoimento-icone"></i>
            <p className="depoimento-texto">
              "Nunca foi tão fácil organizar a entrada do nosso festival. A plataforma é linda, o suporte é impecável e o público amou a facilidade de comprar."
            </p>
            <div className="depoimento-autor">
              <div className="autor-avatar">M</div>
              <div className="autor-info">
                <h4>Mariana Costa</h4>
                <span>Produtora do Festival Aurora</span>
              </div>
            </div>
          </div>

          <div className="depoimento-card">
            <i className="fa-solid fa-quote-left depoimento-icone"></i>
            <p className="depoimento-texto">
              "Comprei meu ingresso em menos de 2 minutos pelo celular. O QR Code ficou salvo direto na minha carteira digital. Experiência nota mil!"
            </p>
            <div className="depoimento-autor">
              <div className="autor-avatar alt">L</div>
              <div className="autor-info">
                <h4>Lucas Mendes</h4>
                <span>Fã de Tecnologia & Música</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sobre-cta">
        <h2>Pronto para a próxima experiência?</h2>
        <p>Explore nosso catálogo e garanta seu lugar nos melhores eventos da cidade.</p>
        <Link href="/" className="btn-cta">
          Ver Eventos Disponíveis
        </Link>
      </section>
    </div>
  );
}