"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import "./detalha.css";
import { apiRequest, formatarData, formatarPreco } from "@/lib/api.mjs";

export default function Detalha() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [ingressos, setIngressos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagemIngresso, setMensagemIngresso] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDetalhes() {
      try {
        const respostaEvento = await apiRequest(`eventos/${id}`);
        const [respostaAtividades, respostaIngressos] = await Promise.all([
          apiRequest(`atividades?evento_id=${id}&limite=100`),
          apiRequest(`tipos-ingresso?evento_id=${id}&limite=100`),
        ]);
        if (!ativo) return;
        setEvento(respostaEvento.dados);
        setAtividades(respostaAtividades.dados);
        setIngressos(respostaIngressos.dados);
      } catch (erroApi) {
        if (ativo) setErro(erroApi.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarDetalhes();
    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando) return <p role="status">Carregando evento...</p>;
  if (erro) return <p role="alert">{erro}</p>;
  if (!evento) return <p>Evento não encontrado.</p>;

  const disponibilidade = (ingresso) => {
    const restantes = Math.max(0, Number(ingresso.quant_total) - Number(ingresso.quant_vendida || 0));
    if (restantes === 0) return { texto: "Esgotado", classe: "bolinha-vermelha", restantes };
    if (restantes <= 10) return { texto: "Baixa disponibilidade", classe: "bolinha-amarela", restantes };
    return { texto: "Disponível", classe: "bolinha-verde", restantes };
  };
  const enderecoMapa = encodeURIComponent(
    [evento.local_nome, evento.local_endereco].filter(Boolean).join(", "),
  );

  return (
    <>
      <div className="container-detalhes">
        <img
          src={evento.imagem_capa_url || "/img/fundocadastro.png"}
          alt={`Imagem do evento ${evento.titulo}`}
        />
        <div className="imgblur">
          <div className="left-side">
            <div className="texto-sobreposto">
              <h3>{evento.titulo}</h3>
              <p>{evento.local_nome}</p>
            </div>
          </div>
          <div className="right-side">
            {formatarData(evento.data_inicio, { dateStyle: "long", timeStyle: "short" })}
          </div>
        </div>
      </div>

      <div className="Container-env-detalhes">
        {ingressos.length === 0 && <p>Ingressos ainda não disponíveis.</p>}
        {ingressos.map((ingresso) => {
          const estado = disponibilidade(ingresso);
          return (
            <div className="boxs" key={ingresso.id}>
              <div className="container-box-detalhes">
                <img src="/img/logo.png" alt="Logo Ludus" />
              </div>
              <div className="Linha" />
              <div className="colluns">
                <h2>{ingresso.nome}</h2>
                <span className="badge-disponibilidade">
                  <span className={estado.classe} /> {estado.texto}
                </span>
                <p className="data-local">
                  {formatarPreco(ingresso.preco)} · {estado.restantes} de {ingresso.quant_total} disponíveis
                </p>
              </div>
              <button
                type="button"
                disabled={estado.restantes === 0}
                onClick={() => setMensagemIngresso(
                  "A API atual ainda não oferece uma etapa de compra. Consulte o organizador do evento.",
                )}
              >
                {estado.restantes === 0 ? "Esgotado" : "Adquirir Ingresso"}
              </button>
            </div>
          );
        })}
        {mensagemIngresso && <p role="status">{mensagemIngresso}</p>}
      </div>

      <h1 className="title">Resumo do evento</h1>
      <p className="resumo">{evento.descricao}</p>

      <div className="Container-env-detalhes">
        <h1 className="title">Programação</h1>
        {atividades.length === 0 && <p>Programação a confirmar.</p>}
        {atividades.map((atividade) => (
          <div className="boxs" key={atividade.id}>
            <div className="colluns">
              <h2>{atividade.titulo}</h2>
              <p>{atividade.tipo} · {atividade.palestrante}</p>
              <p className="data-local">
                {formatarData(atividade.data_hora_inicio, { dateStyle: "long", timeStyle: "short" })}
                {" · "}{atividade.local_sala || evento.local_nome}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="secao-midia">
        <div className="card-midia">
          <h2>COMO CHEGAR</h2>
          <div className="wrapper-iframe">
            <iframe
              title={`Mapa para ${evento.local_nome}`}
              src={`https://www.google.com/maps?q=${enderecoMapa}&output=embed`}
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
              title="Playlist do evento"
              data-testid="embed-iframe"
              style={{ borderRadius: "12px", border: 0 }}
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
