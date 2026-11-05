import "./eventos.css"
import CardEvento from "@/components/cardEvento";

export default function () {

    const listaEventos = [
        { id: 1, categoria: "MÚSICA", dia: "18", mes: "OUT", titulo: "Future Summit 2026", local: "São Paulo, SP", imagem: "/caminho-da-imagem1.jpg" },
        { id: 2, categoria: "FESTIVAL", dia: "24", mes: "OUT", titulo: "Festival Aurora", local: "Parque Villa-Lobos, SP", imagem: "/caminho-da-imagem2.jpg" },
        { id: 3, categoria: "EXPERIÊNCIA", dia: "02", mes: "NOV", titulo: "Ludus Experience", local: "Marina da Glória, RJ", imagem: "/caminho-da-imagem3.jpg" },
    ];

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
                <form className="busca-form">
                    <div className="campo-busca">
                        <label>O que você procura?</label>
                        <input type="text" placeholder="Ex: shows, festival, artista..." />
                    </div>
                    
                    <div className="campo-busca">
                        <label>Onde?</label>
                        <select>
                            <option value="">Todo o Brasil</option>
                        </select>
                    </div>

                    <div className="campo-busca">
                        <label>Data</label>
                        <select>
                            <option value="">Qualquer data</option>
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
                        <label>Ordenar por</label>
                        <select>
                            <option value="recentes">Mais recentes</option>
                        </select>
                    </div>
                </header>

            
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
            </section>
        </main>
    )
}