"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiRequest, formatarData, formatarPreco } from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";
import "./ingresso.css";

const LIMITE_INGRESSOS_POR_PEDIDO = 5;
const CATEGORIAS_INGRESSO = ["inteira", "meia"];

function quantidadeDoTipo(quantidades, tipoId) {
  const quantidade = quantidades[tipoId] || {};
  return CATEGORIAS_INGRESSO.reduce(
    (total, categoria) => total + (Number(quantidade[categoria]) || 0),
    0,
  );
}

function precoEmCentavos(preco) {
  return Math.round(Number(preco) * 100);
}

export default function ContadorIngresso() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoInicial = searchParams.get("tipo");
  const [evento, setEvento] = useState(null);
  const [tiposIngresso, setTiposIngresso] = useState([]);
  const [setoresAbertos, setSetoresAbertos] = useState({});
  const [quantidades, setQuantidades] = useState({});
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarEvento() {
      try {
        const sessaoAtual = obterSessao();
        const [respostaEvento, respostaTipos] = await Promise.all([
          apiRequest(`eventos/${id}`),
          apiRequest(`tipos-ingresso?evento_id=${id}&limite=100`),
        ]);
        if (!ativo) return;

        const tipos = respostaTipos.dados;
        const quantidadesIniciais = {};
        const setoresIniciais = {};
        const rascunho = window.sessionStorage.getItem("ludus.pedido.rascunho");

        if (rascunho) {
          try {
            const dados = JSON.parse(rascunho);
            if (String(dados.eventoId) === String(id)) {
              let selecionados = 0;
              for (const tipo of tipos) {
                const quantidadeSalva = dados.quantidades?.[tipo.id];
                const categoriasSalvas = quantidadeSalva && typeof quantidadeSalva === "object"
                  ? quantidadeSalva
                  : {};
                const restantes = Math.max(
                  0,
                  Number(tipo.quant_total) - Number(tipo.quant_vendida || 0),
                );
                const inteiraSalva = typeof quantidadeSalva === "object"
                  ? Number(categoriasSalvas.inteira) || 0
                  : Number(quantidadeSalva) || 0;
                const meiaSalva = typeof quantidadeSalva === "object"
                  ? Number(categoriasSalvas.meia) || 0
                  : 0;
                const inteira = Math.min(
                  Math.max(0, Math.trunc(inteiraSalva)),
                  restantes,
                  LIMITE_INGRESSOS_POR_PEDIDO - selecionados,
                );
                const meia = Math.min(
                  Math.max(0, Math.trunc(meiaSalva)),
                  restantes - inteira,
                  LIMITE_INGRESSOS_POR_PEDIDO - selecionados - inteira,
                );
                if (inteira > 0 || meia > 0) {
                  quantidadesIniciais[tipo.id] = { inteira, meia };
                  selecionados += inteira + meia;
                }
              }
            }
          } catch {
            window.sessionStorage.removeItem("ludus.pedido.rascunho");
          }
          window.sessionStorage.removeItem("ludus.pedido.rascunho");
        }

        if (
          Object.keys(quantidadesIniciais).length === 0 &&
          tipoInicial &&
          tipos.some((tipo) => String(tipo.id) === tipoInicial)
        ) {
          quantidadesIniciais[tipoInicial] = { inteira: 1, meia: 0 };
          setoresIniciais[tipoInicial] = true;
        }

        setSessao(sessaoAtual);
        setEvento(respostaEvento.dados);
        setTiposIngresso(tipos);
        setQuantidades(quantidadesIniciais);
        setSetoresAbertos(setoresIniciais);
      } catch (erroApi) {
        if (ativo) setErro(erroApi.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarEvento();
    return () => {
      ativo = false;
    };
  }, [id, tipoInicial]);

  const quantidadeTotal = Object.values(quantidades).reduce(
    (total, quantidade) =>
      total + CATEGORIAS_INGRESSO.reduce(
        (soma, categoria) => soma + (Number(quantidade[categoria]) || 0),
        0,
      ),
    0,
  );
  
  const valorTotalCentavos = tiposIngresso.reduce((total, tipo) => {
    const quantidade = quantidades[tipo.id] || {};
    const precoInteira = precoEmCentavos(tipo.preco);
    const precoMeia = Math.round(precoInteira / 2);
    return total +
      precoInteira * (quantidade.inteira || 0) +
      precoMeia * (quantidade.meia || 0);
  }, 0);
  const valorTotal = valorTotalCentavos / 100;

  function toggleSetor(setorId) {
    setSetoresAbertos((atuais) => ({
      ...atuais,
      [setorId]: !atuais[setorId],
    }));
  }

  function alterarQuantidade(tipo, categoria, valor) {
    const restantes = Math.max(
      0,
      Number(tipo.quant_total) - Number(tipo.quant_vendida || 0),
    );
    const quantidadeInformada = Number.parseInt(valor, 10);
    const quantidadeSolicitada = Number.isFinite(quantidadeInformada)
      ? Math.max(0, quantidadeInformada)
      : 0;

    setQuantidades((atuais) => {
      const quantidadeTipoAtual = atuais[tipo.id] || {};
      const categoriaAlternativa = categoria === "meia" ? "inteira" : "meia";
      const quantidadeAlternativa = Number(quantidadeTipoAtual[categoriaAlternativa]) || 0;
      const quantidadeOutros = Object.entries(atuais).reduce(
        (total, [tipoId, quantidade]) =>
          total + CATEGORIAS_INGRESSO.reduce(
            (soma, categoriaIngresso) =>
              soma + (tipoId === String(tipo.id) && categoriaIngresso === categoria
                ? 0
                : Number(quantidade[categoriaIngresso]) || 0),
            0,
          ),
        0,
      );
      const limite = Math.max(
        0,
        Math.min(
          restantes - quantidadeAlternativa,
          LIMITE_INGRESSOS_POR_PEDIDO - quantidadeOutros,
        ),
      );
      const quantidade = Math.min(quantidadeSolicitada, limite);
      const novasQuantidades = { ...atuais };
      const novasQuantidadesTipo = { ...quantidadeTipoAtual };

      if (quantidade === 0) {
        delete novasQuantidadesTipo[categoria];
      } else {
        novasQuantidadesTipo[categoria] = quantidade;
      }

      if (quantidadeDoTipo({ [tipo.id]: novasQuantidadesTipo }, tipo.id) === 0) {
        delete novasQuantidades[tipo.id];
      } else {
        novasQuantidades[tipo.id] = novasQuantidadesTipo;
      }
      return novasQuantidades;
    });
  }

  async function finalizarPedido() {
    setErro("");
    const itens = Object.entries(quantidades).flatMap(([tipoId, categorias]) =>
      CATEGORIAS_INGRESSO
        .filter((categoria) => categorias[categoria] > 0)
        .map((categoria) => ({
          tipo_ingresso_id: Number(tipoId),
          categoria,
          quantidade: categorias[categoria],
        })),
    );

    if (itens.length === 0) {
      setErro("Selecione ao menos um ingresso.");
      return;
    }

    const sessaoAtual = obterSessao();
    if (!sessaoAtual) {
      window.sessionStorage.setItem(
        "ludus.pedido.rascunho",
        JSON.stringify({ eventoId: id, quantidades }),
      );
      router.push(`/login?redirect=${encodeURIComponent(`/eventos/${id}/ingresso`)}`);
      return;
    }

    setEnviando(true);
    try {
      const resposta = await apiRequest("pedidos", {
        method: "POST",
        token: sessaoAtual.token,
        body: { itens },
      });
      window.sessionStorage.removeItem("ludus.pedido.rascunho");
      router.push(`/perfil/meus_pedidos/${resposta.dados.id}`);
    } catch (erroApi) {
      setErro(erroApi.message);
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <p>Carregando...</p>;
  if (erro && !evento) return <p>{erro}</p>;
  if (!evento) return <p>Evento não encontrado.</p>;

  return (
    <div className="container-ingresso">
      
      {/* LADO ESQUERDO: LISTA DE INGRESSOS ORIGINAL SIMPLIFICADA */}
      <div className="sidesleft">
        <h1 className="title">Setores disponíveis</h1>
        <p className="descricao-ingresso">Ingressos para {evento.titulo}</p>
        <p className="evento-ingresso">
          {formatarData(evento.data_inicio, { dateStyle: "long", timeStyle: "short" })}
          {" · "}{evento.local_nome}
        </p>

        {tiposIngresso.length === 0 && <p>Ingressos ainda não disponíveis.</p>}

        {tiposIngresso.map((tipo) => {
          const restantes = Math.max(
            0,
            Number(tipo.quant_total) - Number(tipo.quant_vendida || 0),
          );
          const disponivel = restantes > 0 && tipo.preco !== null;
          const quantidadePorCategoria = quantidades[tipo.id] || {};
          const quantidade = quantidadeDoTipo(quantidades, tipo.id);
          const setorAberto = Boolean(setoresAbertos[tipo.id]);
          const precoInteiraCentavos = precoEmCentavos(tipo.preco);
          const precoMeia = Math.round(precoInteiraCentavos / 2) / 100;

          return (
            <section className="setor-ingresso" key={tipo.id}>
              <div className="item-ingresso">
                <div className="info-ingresso">
                  <span className="nome-ingresso">
                    {tipo.nome}
                    {quantidade > 0 && ` (${quantidade} selecionado${quantidade > 1 ? "s" : ""})`}
                  </span>
                  <span className="preco-ingresso">{formatarPreco(tipo.preco)}</span>
                </div>
                <button
                  type="button"
                  className="btn-select-simples"
                  onClick={() => toggleSetor(tipo.id)}
                  disabled={!disponivel}
                >
                  {setorAberto ? "Ocultar" : "Selecionar"}
                </button>
              </div>

              {setorAberto && disponivel && (
                <div className="opcoes-ingresso">
                  {[
                    { categoria: "inteira", nome: "Inteira", preco: tipo.preco },
                    { categoria: "meia", nome: "Meia-entrada", preco: precoMeia },
                  ].map((opcao) => {
                    const quantidadeOpcao = quantidadePorCategoria[opcao.categoria] || 0;
                    const quantidadeOutras = quantidade - quantidadeOpcao;
                    const limiteOpcao = Math.max(
                      0,
                      Math.min(
                        restantes - quantidadeOutras,
                        LIMITE_INGRESSOS_POR_PEDIDO - quantidadeTotal + quantidadeOpcao,
                      ),
                    );

                    return (
                      <div className="item-ingresso ingresso-opcao" key={opcao.categoria}>
                        <div className="info-ingresso">
                          <span className="nome-ingresso">{opcao.nome}</span>
                          <span className="preco-ingresso">
                            {formatarPreco(opcao.preco)}
                          </span>
                        </div>
                        <div className="contador-container-ingresso">
                          <button
                            type="button"
                            onClick={() => alterarQuantidade(tipo, opcao.categoria, quantidadeOpcao - 1)}
                            className="btn-contador"
                            disabled={quantidadeOpcao === 0}
                          >−</button>
                          <input
                            type="number"
                            value={quantidadeOpcao}
                            onChange={(e) => alterarQuantidade(tipo, opcao.categoria, e.target.value)}
                            className="input-numero"
                            min="0"
                            max={limiteOpcao}
                            readOnly
                          />
                          <button
                            type="button"
                            onClick={() => alterarQuantidade(tipo, opcao.categoria, quantidadeOpcao + 1)}
                            className="btn-contador"
                            disabled={quantidadeTotal >= LIMITE_INGRESSOS_POR_PEDIDO || quantidadeOpcao >= limiteOpcao}
                          >+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* LADO DIREITO: RESUMO INSPIRADO NA REFERÊNCIA */}
      <aside className="sidesright">
        <div className="card-resumo">
          <div className="resumo-kicker">RESUMO DO PEDIDO</div>
          
          <h2 className="resumo-destaque">
            {quantidadeTotal > 0 ? `${quantidadeTotal} ingresso${quantidadeTotal > 1 ? 's' : ''}` : 'Seu carrinho'}
          </h2>

          <div className="resumo-price-row">
            <div className="resumo-price-label">
              Total<br />
              <span>+ taxas aplicáveis</span>
            </div>
            <div className="resumo-price-value">
              {formatarPreco(valorTotal)}
            </div>
          </div>

          <hr className="resumo-divider" />

          <div className="resumo-lista">
            {tiposIngresso.some((tipo) => quantidadeDoTipo(quantidades, tipo.id) > 0) ? (
              tiposIngresso
                .filter((tipo) => quantidadeDoTipo(quantidades, tipo.id) > 0)
                .flatMap((tipo) => CATEGORIAS_INGRESSO
                  .filter((categoria) => quantidades[tipo.id]?.[categoria] > 0)
                  .map((categoria) => {
                    const precoCat = categoria === "meia" 
                      ? Math.round(precoEmCentavos(tipo.preco) / 2) / 100 
                      : tipo.preco;
                    
                    return (
                      <div key={`${tipo.id}-${categoria}`} className="resumo-item">
                        {/* Círculo roxo imitando o "radio" selecionado da imagem */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="#312782" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="5" fill="#312782"/>
                        </svg>
                        <div className="resumo-item-info">
                          <span className="resumo-item-nome">{tipo.nome}</span>
                          <span className="resumo-item-qtd">{quantidades[tipo.id][categoria]}x {categoria === "meia" ? "Meia" : "Inteira"}</span>
                        </div>
                        <span className="resumo-item-preco">{formatarPreco(precoCat * quantidades[tipo.id][categoria])}</span>
                      </div>
                    );
                  }))
            ) : (
              <p style={{ color: "#9ca3af", fontSize: "14px", margin: 0, textAlign: "center" }}>
                Nenhum ingresso selecionado.
              </p>
            )}
          </div>

          <button
            type="button"
            className="btn-garantir"
            onClick={finalizarPedido}
            disabled={quantidadeTotal === 0 || enviando}
          >
            {enviando ? "Processando..." : sessao ? "Garantir ingresso →" : "Entrar e continuar →"}
          </button>
          
          <div className="compra-segura">
            ✓ Compra segura · Cancelamento em 7 dias
          </div>

          {erro && <p className="erro-pedido">{erro}</p>}
        </div>
      </aside>

    </div>
  );
}