"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import "./detalha.css";
import { apiRequest, formatarData, formatarPreco } from "@/lib/api.mjs";

export default function Detalha() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [atividades, setAtividades] = useState([]);
  const [ingressos, setIngressos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

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
            <div className="data-destaque">
              {formatarData(evento.data_inicio, { dateStyle: "short" })}
            </div>
            <div className="hora-destaque">
              {formatarData(evento.data_inicio, { timeStyle: "short" })}
            </div>
          </div>
        </div>
      </div>

      <div className="conteudo-principal">
        
        <div className="secao-header">
          <span className="secao-kicker">INGRESSOS</span>
          <h2 className="secao-titulo">Garanta seu lugar.</h2>
        </div>

        <div className="Container-env-detalhes">
          {ingressos.length === 0 && <p>Ingressos ainda não disponíveis.</p>}
          {ingressos.map((ingresso) => {
            const estado = disponibilidade(ingresso);
            return (
              <div className="boxs" key={ingresso.id}>
                <div className="container-box-detalhes">
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem'}}>LD</span>
                </div>
                <div className="Linha" />
                <div className="colluns">
                  <h2>{ingresso.nome}</h2>
                  <span className="badge-disponibilidade">
                    <span className={estado.classe} /> {estado.texto}
                  </span>
                  <p className="data-local">
                    Lote único · {estado.restantes} de {ingresso.quant_total} disponíveis
                  </p>
                </div>
                <div className="preco-ingresso">
                  {formatarPreco(ingresso.preco)}
                </div>
                <Link
                  className={estado.restantes === 0 ? "botao-ingresso desabilitado" : "botao-ingresso"}
                  href={`/eventos/${id}/ingresso?tipo=${ingresso.id}`}
                  aria-disabled={estado.restantes === 0}
                  onClick={(event) => {
                    if (estado.restantes === 0) event.preventDefault();
                  }}
                >
                  {estado.restantes === 0 ? "Esgotado" : "Adquirir ingresso"}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="secao-resumo">
          <div className="resumo-texto-lado">
            <span className="secao-kicker">RESUMO DO EVENTO</span>
            <h2>Sobre a <br/>experiência.</h2>
          </div>
          <div className="resumo-conteudo">
            <p>{evento.descricao}</p>
          </div>
        </div>

        <div className="secao-header texto-centralizado">
          <span className="secao-kicker">PROGRAMAÇÃO</span>
          <h2 className="secao-titulo">O que vai rolar.</h2>
        </div>

        <div className="Container-env-detalhes">
          {atividades.length === 0 && <p>Programação a confirmar.</p>}
          {atividades.map((atividade) => (
            <div className="boxs" key={atividade.id}>
              <div className="colluns">
                <h2>{atividade.titulo}</h2>
                <p className="data-local">{atividade.tipo} · {atividade.palestrante}</p>
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
            <div className="card-midia-header">
              <div className="card-midia-header-textos">
                <h2>COMO CHEGAR</h2>
                <h3>{evento.local_nome}</h3>
              </div>
              <div className="icone-local">
                <i className="fa-solid fa-location-dot"></i>
              </div>
            </div>
            
            <div className="wrapper-iframe">
              <iframe
                title={`Mapa para ${evento.local_nome}`}
                src={`https://www.google.com/maps?q=${enderecoMapa}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="card-midia dark">
            <div className="card-midia-header">
              <div className="card-midia-header-textos">
                <h2>PLAYLIST OFICIAL</h2>
                <h3>Entre no clima.</h3>
              </div>
            </div>
            <div className="wrapper-iframe">
              <iframe
                title="Playlist do evento"
                data-testid="embed-iframe"
                style={{ borderRadius: "12px", border: 0 }}
                src="https://open.spotify.com/embed/album/3ZN01xzenGMhWHdC5kfAe9?utm_source=generator&si=c7c3c24088914a17"
                width="100%"
                height="100%"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          </div>
          
        </div>

      </div>
    </>
  );
}