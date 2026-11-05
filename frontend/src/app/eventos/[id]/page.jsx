'use client';

import "./detalha.css";


export default function Detalha() {
    return (
        <>
            <div className="container">
                <img src="../img/fundocadastro.png" alt="Foto Cadastro" width={450} />
                <div className="imgblur">
                    <div className="left-side">
                        <div className="texto-sobreposto">
                            <h3>Nome do Evento</h3>
                            <p>Descrição</p>
                        </div>
                    </div>
                    <div className="right-side">
                        Data Eventos
                    </div>
                </div>
            </div>

            <div className="Container-env">
                <div className="boxs">
                    <div className="container-box">
                        <img src="../img/logo.png" alt="Foto Logo" />
                    </div>
                    <div className="Linha"></div>
                    <div className="colluns">
                        <h2>Venda geral</h2>
                        <span className="badge-disponibilidade">
                            <span className="bolinha-verde"></span> Disponivel
                        </span>
                        <p className="data-local">Data 3 | Local</p>
                    </div>
                    <button type="submit">Adquirir Ingresso</button>
                </div>
                <div className="boxs">
                    <div className="container-box">
                        <img src="../img/logo.png" alt="Foto Logo" />
                    </div>
                    <div className="Linha"></div>
                    <div className="colluns">
                        <h2>Venda geral</h2>
                        <span className="badge-disponibilidade">
                            <span className="bolinha-amarela"></span> Baixa Disponibilidade
                        </span>
                        <p className="data-local">Data 3 | Local</p>
                    </div>
                    <button type="submit">Adquirir Ingresso</button>
                </div>
                <div className="boxs">
                    <div className="container-box">
                        <img src="../img/logo.png" alt="Foto Logo" />
                    </div>
                    <div className="Linha"></div>
                    <div className="colluns">
                        <h2>Venda geral</h2>
                        <span className="badge-disponibilidade">
                            <span className="bolinha-vermelha"></span> Esgotado
                        </span>
                        <p className="data-local">Data 3 | Local</p>
                    </div>
                    <button type="submit">Adquirir Ingresso</button>
                </div>
            </div >

            <h1 className="title">Resumo do evento</h1>
            <p className="resumo">"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            </p>

            <div className="secao-midia">
                <div className="card-midia">
                    <h2>COMO CHEGAR</h2>
                    <div className="wrapper-iframe">
                        <iframe
                            src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBVizdQeh3udy11xDc5Ao2YStR2gLc-rfc&amp;q=morumbis&amp;maptype=roadmap&amp;zoom=14"
                            width="100%"
                            height="352"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>

                <div className="card-midia">
                    <h2>PLAYLIST</h2>
                    <div className="wrapper-iframe">
                        <iframe
                            data-testid="embed-iframe"
                            style={{ borderRadius: '12px', border: 0 }}
                            src="https://open.spotify.com/embed/album/3ZN01xzenGMhWHdC5kfAe9?utm_source=generator&si=c7c3c24088914a17"
                            width="100%"
                            height="352"
                            allowFullScreen
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}