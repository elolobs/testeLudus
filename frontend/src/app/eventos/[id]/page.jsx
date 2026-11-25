"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import "./detalha.css";
import {
  apiRequest,
  formatarData,
  obterUrlImagemEvento,
} from "@/lib/api.mjs";

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

  // Agrupa todos os dias do evento vindos do banco para montar os cards de ingressos
  const diasDeVenda = useMemo(() => {
    if (!evento) return [];

    const mapa = new Map();

    const extrairChaveLocal = (dataStr) => {
      if (!dataStr) return null;
      const d = new Date(dataStr);
      if (Number.isNaN(d.getTime())) return null;
      const ano = d.getFullYear();
      const mes = String(d.getMonth() + 1).padStart(2, "0");
      const dia = String(d.getDate()).padStart(2, "0");
      return `${ano}-${mes}-${dia}`;
    };

    const capitalizar = (texto) =>
      texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : "";

    const formatarDiaSemana = (dataObj) =>
      capitalizar(dataObj.toLocaleDateString("pt-BR", { weekday: "long" }));

    const formatarExtenso = (dataObj) =>
      capitalizar(
        dataObj.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        })
      );

    const avaliarStatusDia = (listaIngressos) => {
      if (!listaIngressos || listaIngressos.length === 0) {
        return { texto: "Disponível", classe: "bolinha-verde", esgotado: false };
      }

      const agora = Date.now();
      let totalRestantes = 0;
      let algumAtivo = false;

      listaIngressos.forEach((ing) => {
        const restantes = Math.max(
          0,
          Number(ing.quant_total) - Number(ing.quant_vendida || 0)
        );
        const inicio = ing.venda_inicio ? Date.parse(ing.venda_inicio) : null;
        const fim = ing.venda_final ? Date.parse(ing.venda_final) : null;
        const dentroDoPrazo =
          (inicio === null || agora >= inicio) && (fim === null || agora <= fim);

        if (dentroDoPrazo) {
          algumAtivo = true;
          totalRestantes += restantes;
        }
      });

      if (!algumAtivo) {
        return { texto: "Venda encerrada", classe: "bolinha-vermelha", esgotado: true };
      }
      if (totalRestantes === 0) {
        return { texto: "Esgotado", classe: "bolinha-vermelha", esgotado: true };
      }
      if (totalRestantes <= 10) {
        return { texto: "Baixa disponibilidade", classe: "bolinha-amarela", esgotado: false };
      }
      return { texto: "Disponível", classe: "bolinha-verde", esgotado: false };
    };

    // 1. Gera todos os dias do intervalo data_inicio até data_fim do evento
    if (evento.data_inicio && evento.data_fim) {
      const inicio = new Date(evento.data_inicio);
      const fim = new Date(evento.data_fim);
      if (!Number.isNaN(inicio.getTime()) && !Number.isNaN(fim.getTime())) {
        const cursor = new Date(
          inicio.getFullYear(),
          inicio.getMonth(),
          inicio.getDate(),
          12,
          0,
          0
        );
        const limite = new Date(
          fim.getFullYear(),
          fim.getMonth(),
          fim.getDate(),
          12,
          0,
          0
        );

        let contadorDia = 1;
        while (cursor <= limite) {
          const chave = extrairChaveLocal(cursor);
          if (chave && !mapa.has(chave)) {
            mapa.set(chave, {
              chave,
              numeroDia: contadorDia,
              diaSemana: formatarDiaSemana(cursor),
              dataPorExtenso: formatarExtenso(cursor),
              dataFormatada: formatarData(cursor, { dateStyle: "short" }),
              ordem: cursor.getTime(),
              ehPacote: false,
              ingressos: [],
            });
            contadorDia++;
          }
          cursor.setDate(cursor.getDate() + 1);
        }
      }
    }

    // 2. Verifica dias extras na programação (atividades)
    atividades.forEach((atividade) => {
      if (!atividade.data_hora_inicio) return;
      const chave = extrairChaveLocal(atividade.data_hora_inicio);
      if (chave && !mapa.has(chave)) {
        const d = new Date(`${chave}T12:00:00`);
        mapa.set(chave, {
          chave,
          numeroDia: mapa.size + 1,
          diaSemana: formatarDiaSemana(d),
          dataPorExtenso: formatarExtenso(d),
          dataFormatada: formatarData(d, { dateStyle: "short" }),
          ordem: d.getTime(),
          ehPacote: false,
          ingressos: [],
        });
      }
    });

    // 3. Distribui os tipos de ingresso nos respectivos dias (ou cria o card de Pacote)
    ingressos.forEach((ingresso) => {
      const ehPacote =
        ingresso.is_pacote === true ||
        String(ingresso.nome || "").toLowerCase().includes("pacote") ||
        String(ingresso.nome || "").toLowerCase().includes("passaporte");

      if (ehPacote) {
        if (!mapa.has("pacote")) {
          mapa.set("pacote", {
            chave: "pacote",
            tituloCustom: "Passaporte Todos os Dias",
            dataFormatada: "Acesso completo",
            ordem: 0,
            ehPacote: true,
            ingressos: [],
          });
        }
        mapa.get("pacote").ingressos.push(ingresso);
        return;
      }

      const dataIngresso =
        ingresso.data_evento || ingresso.data_inicio || ingresso.data;
      const chaveIngresso = extrairChaveLocal(dataIngresso);

      if (chaveIngresso) {
        if (!mapa.has(chaveIngresso)) {
          const d = new Date(`${chaveIngresso}T12:00:00`);
          mapa.set(chaveIngresso, {
            chave: chaveIngresso,
            numeroDia: mapa.size + 1,
            diaSemana: formatarDiaSemana(d),
            dataPorExtenso: formatarExtenso(d),
            dataFormatada: formatarData(d, { dateStyle: "short" }),
            ordem: d.getTime(),
            ehPacote: false,
            ingressos: [],
          });
        }
        mapa.get(chaveIngresso).ingressos.push(ingresso);
      } else {
        // Se o ingresso não tem data específica, vincula a todos os dias do evento
        if (mapa.size === 0) {
          const dataFallback = evento.data_inicio || evento.data_fim;
          const chaveFallback = extrairChaveLocal(dataFallback) || "geral";
          const d = dataFallback ? new Date(dataFallback) : new Date();
          mapa.set(chaveFallback, {
            chave: chaveFallback,
            numeroDia: 1,
            diaSemana: formatarDiaSemana(d),
            dataPorExtenso: formatarExtenso(d),
            dataFormatada: formatarData(d, { dateStyle: "short" }),
            ordem: d.getTime(),
            ehPacote: false,
            ingressos: [],
          });
        }

        mapa.forEach((diaObj, key) => {
          if (key !== "pacote") {
            diaObj.ingressos.push(ingresso);
          }
        });
      }
    });

    const listaOrdenada = Array.from(mapa.values()).sort(
      (a, b) => a.ordem - b.ordem
    );
    const totalDiasComuns = listaOrdenada.filter((d) => !d.ehPacote).length;

    return listaOrdenada.map((item, idx) => {
      const titulo = item.ehPacote
        ? item.tituloCustom
        : totalDiasComuns > 1
        ? `Dia ${idx + 1} · ${item.diaSemana}`
        : item.dataPorExtenso;

      return {
        ...item,
        titulo,
        status: avaliarStatusDia(item.ingressos),
      };
    });
  }, [evento, ingressos, atividades]);

  if (carregando) return <p role="status">Carregando evento...</p>;
  if (erro) return <p role="alert">{erro}</p>;
  if (!evento) return <p>Evento não encontrado.</p>;

  const enderecoMapa = encodeURIComponent(
    [evento.local_nome, evento.local_endereco].filter(Boolean).join(", ")
  );

  function obterEmbedPlaylist(url) {
    if (!url) return "";
    let endereco;
    try {
      endereco = new URL(url.trim());
    } catch {
      return "";
    }

    if (!["open.spotify.com", "www.open.spotify.com"].includes(endereco.hostname)) {
      return "";
    }

    const partes = endereco.pathname.split("/").filter(Boolean);
    const filtradas = partes.filter(
      (parte) => parte !== "embed" && !parte.startsWith("intl-")
    );

    if (
      filtradas.length < 2 ||
      !["playlist", "album", "artist", "track"].includes(filtradas[0])
    ) {
      return "";
    }

    return `https://open.spotify.com/embed/${filtradas[0]}/${encodeURIComponent(filtradas[1])}?utm_source=generator`;
  }

  const playlistEmbed = obterEmbedPlaylist(evento.playlist_url);
  const imagemEvento = obterUrlImagemEvento(evento.imagem_capa_url);

  return (
    <>
      <div className="container-detalhes">
        {imagemEvento && (
          <img
            src={imagemEvento}
            alt={`Imagem do evento ${evento.titulo}`}
          />
        )}
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
          {diasDeVenda.length === 0 && <p>Ingressos ainda não disponíveis.</p>}

          {diasDeVenda.map((dia) => (
            <div className="boxs" key={dia.chave}>
              <div className="container-box-detalhes">
                <img src="/img/logo.png" alt="Logo Ludus" />
              </div>
              <div className="Linha" />
              <div className="colluns">
                <h2>{dia.titulo}</h2>
                <span className="badge-disponibilidade">
                  <span className={dia.status.classe} /> {dia.status.texto}
                </span>
                <p className="data-local">
                  {dia.dataFormatada} | {evento.local_nome}
                </p>
              </div>
              <Link
                className={
                  dia.status.esgotado
                    ? "botao-ingresso desabilitado"
                    : "botao-ingresso"
                }
                href={`/eventos/${id}/ingresso?dia=${encodeURIComponent(dia.chave)}`}
                aria-disabled={dia.status.esgotado}
                onClick={(event) => {
                  if (dia.status.esgotado) event.preventDefault();
                }}
              >
                {dia.status.esgotado ? dia.status.texto : "Adquirir Ingresso"}
              </Link>
            </div>
          ))}
        </div>

        <div className="secao-resumo">
          <div className="resumo-texto-lado">
            <span className="secao-kicker">RESUMO DO EVENTO</span>
            <h2>Sobre a <br />experiência.</h2>
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

          {playlistEmbed && (
            <div className="card-midia dark">
              <div className="card-midia-header">
                <div className="card-midia-header-textos">
                  <h2>PLAYLIST OFICIAL</h2>
                  <h3>Entre no clima.</h3>
                </div>
              </div>
              <div className="wrapper-iframe">
                <iframe
                  title={`Playlist do artista do evento ${evento.titulo}`}
                  data-testid="embed-iframe"
                  style={{ borderRadius: "12px", border: 0 }}
                  src={playlistEmbed}
                  width="100%"
                  height="100%"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}