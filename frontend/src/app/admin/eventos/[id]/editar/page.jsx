"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import "./editar.css";

export default function EditarEvento() {
    const params = useParams();
    const router = useRouter();
    const idDoEvento = params.id;

    const [evento, setEvento] = useState({
        nome: "",
        descricaoBreve: "",
        descricaoCompleta: "",
        dataInicio: "",
        dataFim: "",
        mapaUrl: "",
        playlistUrl: ""
    });

    const [ingressos, setIngressos] = useState([]);

    useEffect(() => {
        // Simula a busca dos dados do evento
        setEvento({
            nome: "Festa de Verão",
            descricaoBreve: "A melhor festa do ano com os melhores artistas.",
            descricaoCompleta: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
            dataInicio: "2026-12-12T22:00",
            dataFim: "2026-12-13T04:00",
            mapaUrl: "https://maps.google.com/...",
            playlistUrl: "https://spotify.com/..."
        });

        setIngressos([
            { id: 1, tipo: "Pista", precoInteira: 50, precoMeia: 25, quantidade: 300, status: "Ativo" },
            { id: 2, tipo: "Área VIP", precoInteira: 120, precoMeia: 60, quantidade: 50, status: "Ativo" }
        ]);
    }, [idDoEvento]);

    const handleEventoChange = (e) => {
        const { name, value } = e.target;
        setEvento(prev => ({ ...prev, [name]: value }));
    };

    const handleIngressoChange = (index, campo, valor) => {
        const novosIngressos = [...ingressos];
        novosIngressos[index][campo] = valor;
        setIngressos(novosIngressos);
    };

    const adicionarIngresso = () => {
        setIngressos([
            ...ingressos,
            { id: Date.now(), tipo: "", precoInteira: 0, precoMeia: 0, quantidade: 0, status: "Ativo" }
        ]);
    };

    const removerIngresso = (indexParaRemover) => {
        setIngressos(ingressos.filter((_, index) => index !== indexParaRemover));
    };

    const guardarAlteracoes = (e) => {
        e.preventDefault();
        console.log("Dados guardados:", { evento, ingressos });
        alert("Evento atualizado com sucesso!");
        router.push("/admin");
    };

    return (
        <div className="container-editar">
            <h1 className="title-admin">Editar Evento: {evento.nome}</h1>

            <form onSubmit={guardarAlteracoes}>

                <section className="seccao-form">
                    <h3>1. Informações Básicas</h3>

                    <div className="form-group">
                        <label className="form-group-label">Nome do Evento</label>
                        <input className="form-group-links"
                            type="text"
                            name="nome"
                            value={evento.nome}
                            onChange={handleEventoChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-group-label">Breve Descrição (Subtítulo)</label>
                        <input className="form-group-links"
                            type="text"
                            name="descricaoBreve"
                            value={evento.descricaoBreve}
                            onChange={handleEventoChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-group-label">Data/Hora de Início</label>
                            <input className="form-group-links"
                                type="datetime-local"
                                name="dataInicio"
                                value={evento.dataInicio}
                                onChange={handleEventoChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-group-label">Data/Hora de Fim</label>
                            <input className="form-group-links"
                                type="datetime-local"
                                name="dataFim"
                                value={evento.dataFim}
                                onChange={handleEventoChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-group-label">Descrição Completa (Resumo do evento)</label>
                        <div
                            className="editor-texto-fixo"
                            contentEditable="true"
                            onBlur={(e) => {
                                const novoTexto = e.currentTarget.innerText;
                                setEvento(prev => ({
                                    ...prev,
                                    descricaoCompleta: novoTexto
                                }));
                            }}
                            suppressContentEditableWarning={true}
                        >
                            {evento.descricaoCompleta}
                        </div>
                    </div>
                </section>

                <section className="seccao-form">
                    <h3 className="form-title">2. Ingressos Disponíveis</h3>

                    {ingressos.map((ingresso, index) => (
                        <div key={ingresso.id} className="card-ingresso-edit">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-group-label">Setor/Tipo</label>
                                    <input className="form-group-input"
                                        type="text"
                                        value={ingresso.tipo}
                                        onChange={(e) => handleIngressoChange(index, "tipo", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-group-label">Preço Inteira (R$)</label>
                                    <input className="form-group-input"
                                        type="number"
                                        value={ingresso.precoInteira}
                                        onChange={(e) => handleIngressoChange(index, "precoInteira", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-group-label">Preço Meia (R$)</label>
                                    <input className="form-group-input"
                                        type="number"
                                        value={ingresso.precoMeia}
                                        onChange={(e) => handleIngressoChange(index, "precoMeia", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-group-label">Qtd. Total</label>
                                    <input className="form-group-input"
                                        type="number"
                                        value={ingresso.quantidade}
                                        onChange={(e) => handleIngressoChange(index, "quantidade", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group acao-remover">
                                    
                                    <button type="button" onClick={() => removerIngresso(index)} className="btn-remover">
                                        Remover
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button type="button" onClick={adicionarIngresso} className="btn-adicionar">
                        + Adicionar Novo Ingresso
                    </button>
                </section>

                <section className="seccao-form">
                    <h3>3. Localização e Playlist</h3>

                    <div className="form-group">
                        <label className="form-group-label">Link do Google Maps (Como chegar)</label>
                        <input className="form-group-links"
                            type="url"
                            name="mapaUrl"
                            value={evento.mapaUrl}
                            onChange={handleEventoChange}
                            placeholder="https://maps.google.com/..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-group-label">Link da Playlist (Spotify/YouTube)</label>
                        <input className="form-group-links"
                            type="url"
                            name="playlistUrl"
                            value={evento.playlistUrl}
                            onChange={handleEventoChange}
                            placeholder="https://open.spotify.com/..."
                        />
                    </div>
                </section>

                <div className="form-actions">
                    <button type="button" onClick={() => router.push('/admin')} className="btn-cancelar">
                        Cancelar
                    </button>
                    <button type="submit" className="btn-guardar">
                        Guardar Alterações
                    </button>
                </div>
            </form>
        </div>
    );
}