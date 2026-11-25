"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./editar.css";
import { apiRequest } from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";

const eventoInicial = {
    titulo: "",
    descricao: "",
    categoria_id: "",
    capacidade_maxima: "",
    status: "RASCUNHO",
    data_inicio: "",
    data_fim: "",
    local_nome: "",
    local_endereco: "",
    imagem_capa_url: "",
    playlist_url: "",
};

function formatarDataHoraLocal(valor) {
    if (!valor) return "";
    const texto = String(valor).replace(" ", "T");
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(texto)) {
        return texto.slice(0, 16);
    }
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "";
    return new Date(data.getTime() - data.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
}

function atividadeInicial() {
    return {
        id: null,
        titulo: "",
        tipo: "",
        palestrante: "",
        data_hora_inicio: "",
        data_hora_fim: "",
        local_sala: "",
        vagas_maximas: "",
        vagas_ocupadas: 0,
    };
}

export default function EditarEvento() {
    const params = useParams();
    const router = useRouter();
    const idDoEvento = String(params.id);

    const [evento, setEvento] = useState(eventoInicial);
    const [categorias, setCategorias] = useState([]);
    const [ingressos, setIngressos] = useState([]);
    const [idsIngressosOriginais, setIdsIngressosOriginais] = useState([]);
    const [atividades, setAtividades] = useState([]);
    const [idsAtividadesOriginais, setIdsAtividadesOriginais] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [eventoCarregado, setEventoCarregado] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;
        const sessao = obterSessao();

        if (!sessao) {
            router.replace(`/login?redirect=${encodeURIComponent(`/organizador/eventos/${idDoEvento}/editar`)}`);
            return () => {
                ativo = false;
            };
        }

        if (sessao.usuario.cargo !== "ORGANIZADOR") {
            router.replace("/");
            return () => {
                ativo = false;
            };
        }

        Promise.all([
            apiRequest(`eventos/${idDoEvento}`, { token: sessao.token }),
            apiRequest(`tipos-ingresso?evento_id=${idDoEvento}&limite=100`, { token: sessao.token }),
            apiRequest(`atividades?evento_id=${idDoEvento}&limite=100`, { token: sessao.token }),
            apiRequest("categorias?limite=100", { token: sessao.token }),
        ])
            .then(([respostaEvento, respostaIngressos, respostaAtividades, respostaCategorias]) => {
                if (!ativo) return;
                const dadosEvento = respostaEvento?.dados;
                if (!dadosEvento) throw new Error("Não foi possível carregar os dados do evento.");

                setEvento({
                    titulo: dadosEvento.titulo || "",
                    descricao: dadosEvento.descricao || "",
                    categoria_id: String(dadosEvento.categoria_id || ""),
                    capacidade_maxima: String(dadosEvento.capacidade_maxima || ""),
                    status: dadosEvento.status || "RASCUNHO",
                    data_inicio: formatarDataHoraLocal(dadosEvento.data_inicio),
                    data_fim: formatarDataHoraLocal(dadosEvento.data_fim),
                    local_nome: dadosEvento.local_nome || "",
                    local_endereco: dadosEvento.local_endereco || "",
                    imagem_capa_url: dadosEvento.imagem_capa_url || "",
                    playlist_url: dadosEvento.playlist_url || "",
                });

                const listaIngressos = Array.isArray(respostaIngressos?.dados)
                    ? respostaIngressos.dados.map((ingresso) => ({
                        id: ingresso.id,
                        nome: ingresso.nome || "",
                        preco: String(ingresso.preco ?? ""),
                        quant_total: String(ingresso.quant_total ?? ""),
                        quant_vendida: Number(ingresso.quant_vendida || 0),
                    }))
                    : [];
                setIngressos(listaIngressos);
                setIdsIngressosOriginais(listaIngressos.map((ingresso) => ingresso.id));
                const listaAtividades = Array.isArray(respostaAtividades?.dados)
                    ? respostaAtividades.dados.map((atividade) => ({
                        id: atividade.id,
                        titulo: atividade.titulo || "",
                        tipo: atividade.tipo || "",
                        palestrante: atividade.palestrante || "",
                        data_hora_inicio: formatarDataHoraLocal(atividade.data_hora_inicio),
                        data_hora_fim: formatarDataHoraLocal(atividade.data_hora_fim),
                        local_sala: atividade.local_sala || "",
                        vagas_maximas: String(atividade.vagas_maximas ?? ""),
                        vagas_ocupadas: Number(atividade.vagas_ocupadas || 0),
                    }))
                    : [];
                setAtividades(listaAtividades);
                setIdsAtividadesOriginais(listaAtividades.map((atividade) => atividade.id));
                setCategorias(Array.isArray(respostaCategorias?.dados) ? respostaCategorias.dados : []);
                setEventoCarregado(true);
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
    }, [idDoEvento, router]);

    function handleEventoChange(event) {
        const { name, value } = event.target;
        setEvento((anterior) => ({ ...anterior, [name]: value }));
    }

    function handleIngressoChange(index, campo, valor) {
        setIngressos((anteriores) =>
            anteriores.map((ingresso, indice) =>
                indice === index ? { ...ingresso, [campo]: valor } : ingresso,
            ),
        );
    }

    function adicionarIngresso() {
        setIngressos((anteriores) => [
            ...anteriores,
            { id: null, nome: "", preco: "", quant_total: "", quant_vendida: 0 },
        ]);
    }

    function removerIngresso(indexParaRemover) {
        setIngressos((anteriores) =>
            anteriores.filter((_, index) => index !== indexParaRemover),
        );
    }

    function handleAtividadeChange(index, campo, valor) {
        setAtividades((anteriores) =>
            anteriores.map((atividade, indice) =>
                indice === index ? { ...atividade, [campo]: valor } : atividade,
            ),
        );
    }

    function adicionarAtividade() {
        setAtividades((anteriores) => [...anteriores, atividadeInicial()]);
    }

    function removerAtividade(indexParaRemover) {
        setAtividades((anteriores) =>
            anteriores.filter((_, index) => index !== indexParaRemover),
        );
    }

    async function guardarAlteracoes(event) {
        event.preventDefault();
        setErro("");

        const capacidade = Number(evento.capacidade_maxima);
        const quantidadeIngressos = ingressos.reduce(
            (total, ingresso) => total + (Number(ingresso.quant_total) || 0),
            0,
        );
        if (!Number.isInteger(capacidade) || capacidade < 1) {
            setErro("A capacidade máxima deve ser um número inteiro positivo.");
            return;
        }
        if (quantidadeIngressos > capacidade) {
            setErro("A quantidade total de ingressos não pode exceder a capacidade máxima do evento.");
            return;
        }
        if (ingressos.length === 0) {
            setErro("Cadastre ao menos um tipo de ingresso para o evento.");
            return;
        }
        if (ingressos.some((ingresso) => Number(ingresso.quant_total) < ingresso.quant_vendida)) {
            setErro("A quantidade total de um ingresso não pode ser menor que a quantidade já vendida.");
            return;
        }
        if (atividades.some((atividade) => Number(atividade.vagas_maximas) < atividade.vagas_ocupadas)) {
            setErro("As vagas máximas de uma atividade não podem ser menores que as vagas já ocupadas.");
            return;
        }

        setSalvando(true);
        try {
            const sessao = obterSessao();
            if (!sessao) {
                router.replace(`/login?redirect=${encodeURIComponent(`/organizador/eventos/${idDoEvento}/editar`)}`);
                return;
            }

            await apiRequest(`eventos/${idDoEvento}`, {
                method: "PATCH",
                token: sessao.token,
                body: {
                    titulo: evento.titulo,
                    descricao: evento.descricao,
                    categoria_id: Number(evento.categoria_id),
                    capacidade_maxima: capacidade,
                    status: evento.status,
                    data_inicio: evento.data_inicio,
                    data_fim: evento.data_fim,
                    local_nome: evento.local_nome,
                    local_endereco: evento.local_endereco,
                    imagem_capa_url: evento.imagem_capa_url.trim() || null,
                    playlist_url: evento.playlist_url.trim() || null,
                },
            });

            for (const ingresso of ingressos) {
                const dadosIngresso = {
                    nome: ingresso.nome,
                    preco: Number(ingresso.preco),
                    quant_total: Number(ingresso.quant_total),
                };
                if (ingresso.id) {
                    await apiRequest(`tipos-ingresso/${ingresso.id}`, {
                        method: "PATCH",
                        token: sessao.token,
                        body: dadosIngresso,
                    });
                } else {
                    await apiRequest("tipos-ingresso", {
                        method: "POST",
                        token: sessao.token,
                        body: { ...dadosIngresso, evento_id: Number(idDoEvento) },
                    });
                }
            }

            const idsIngressosAtuais = new Set(
                ingressos.filter((ingresso) => ingresso.id).map((ingresso) => ingresso.id),
            );
            for (const idIngresso of idsIngressosOriginais) {
                if (!idsIngressosAtuais.has(idIngresso)) {
                    await apiRequest(`tipos-ingresso/${idIngresso}`, {
                        method: "DELETE",
                        token: sessao.token,
                    });
                }
            }

            for (const atividade of atividades) {
                const dadosAtividade = {
                    titulo: atividade.titulo,
                    tipo: atividade.tipo,
                    palestrante: atividade.palestrante,
                    data_hora_inicio: atividade.data_hora_inicio,
                    data_hora_fim: atividade.data_hora_fim,
                    local_sala: atividade.local_sala.trim() || null,
                    vagas_maximas: Number(atividade.vagas_maximas),
                };
                if (atividade.id) {
                    await apiRequest(`atividades/${atividade.id}`, {
                        method: "PATCH",
                        token: sessao.token,
                        body: dadosAtividade,
                    });
                } else {
                    await apiRequest("atividades", {
                        method: "POST",
                        token: sessao.token,
                        body: { ...dadosAtividade, evento_id: Number(idDoEvento) },
                    });
                }
            }

            const idsAtividadesAtuais = new Set(
                atividades.filter((atividade) => atividade.id).map((atividade) => atividade.id),
            );
            for (const idAtividade of idsAtividadesOriginais) {
                if (!idsAtividadesAtuais.has(idAtividade)) {
                    await apiRequest(`atividades/${idAtividade}`, {
                        method: "DELETE",
                        token: sessao.token,
                    });
                }
            }

            router.push("/organizador");
        } catch (erroApi) {
            setErro(erroApi.message);
        } finally {
            setSalvando(false);
        }
    }

    if (carregando) {
        return <p role="status">Carregando evento...</p>;
    }

    return (
        <div className="container-editar">
            <h1 className="title-admin">Editar Evento: {evento.titulo}</h1>
            {erro && <p style={{ color: "red" }} role="alert">{erro}</p>}

            {eventoCarregado && (
                <form onSubmit={guardarAlteracoes}>
                    <section className="seccao-form">
                        <h3 className="form-title">
                            <i className="fa-regular fa-address-card" /> Informações Básicas
                        </h3>

                        <div className="form-group">
                            <label className="form-group-label" htmlFor="titulo-evento">Nome do Evento</label>
                            <input
                                className="form-group-links"
                                id="titulo-evento"
                                type="text"
                                name="titulo"
                                maxLength={150}
                                value={evento.titulo}
                                onChange={handleEventoChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-group-label" htmlFor="categoria-evento">Categoria</label>
                            <select
                                className="form-group-links"
                                id="categoria-evento"
                                name="categoria_id"
                                value={evento.categoria_id}
                                onChange={handleEventoChange}
                                required
                            >
                                <option value="">Selecione uma categoria</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-group-label" htmlFor="data-inicio">Data/Hora de Início</label>
                                <input
                                    className="form-group-links"
                                    id="data-inicio"
                                    type="datetime-local"
                                    name="data_inicio"
                                    value={evento.data_inicio}
                                    onChange={handleEventoChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-group-label" htmlFor="data-fim">Data/Hora de Fim</label>
                                <input
                                    className="form-group-links"
                                    id="data-fim"
                                    type="datetime-local"
                                    name="data_fim"
                                    min={evento.data_inicio}
                                    value={evento.data_fim}
                                    onChange={handleEventoChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-group-label" htmlFor="descricao-evento">Descrição Completa</label>
                            <textarea
                                className="editor-texto-fixo"
                                id="descricao-evento"
                                name="descricao"
                                maxLength={65535}
                                value={evento.descricao}
                                onChange={handleEventoChange}
                                required
                            />
                        </div>
                    </section>

                    <section className="seccao-form">
                        <h3 className="form-title">
                            <i className="fa-regular fa-calendar-check" /> Programação
                        </h3>

                        {atividades.map((atividade, index) => (
                            <div key={atividade.id ?? `nova-${index}`} className="card-ingresso-edit">
                                <div className="form-group">
                                    <label className="form-group-label" htmlFor={`atividade-titulo-${index}`}>
                                        Título da Atividade
                                    </label>
                                    <input
                                        className="form-group-links"
                                        id={`atividade-titulo-${index}`}
                                        type="text"
                                        maxLength={150}
                                        value={atividade.titulo}
                                        onChange={(event) => handleAtividadeChange(index, "titulo", event.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-group-label" htmlFor={`atividade-tipo-${index}`}>Tipo</label>
                                        <input
                                            className="form-group-input"
                                            id={`atividade-tipo-${index}`}
                                            type="text"
                                            maxLength={50}
                                            value={atividade.tipo}
                                            onChange={(event) => handleAtividadeChange(index, "tipo", event.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-group-label" htmlFor={`atividade-palestrante-${index}`}>
                                            Palestrante / Responsável
                                        </label>
                                        <input
                                            className="form-group-input"
                                            id={`atividade-palestrante-${index}`}
                                            type="text"
                                            maxLength={150}
                                            value={atividade.palestrante}
                                            onChange={(event) => handleAtividadeChange(index, "palestrante", event.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-group-label" htmlFor={`atividade-inicio-${index}`}>Início</label>
                                        <input
                                            className="form-group-links"
                                            id={`atividade-inicio-${index}`}
                                            type="datetime-local"
                                            min={evento.data_inicio}
                                            max={atividade.data_hora_fim || evento.data_fim}
                                            value={atividade.data_hora_inicio}
                                            onChange={(event) => handleAtividadeChange(index, "data_hora_inicio", event.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-group-label" htmlFor={`atividade-fim-${index}`}>Fim</label>
                                        <input
                                            className="form-group-links"
                                            id={`atividade-fim-${index}`}
                                            type="datetime-local"
                                            min={atividade.data_hora_inicio || evento.data_inicio}
                                            max={evento.data_fim}
                                            value={atividade.data_hora_fim}
                                            onChange={(event) => handleAtividadeChange(index, "data_hora_fim", event.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-group-label" htmlFor={`atividade-local-${index}`}>
                                            Local / Sala
                                        </label>
                                        <input
                                            className="form-group-input"
                                            id={`atividade-local-${index}`}
                                            type="text"
                                            maxLength={100}
                                            value={atividade.local_sala}
                                            onChange={(event) => handleAtividadeChange(index, "local_sala", event.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-group-label" htmlFor={`atividade-vagas-${index}`}>
                                            Vagas disponíveis
                                        </label>
                                        <input
                                            className="form-group-input"
                                            id={`atividade-vagas-${index}`}
                                            type="number"
                                            min={Math.max(1, atividade.vagas_ocupadas)}
                                            step="1"
                                            value={atividade.vagas_maximas}
                                            onChange={(event) => handleAtividadeChange(index, "vagas_maximas", event.target.value)}
                                            required
                                        />
                                        <small className="dica-texto">Ocupadas: {atividade.vagas_ocupadas}</small>
                                    </div>
                                    <div className="form-group acao-remover">
                                        <button
                                            type="button"
                                            onClick={() => removerAtividade(index)}
                                            className="btn-remover"
                                            disabled={atividade.vagas_ocupadas > 0}
                                            aria-label={`Remover atividade ${index + 1}`}
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button type="button" onClick={adicionarAtividade} className="btn-adicionar">
                            + Adicionar Atividade
                        </button>
                    </section>

                    <section className="seccao-form">
                        <h3 className="form-title">
                            <i className="fa-solid fa-ticket" /> Ingressos Disponíveis
                        </h3>

                        {ingressos.map((ingresso, index) => (
                            <div key={ingresso.id ?? `novo-${index}`} className="card-ingresso-edit">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-group-label" htmlFor={`ingresso-nome-${index}`}>Setor/Tipo</label>
                                        <input
                                            className="form-group-input"
                                            id={`ingresso-nome-${index}`}
                                            type="text"
                                            maxLength={100}
                                            value={ingresso.nome}
                                            onChange={(event) => handleIngressoChange(index, "nome", event.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-group-label" htmlFor={`ingresso-preco-${index}`}>Preço (R$)</label>
                                        <input
                                            className="form-group-input"
                                            id={`ingresso-preco-${index}`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={ingresso.preco}
                                            onChange={(event) => handleIngressoChange(index, "preco", event.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-group-label" htmlFor={`ingresso-quantidade-${index}`}>Quantidade Total</label>
                                        <input
                                            className="form-group-input"
                                            id={`ingresso-quantidade-${index}`}
                                            type="number"
                                            min={Math.max(1, ingresso.quant_vendida)}
                                            step="1"
                                            value={ingresso.quant_total}
                                            onChange={(event) => handleIngressoChange(index, "quant_total", event.target.value)}
                                            required
                                        />
                                        <small className="dica-texto">Vendidos: {ingresso.quant_vendida}</small>
                                    </div>
                                    <div className="form-group acao-remover">
                                        <button
                                            type="button"
                                            onClick={() => removerIngresso(index)}
                                            className="btn-remover"
                                            disabled={ingresso.quant_vendida > 0}
                                            aria-label={`Remover ingresso ${index + 1}`}
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <p className="dica-texto">
                            Quantidade cadastrada: {ingressos.reduce(
                                (total, ingresso) => total + (Number(ingresso.quant_total) || 0),
                                0,
                            )} de {evento.capacidade_maxima || 0}
                        </p>
                        <div className="form-group">
                            <label className="form-group-label" htmlFor="capacidade-evento">Capacidade Máxima do Evento</label>
                            <input
                                className="form-group-input"
                                id="capacidade-evento"
                                type="number"
                                min="1"
                                step="1"
                                name="capacidade_maxima"
                                value={evento.capacidade_maxima}
                                onChange={handleEventoChange}
                                required
                            />
                        </div>
                        <button type="button" onClick={adicionarIngresso} className="btn-adicionar">
                            + Adicionar Ingresso
                        </button>
                    </section>

                    <section className="seccao-form">
                        <h3 className="form-title">
                            <i className="fa-regular fa-pen-to-square" /> Localização e Imagem
                        </h3>

                        <div className="form-group">
                            <label className="form-group-label" htmlFor="local-nome">Nome do Local</label>
                            <input
                                className="form-group-links"
                                id="local-nome"
                                type="text"
                                name="local_nome"
                                maxLength={150}
                                value={evento.local_nome}
                                onChange={handleEventoChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-group-label" htmlFor="local-endereco">Endereço</label>
                            <textarea
                                className="editor-texto-fixo"
                                id="local-endereco"
                                name="local_endereco"
                                maxLength={65535}
                                value={evento.local_endereco}
                                onChange={handleEventoChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-group-label" htmlFor="imagem-evento">Link da Imagem de Capa</label>
                            <input
                                className="form-group-links"
                                id="imagem-evento"
                                type="url"
                                name="imagem_capa_url"
                                maxLength={255}
                                value={evento.imagem_capa_url}
                                onChange={handleEventoChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-group-label" htmlFor="playlist-evento">Link da Playlist</label>
                            <input
                                className="form-group-links"
                                id="playlist-evento"
                                type="url"
                                name="playlist_url"
                                maxLength={255}
                                value={evento.playlist_url}
                                onChange={handleEventoChange}
                            />
                        </div>
                    </section>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => router.push("/organizador")}
                            className="btn-cancelar"
                            disabled={salvando}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-guardar" disabled={salvando}>
                            {salvando ? "Salvando..." : "Guardar Alterações"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
