"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, formatarData, formatarPreco } from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";
import "./ingresso.css";

const LIMITE_INGRESSOS_POR_PEDIDO = 5;

export default function ContadorIngresso() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoInicial = searchParams.get("tipo");
  const [evento, setEvento] = useState(null);
  const [tiposIngresso, setTiposIngresso] = useState([]);
  const [quantidades, setQuantidades] = useState({});
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarEvento() {
      try {
        setSessao(obterSessao());
        const [respostaEvento, respostaTipos] = await Promise.all([
          apiRequest(`eventos/${id}`),
          apiRequest(`tipos-ingresso?evento_id=${id}&limite=100`),
        ]);
        if (!ativo) return;

        const tipos = respostaTipos.dados;
        setEvento(respostaEvento.dados);
        setTiposIngresso(tipos);

        const rascunho = window.sessionStorage.getItem("ludus.pedido.rascunho");
        if (rascunho) {
          try {
            const dados = JSON.parse(rascunho);
            if (String(dados.eventoId) === String(id)) {
              const quantidadesSalvas = Object.fromEntries(
                Object.entries(dados.quantidades || {}).filter(([tipoId, quantidade]) =>
                  tipos.some((tipo) =>
                    String(tipo.id) === tipoId &&
                    Number.isInteger(quantidade) &&
                    quantidade > 0,
                  ),
                ),
              );
              setQuantidades(quantidadesSalvas);
            } else if (tipoInicial && tipos.some((tipo) => String(tipo.id) === tipoInicial)) {
              setQuantidades({ [tipoInicial]: 1 });
            }
            window.sessionStorage.removeItem("ludus.pedido.rascunho");
          } catch {
            window.sessionStorage.removeItem("ludus.pedido.rascunho");
          }
        } else if (tipoInicial && tipos.some((tipo) => String(tipo.id) === tipoInicial)) {
          setQuantidades({ [tipoInicial]: 1 });
        }
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
    (total, quantidade) => total + quantidade,
    0,
  );
  const valorTotal = tiposIngresso.reduce((total, tipo) => (
    total + (Number(tipo.preco) || 0) * (quantidades[tipo.id] || 0)
  ), 0);

  function alterarQuantidade(tipo, valor) {
    const restantes = Math.max(
      0,
      Number(tipo.quant_total) - Number(tipo.quant_vendida || 0),
    );
    const quantidadeAtual = quantidades[tipo.id] || 0;
    const quantidadeOutros = quantidadeTotal - quantidadeAtual;
    const limite = Math.max(
      0,
      Math.min(restantes, LIMITE_INGRESSOS_POR_PEDIDO - quantidadeOutros),
    );
    const quantidade = Math.min(Math.max(0, Number(valor) || 0), limite);

    setQuantidades((atuais) => {
      const novas = { ...atuais };
      if (quantidade === 0) {
        delete novas[tipo.id];
      } else {
        novas[tipo.id] = quantidade;
      }
      return novas;
    });
  }

  async function finalizarPedido(event) {
    event.preventDefault();
    setErro("");

    const itens = Object.entries(quantidades)
      .filter(([, quantidade]) => quantidade > 0)
      .map(([tipoId, quantidade]) => ({
        tipo_ingresso_id: Number(tipoId),
        quantidade,
      }));

    if (itens.length === 0) {
      setErro("Selecione ao menos um ingresso.");
      return;
    }

    const sessao = obterSessao();
    if (!sessao) {
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
        token: sessao.token,
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

  if (carregando) return <p role="status">Carregando ingressos...</p>;
  if (erro && !evento) return <p role="alert">{erro}</p>;
  if (!evento) return <p>Evento não encontrado.</p>;

  return (
    <div className="container-ingresso">
      <div className="sidesleft">
        <h1 className="title">Setores disponíveis</h1>
        <p className="descricao-ingresso">Ingressos para {evento.titulo}</p>
        <p>
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

          return (
            <div className="item-ingresso" key={tipo.id}>
              <div className="info-ingresso">
                <span className="nome-ingresso">{tipo.nome}</span>
                <span className="preco-ingresso">{formatarPreco(tipo.preco)}</span>
                <span className="preco-ingresso">
                  {restantes === 0 ? "Esgotado" : `${restantes} disponíveis`}
                </span>
              </div>
              <div className="contador-container-ingresso">
                <button
                  type="button"
                  className="btn-contador"
                  onClick={() => alterarQuantidade(tipo, (quantidades[tipo.id] || 0) - 1)}
                  disabled={!disponivel || !quantidades[tipo.id]}
                  aria-label={`Remover um ingresso ${tipo.nome}`}
                >
                  −
                </button>
                <input
                  type="number"
                  className="input-numero"
                  min="0"
                  max={Math.min(restantes, LIMITE_INGRESSOS_POR_PEDIDO)}
                  value={quantidades[tipo.id] || 0}
                  onChange={(event) => alterarQuantidade(tipo, event.target.value)}
                  aria-label={`Quantidade de ingressos ${tipo.nome}`}
                  disabled={!disponivel}
                />
                <button
                  type="button"
                  className="btn-contador"
                  onClick={() => alterarQuantidade(tipo, (quantidades[tipo.id] || 0) + 1)}
                  disabled={
                    !disponivel ||
                    quantidadeTotal >= LIMITE_INGRESSOS_POR_PEDIDO ||
                    (quantidades[tipo.id] || 0) >= restantes
                  }
                  aria-label={`Adicionar um ingresso ${tipo.nome}`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <aside className="sidesright">
        <div className="card-resumo">
          <h2 className="text-resumo">Resumo do pedido</h2>
          <p className="resumo-text">Ingressos: {quantidadeTotal}</p>
          <p className="sub-text">Total: {formatarPreco(valorTotal)}</p>
          <p className="aviso-pagamento">
            O pedido será salvo como pendente. O pagamento ainda não está integrado;
            não haverá cobrança nem emissão de ingresso nesta etapa.
          </p>
          {erro && <p className="erro-pedido" role="alert">{erro}</p>}
          <button
            type="button"
            className="btn-select"
            onClick={finalizarPedido}
            disabled={quantidadeTotal === 0 || enviando}
          >
            {enviando
              ? "Salvando pedido..."
              : sessao
                ? "Continuar"
                : "Entrar e continuar"}
          </button>
        </div>
      </aside>
    </div>
  );
}
