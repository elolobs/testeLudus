"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  apiRequest,
  formatarData,
  formatarPreco,
  obterUrlImagemEvento,
} from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";
import "./ingresso.css";

const LIMITE_INGRESSOS_POR_PEDIDO = 5;
const CATEGORIAS_INGRESSO = ["inteira", "meia"];

function precoEmCentavos(preco) {
  return Math.round(Number(preco) * 100);
}

function vendaDisponivel(tipo) {
  const agora = Date.now();
  const inicio = tipo.venda_inicio ? Date.parse(tipo.venda_inicio) : null;
  const fim = tipo.venda_final ? Date.parse(tipo.venda_final) : null;
  return (inicio === null || agora >= inicio) && (fim === null || agora <= fim);
}

export default function ContadorIngresso({ taxaServico = 0 }) {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoInicial = searchParams.get("tipo");

  // Estados da API e Sessão
  const [evento, setEvento] = useState(null);
  const [tiposIngresso, setTiposIngresso] = useState([]);
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  // Controle de Tela: 'ingressos' | 'verificacao' | 'pagamento' | 'checkout'
  const [passo, setPasso] = useState("ingressos");
  const [setoresAbertos, setSetoresAbertos] = useState({});

  // Quantidades separadas por setor (ID da API): { [tipo.id]: { inteira: 0, meia: 0 } }
  const [ingressosPorSetor, setIngressosPorSetor] = useState({});

  // Dados de verificação dos portadores dos ingressos
  const [dadosPortadores, setDadosPortadores] = useState([]);
  const [metodoPagamento, setMetodoPagamento] = useState("");

  // Form Pagamento
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [numeroCartao, setNumeroCartao] = useState("");
  const [cvv, setCvv] = useState("");
  const [validade, setValidade] = useState("");
  const [parcelas, setParcelas] = useState("1");

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

        const tipos = respostaTipos.dados || [];
        const quantidadesIniciais = {};
        const setoresIniciais = {};

        // Inicializa todos os setores com 0
        tipos.forEach((tipo) => {
          quantidadesIniciais[tipo.id] = { inteira: 0, meia: 0 };
        });

        // Restaura rascunho caso o usuário tenha voltado do login
        const rascunho = window.sessionStorage.getItem("ludus.pedido.rascunho");
        if (rascunho) {
          try {
            const dados = JSON.parse(rascunho);
            if (String(dados.eventoId) === String(id)) {
              let selecionados = 0;
              for (const tipo of tipos) {
                const quantidadeSalva = dados.quantidades?.[tipo.id];
                if (!quantidadeSalva) continue;

                const restantes = Math.max(
                  0,
                  Number(tipo.quant_total) - Number(tipo.quant_vendida || 0)
                );
                const inteiraSalva =
                  typeof quantidadeSalva === "object"
                    ? Number(quantidadeSalva.inteira) || 0
                    : Number(quantidadeSalva) || 0;
                const meiaSalva =
                  typeof quantidadeSalva === "object"
                    ? Number(quantidadeSalva.meia) || 0
                    : 0;

                const inteira = Math.min(
                  Math.max(0, Math.trunc(inteiraSalva)),
                  restantes,
                  LIMITE_INGRESSOS_POR_PEDIDO - selecionados
                );
                const meia = Math.min(
                  Math.max(0, Math.trunc(meiaSalva)),
                  restantes - inteira,
                  LIMITE_INGRESSOS_POR_PEDIDO - selecionados - inteira
                );

                quantidadesIniciais[tipo.id] = { inteira, meia };
                if (inteira > 0 || meia > 0) {
                  setoresIniciais[tipo.id] = true;
                  selecionados += inteira + meia;
                }
              }

              if (dados.dadosPortadores?.length > 0) {
                setDadosPortadores(dados.dadosPortadores);
              }
              if (dados.passo && selecionados > 0) {
                setPasso(dados.passo);
              }
            }
          } catch {
            // Ignora rascunho inválido
          }
          window.sessionStorage.removeItem("ludus.pedido.rascunho");
        } else if (
          tipoInicial &&
          tipos.some((tipo) => String(tipo.id) === tipoInicial)
        ) {
          const tipoEncontrado = tipos.find((t) => String(t.id) === tipoInicial);
          const restantes =
            Number(tipoEncontrado.quant_total) - Number(tipoEncontrado.quant_vendida || 0);
          if (restantes > 0 && vendaDisponivel(tipoEncontrado)) {
            quantidadesIniciais[tipoInicial] = { inteira: 1, meia: 0 };
            setoresIniciais[tipoInicial] = true;
          }
        }

        setSessao(sessaoAtual);
        if (sessaoAtual?.usuario?.nome) {
          setNome(sessaoAtual.usuario.nome);
        }
        setEvento(respostaEvento.dados);
        setTiposIngresso(tipos);
        setIngressosPorSetor(quantidadesIniciais);
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

  const getPrecosSetor = (precoBase) => {
    const inteiraCentavos = precoEmCentavos(precoBase);
    const meiaCentavos = Math.round(inteiraCentavos / 2);
    return {
      inteira: inteiraCentavos / 100,
      meia: meiaCentavos / 100,
    };
  };

  const setoresComIngressos = tiposIngresso.filter((tipo) => {
    const qtd = ingressosPorSetor[tipo.id] || { inteira: 0, meia: 0 };
    return qtd.inteira + qtd.meia > 0;
  });

  const quantidadeTotal = tiposIngresso.reduce((acc, tipo) => {
    const qtd = ingressosPorSetor[tipo.id] || { inteira: 0, meia: 0 };
    return acc + qtd.inteira + qtd.meia;
  }, 0);

  const subtotalBase = tiposIngresso.reduce((acc, tipo) => {
    const qtd = ingressosPorSetor[tipo.id] || { inteira: 0, meia: 0 };
    const p = getPrecosSetor(tipo.preco);
    return acc + qtd.inteira * p.inteira + qtd.meia * p.meia;
  }, 0);

  const totalDesconto = tiposIngresso.reduce((acc, tipo) => {
    const qtd = ingressosPorSetor[tipo.id] || { inteira: 0, meia: 0 };
    const p = getPrecosSetor(tipo.preco);
    return acc + qtd.meia * (p.inteira - p.meia);
  }, 0);

  const totalTaxas = quantidadeTotal * taxaServico;
  const valorSemJuros = subtotalBase + totalTaxas;

  const numParcelas = parseInt(parcelas, 10) || 1;

  const calcularTaxaJuros = (nParcelas) => {
    if (nParcelas <= 3) return 0;
    return (nParcelas - 3) * 0.015;
  };

  const taxaJurosAtual =
    metodoPagamento === "credito" ? calcularTaxaJuros(numParcelas) : 0;
  const valorTotalFinal = valorSemJuros * (1 + taxaJurosAtual);
  const valorPorParcela = valorTotalFinal / numParcelas;

  const toggleSetor = (setorId) => {
    setSetoresAbertos((prev) => ({
      ...prev,
      [setorId]: !prev[setorId],
    }));
  };

  const alterarQuantidade = (tipo, categoria, delta) => {
    const restantes = Math.max(
      0,
      Number(tipo.quant_total) - Number(tipo.quant_vendida || 0)
    );

    setIngressosPorSetor((prev) => {
      const atualSetor = prev[tipo.id] || { inteira: 0, meia: 0 };
      const atual = atualSetor[categoria] || 0;
      const novaQtd = atual + delta;
      const totalNoSetor = atualSetor.inteira + atualSetor.meia;

      if (novaQtd < 0) return prev;
      if (
        delta > 0 &&
        (quantidadeTotal >= LIMITE_INGRESSOS_POR_PEDIDO || totalNoSetor >= restantes)
      ) {
        return prev;
      }

      return {
        ...prev,
        [tipo.id]: {
          ...atualSetor,
          [categoria]: novaQtd,
        },
      };
    });
  };

  const handleInputChange = (tipo, categoria, e) => {
    const valor = parseInt(e.target.value, 10);
    const valorValido = isNaN(valor) ? 0 : Math.max(0, valor);
    const restantes = Math.max(
      0,
      Number(tipo.quant_total) - Number(tipo.quant_vendida || 0)
    );

    setIngressosPorSetor((prev) => {
      const atualSetor = prev[tipo.id] || { inteira: 0, meia: 0 };
      const outraCategoria = categoria === "meia" ? "inteira" : "meia";
      const qtdOutra = atualSetor[outraCategoria] || 0;
      const totalSemAtual = quantidadeTotal - (atualSetor[categoria] || 0);

      const permitida = Math.min(
        valorValido,
        restantes - qtdOutra,
        LIMITE_INGRESSOS_POR_PEDIDO - totalSemAtual
      );

      return {
        ...prev,
        [tipo.id]: {
          ...atualSetor,
          [categoria]: Math.max(0, permitida),
        },
      };
    });
  };

  const irParaVerificacao = () => {
    setErro("");
    if (quantidadeTotal === 0) {
      setErro("Selecione ao menos um ingresso.");
      return;
    }

    const novosPortadores = [];
    const categorias = [
      { key: "inteira", label: "Ingresso Inteira" },
      { key: "meia", label: "Ingresso Meia-entrada" },
    ];

    tiposIngresso.forEach((tipo) => {
      const qtdSetor = ingressosPorSetor[tipo.id] || { inteira: 0, meia: 0 };
      categorias.forEach(({ key, label }) => {
        for (let i = 0; i < qtdSetor[key]; i++) {
          novosPortadores.push({
            id: `${tipo.id}-${key}-${i}`,
            setorId: tipo.id,
            setorNome: tipo.nome,
            tipo: key,
            tipoLabel: label,
            nome: "",
            cpf: "",
            dataNascimento: "",
            sexo: "",
            dne: "",
          });
        }
      });
    });

    const sessaoAtual = obterSessao();
    if (!sessaoAtual) {
      window.sessionStorage.setItem(
        "ludus.pedido.rascunho",
        JSON.stringify({
          eventoId: id,
          quantidades: ingressosPorSetor,
          dadosPortadores: novosPortadores,
          passo: "verificacao",
        })
      );
      router.push(`/login?redirect=${encodeURIComponent(`/eventos/${id}/ingresso`)}`);
      return;
    }

    setDadosPortadores(novosPortadores);
    setPasso("verificacao");
  };

  const handlePortadorChange = (index, campo, valor) => {
    setDadosPortadores((prev) => {
      const atualizados = [...prev];
      atualizados[index] = { ...atualizados[index], [campo]: valor };
      return atualizados;
    });
  };

  const confirmarVerificacao = (e) => {
    e.preventDefault();
    setErro("");

    for (let i = 0; i < dadosPortadores.length; i++) {
      const p = dadosPortadores[i];
      if (!p.nome || !p.cpf || !p.dataNascimento || !p.sexo) {
        setErro(
          `Preencha todos os dados do Portador ${i + 1} (${p.setorNome} - ${p.tipoLabel}).`
        );
        return;
      }
      if (p.tipo === "meia" && !p.dne) {
        setErro(
          `Informe o número da DNE (Carteira de Estudante) para o Portador ${i + 1}.`
        );
        return;
      }
    }

    setPasso("pagamento");
  };

  const selecionarMetodo = (metodo) => {
    setErro("");
    setMetodoPagamento(metodo);
    setParcelas("1");
    setPasso("checkout");
  };

  const handleFinalizarPedido = async (e) => {
    e.preventDefault();
    setErro("");

    if (!nome || !cpf) {
      setErro("Preencha o Nome e CPF do pagador.");
      return;
    }

    const ehCartao = metodoPagamento === "credito" || metodoPagamento === "debito";
    if (ehCartao && (!numeroCartao || !validade || !cvv)) {
      setErro("Preencha os Dados do Cartão.");
      return;
    }

    const sessaoAtual = obterSessao();
    if (!sessaoAtual) {
      window.sessionStorage.setItem(
        "ludus.pedido.rascunho",
        JSON.stringify({
          eventoId: id,
          quantidades: ingressosPorSetor,
          dadosPortadores,
          passo: "pagamento",
        })
      );
      router.push(`/login?redirect=${encodeURIComponent(`/eventos/${id}/ingresso`)}`);
      return;
    }

    const itens = Object.entries(ingressosPorSetor).flatMap(([tipoId, categorias]) =>
      CATEGORIAS_INGRESSO.filter((categoria) => (categorias[categoria] || 0) > 0).map(
        (categoria) => ({
          tipo_ingresso_id: Number(tipoId),
          categoria,
          quantidade: categorias[categoria],
        })
      )
    );

    if (itens.length === 0) {
      setErro("Selecione ao menos um ingresso.");
      return;
    }

    setEnviando(true);
    try {
      const resposta = await apiRequest("pedidos", {
        method: "POST",
        token: sessaoAtual.token,
        body: {
          itens,
          metodo_pagamento: metodoPagamento,
          parcelas: metodoPagamento === "credito" ? numParcelas : 1,
          pagador: { nome, cpf },
          portadores: dadosPortadores,
        },
      });

      window.sessionStorage.removeItem("ludus.pedido.rascunho");
      router.push(`/perfil/meus_pedidos/${resposta.dados.id}`);
    } catch (erroApi) {
      setErro(erroApi.message);
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) return <p>Carregando...</p>;
  if (erro && !evento) return <p>{erro}</p>;
  if (!evento) return <p>Evento não encontrado.</p>;

  const imagemEvento = obterUrlImagemEvento(evento.imagem_capa_url);

  const CapaEvento = () => (
    <section className="ingresso-evento-capa">
      {imagemEvento && (
        <img src={imagemEvento} alt={`Imagem do evento ${evento.titulo}`} />
      )}
      <div className="ingresso-evento-capa-overlay">
        <div>
          <h1>{evento.titulo}</h1>
          <p>{evento.local_nome}</p>
        </div>
        <p>
          {formatarData(evento.data_inicio, {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </p>
      </div>
    </section>
  );

  const CardResumo = ({ mostrarMetodo = false }) => (
    <div className="sidesright">
      <div className="card-resumo">
        <h3 className="text-resumo">Resumo</h3>
        {setoresComIngressos.length > 0 ? (
          setoresComIngressos.map((setor) => {
            const q = ingressosPorSetor[setor.id] || { inteira: 0, meia: 0 };
            const totalSetor = q.inteira + q.meia;
            return (
              <p key={setor.id} className="resumo-text">
                {setor.nome}: {totalSetor}x
              </p>
            );
          })
        ) : (
          <p className="resumo-text">Nenhum setor selecionado</p>
        )}

        <p className="resumo-text">Ingressos totais: {quantidadeTotal}</p>
        <p className="resumo-text">Subtotal: {formatarPreco(subtotalBase)}</p>

        <h3 className="text-resumo">Sub-Total</h3>
        <p className="tax-text">Taxas de serviço: {formatarPreco(totalTaxas)}</p>

        {mostrarMetodo && (
          <>
            <p className="sub-text">Método: {metodoPagamento.toUpperCase()}</p>
            {metodoPagamento === "credito" && (
              <>
                <p className="resumo-text">
                  Parcelamento: {parcelas}x de {formatarPreco(valorPorParcela)}
                </p>
                <p className="tax-text">
                  {taxaJurosAtual > 0
                    ? `Juros: ${(taxaJurosAtual * 100).toFixed(1)}% aplicado`
                    : "Sem juros"}
                </p>
              </>
            )}
          </>
        )}

        <p className="resumo-text">Total desconto: {formatarPreco(totalDesconto)}</p>
        <p className="sub-text">
          Valor total: {formatarPreco(mostrarMetodo ? valorTotalFinal : valorSemJuros)}
        </p>

        {erro && <p className="erro-pedido">{erro}</p>}

        {passo === "ingressos" && (
          <>
            <br />
            <button
              type="button"
              className="btn-select"
              onClick={irParaVerificacao}
              disabled={quantidadeTotal === 0}
              style={{
                opacity: quantidadeTotal === 0 ? 0.5 : 1,
                cursor: quantidadeTotal === 0 ? "not-allowed" : "pointer",
              }}
            >
              {sessao ? "Concluir" : "Entrar e Concluir"}
            </button>
          </>
        )}
      </div>
    </div>
  );

  // 1. TELA DE VERIFICAÇÃO DE PORTADORES
  if (passo === "verificacao") {
    return (
      <>
        <CapaEvento />
        <div className="container-ingresso">
          <div className="sidesleft">
            <h1 className="title">Verificação de Veracidade</h1>
            <p style={{ marginBottom: "20px", color: "#666" }}>
              Preencha os dados dos portadores de cada ingresso para validação do benefício.
            </p>

            <form onSubmit={confirmarVerificacao} className="form-checkout">
              {dadosPortadores.map((portador, index) => (
                <div
                  key={portador.id}
                  className="item-ingresso"
                  style={{
                    flexDirection: "column",
                    alignItems: "stretch",
                    marginBottom: "20px",
                  }}
                >
                  <h2>
                    Portador {index + 1} - {portador.setorNome} ({portador.tipoLabel})
                  </h2>

                  <div className="campo-form">
                    <label className="estiloLabel">Nome Completo:</label>
                    <input
                      type="text"
                      className="nametext"
                      value={portador.nome}
                      onChange={(e) => handlePortadorChange(index, "nome", e.target.value)}
                      placeholder="Nome do titular do ingresso"
                      required
                    />
                  </div>

                  <div className="campo-form">
                    <label className="estiloLabel">CPF:</label>
                    <input
                      type="text"
                      className="nametext"
                      value={portador.cpf}
                      onChange={(e) => handlePortadorChange(index, "cpf", e.target.value)}
                      placeholder="000.000.000-00"
                      minLength={11}
                      maxLength={14}
                      required
                    />
                  </div>

                  <div className="campo-form">
                    <label className="estiloLabel">Data de Nascimento:</label>
                    <input
                      type="date"
                      className="nametext"
                      value={portador.dataNascimento}
                      onChange={(e) =>
                        handlePortadorChange(index, "dataNascimento", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="campo-form">
                    <label className="estiloLabel">Sexo:</label>
                    <select
                      className="nametext"
                      value={portador.sexo}
                      onChange={(e) => handlePortadorChange(index, "sexo", e.target.value)}
                      required
                    >
                      <option value="">Selecione</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  {portador.tipo === "meia" && (
                    <div className="campo-form">
                      <label className="estiloLabel">
                        Número DNE (Documento Nacional do Estudante):
                      </label>
                      <input
                        type="text"
                        className="nametext"
                        value={portador.dne}
                        onChange={(e) => handlePortadorChange(index, "dne", e.target.value)}
                        placeholder="Código de uso da carteira"
                        required
                      />
                    </div>
                  )}
                </div>
              ))}

              <div className="acoes-checkout" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="btn-select"
                  onClick={() => {
                    setErro("");
                    setPasso("ingressos");
                  }}
                >
                  Voltar
                </button>
                <button type="submit" className="btn-selects">
                  Avançar para Pagamento
                </button>
              </div>
            </form>
          </div>

          <CardResumo />
        </div>
      </>
    );
  }

  // 2. TELA DE SELEÇÃO DE PAGAMENTO
  if (passo === "pagamento") {
    return (
      <>
        <CapaEvento />
        <div className="container-ingresso">
          <div className="sidesleft">
            <h1 className="title">Pagamentos Disponíveis</h1>

            <div className="item-ingresso">
              <div className="info-ingresso">
                <span className="nome-ingresso">PIX</span>
                <span className="preco-ingresso">
                  <i className="fa-brands fa-pix"></i> Aprovação Instantânea
                </span>
              </div>
              <button
                type="button"
                className="btn-select"
                onClick={() => selecionarMetodo("pix")}
              >
                Selecionar Pagamento
              </button>
            </div>

            <div className="item-ingresso">
              <div className="info-ingresso">
                <span className="nome-ingresso">Cartão de Crédito</span>
                <span className="preco-ingresso">
                  <i className="fa-regular fa-credit-card"></i> Até 12x
                </span>
              </div>
              <button
                type="button"
                className="btn-select"
                onClick={() => selecionarMetodo("credito")}
              >
                Selecionar Pagamento
              </button>
            </div>

            <div className="item-ingresso">
              <div className="info-ingresso">
                <span className="nome-ingresso">Cartão de Débito</span>
                <span className="preco-ingresso">
                  <i className="fa-solid fa-credit-card"></i> À vista
                </span>
              </div>
              <button
                type="button"
                className="btn-select"
                onClick={() => selecionarMetodo("debito")}
              >
                Selecionar Pagamento
              </button>
            </div>

            <br />
            <button
              type="button"
              className="btn-select"
              onClick={() => {
                setErro("");
                setPasso("verificacao");
              }}
            >
              Voltar
            </button>
          </div>

          <CardResumo />
        </div>
      </>
    );
  }

  // 3. TELA DE CHECKOUT (FORMULÁRIO)
  if (passo === "checkout") {
    const precisaDadosCartao =
      metodoPagamento === "credito" || metodoPagamento === "debito";

    return (
      <>
        <CapaEvento />
        <div className="container-ingresso">
          <div className="sidesleft">
            <h1 className="title">
              {metodoPagamento === "pix" ? "Pagamento via PIX" : "Dados do Cartão"}
            </h1>

            <div className="item-ingresso">
              <div className="info-ingresso">
                <form onSubmit={handleFinalizarPedido} className="form-checkout">
                  <div className="campo-form">
                    <h2>Dados Do Pagador</h2>
                    <label htmlFor="nome" className="estiloLabel">
                      Nome Completo:
                    </label>
                    <input
                      id="nome"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Digite seu nome"
                      className="nametext"
                      required
                    />
                  </div>

                  <div className="campo-form">
                    <label htmlFor="cpf" className="estiloLabel">
                      CPF:
                    </label>
                    <input
                      id="cpf"
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="nametext"
                      minLength={11}
                      maxLength={14}
                      required
                    />
                  </div>

                  {metodoPagamento === "pix" && (
                    <div className="campo-form">
                      <img src="/img/qrcode.png" alt="QR Code" className="qr" />
                      <textarea
                        name="copia"
                        id="copia-pix"
                        className="area"
                        placeholder="Copie o código PIX aqui"
                        value="4b7c0887-d032-40e1-a9a4-3986cbda742a"
                        readOnly
                      />
                      <ol className="instrucoes-pix">
                        <li>Abra o aplicativo do seu banco;</li>
                        <li>
                          Escolha a opção <strong>PIX</strong> e depois{" "}
                          <strong>PIX Copia e Cola</strong> ou{" "}
                          <strong>Ler QR Code</strong>;
                        </li>
                        <li>Confirme os dados e finalize o pagamento.</li>
                      </ol>
                    </div>
                  )}

                  {precisaDadosCartao && (
                    <>
                      <div className="campo-form">
                        <label htmlFor="cartao" className="estiloLabel">
                          Número do Cartão:
                        </label>
                        <input
                          id="cartao"
                          type="text"
                          value={numeroCartao}
                          onChange={(e) => setNumeroCartao(e.target.value)}
                          placeholder="0000 0000 0000 0000"
                          className="nametext"
                          required
                        />
                      </div>

                      <div className="campo-form">
                        <label htmlFor="validade" className="estiloLabel">
                          Validade:
                        </label>
                        <input
                          id="validade"
                          type="text"
                          value={validade}
                          onChange={(e) => setValidade(e.target.value)}
                          placeholder="MM/AA"
                          className="nametext"
                          required
                        />
                      </div>

                      <div className="campo-form">
                        <label htmlFor="cvv" className="estiloLabel">
                          CVV:
                        </label>
                        <input
                          id="cvv"
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="123"
                          className="nametext"
                          required
                        />
                      </div>
                    </>
                  )}

                  {metodoPagamento === "credito" && (
                    <div className="campo-form">
                      <label htmlFor="parcelas" className="estiloLabel">
                        Parcelamento:
                      </label>
                      <select
                        id="parcelas"
                        value={parcelas}
                        onChange={(e) => setParcelas(e.target.value)}
                        className="nametext"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                          const taxa = calcularTaxaJuros(num);
                          const totalComJuros = valorSemJuros * (1 + taxa);
                          const valorParcela = totalComJuros / num;

                          return (
                            <option key={num} value={num}>
                              {num}x de {formatarPreco(valorParcela)}{" "}
                              {taxa === 0
                                ? "(Sem juros)"
                                : `(Juros de ${(taxa * 100).toFixed(1)}%)`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  <br />
                  <div className="acoes-checkout">
                    <button
                      type="button"
                      className="btn-select"
                      onClick={() => {
                        setErro("");
                        setPasso("pagamento");
                      }}
                      disabled={enviando}
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="btn-selects"
                      disabled={enviando}
                    >
                      {enviando
                        ? "Processando..."
                        : metodoPagamento === "pix"
                        ? "Já Paguei"
                        : "Pagar Agora"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <CardResumo mostrarMetodo />
        </div>
      </>
    );
  }

  // 4. TELA INICIAL (SETORES E INGRESSOS)
  return (
    <>
      <CapaEvento />
      <div className="container-ingresso">
        <div className="sidesleft">
          <h1 className="title">Setores Disponíveis</h1>
          <p className="descricao-ingresso">Ingressos para {evento.titulo}</p>
          <p className="evento-ingresso">
            {formatarData(evento.data_inicio, {
              dateStyle: "long",
              timeStyle: "short",
            })}
            {" · "}
            {evento.local_nome}
          </p>

          {tiposIngresso.length === 0 && <p>Ingressos ainda não disponíveis.</p>}

          {tiposIngresso.map((tipo) => {
            const restantes = Math.max(
              0,
              Number(tipo.quant_total) - Number(tipo.quant_vendida || 0)
            );
            const disponivel =
              restantes > 0 && tipo.preco !== null && vendaDisponivel(tipo);

            const precosSetor = getPrecosSetor(tipo.preco);
            const opcoesCategoria = [
              { key: "inteira", label: "Ingresso Inteira", preco: precosSetor.inteira },
              { key: "meia", label: "Ingresso Meia-entrada", preco: precosSetor.meia },
            ];

            const qtdSetorObj = ingressosPorSetor[tipo.id] || { inteira: 0, meia: 0 };
            const qtdNoSetor = qtdSetorObj.inteira + qtdSetorObj.meia;

            return (
              <div key={tipo.id}>
                <div className="item-ingresso">
                  <div className="info-ingresso">
                    <span className="nome-ingresso">
                      {tipo.nome}{" "}
                      {qtdNoSetor > 0 &&
                        `(${qtdNoSetor} selecionado${qtdNoSetor > 1 ? "s" : ""})`}
                    </span>
                    <span className="preco-ingresso">
                      {formatarPreco(tipo.preco)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-select"
                    onClick={() => toggleSetor(tipo.id)}
                    disabled={!disponivel}
                  >
                    {!disponivel
                      ? "Esgotado"
                      : setoresAbertos[tipo.id]
                      ? "Ocultar"
                      : "Selecionar"}
                  </button>
                </div>

                {setoresAbertos[tipo.id] && disponivel && (
                  <div>
                    {opcoesCategoria.map(({ key, label, preco }) => {
                      const qtdAtual = qtdSetorObj[key] || 0;
                      const qtdOutra = qtdNoSetor - qtdAtual;
                      const limiteOpcao = Math.max(
                        0,
                        Math.min(
                          restantes - qtdOutra,
                          LIMITE_INGRESSOS_POR_PEDIDO - quantidadeTotal + qtdAtual
                        )
                      );

                      return (
                        <div key={key} className="item-ingresso">
                          <div className="info-ingresso">
                            <span className="nome-ingresso">{label}</span>
                            <span className="preco-ingresso">
                              {formatarPreco(preco)}
                            </span>
                          </div>
                          <div className="contador-container-ingresso">
                            <button
                              type="button"
                              onClick={() => alterarQuantidade(tipo, key, -1)}
                              className="btn-contador"
                              disabled={qtdAtual === 0}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              value={qtdAtual}
                              onChange={(e) => handleInputChange(tipo, key, e)}
                              className="input-numero"
                              min="0"
                              max={limiteOpcao}
                            />
                            <button
                              type="button"
                              onClick={() => alterarQuantidade(tipo, key, 1)}
                              className="btn-contador"
                              disabled={
                                quantidadeTotal >= LIMITE_INGRESSOS_POR_PEDIDO ||
                                qtdAtual >= limiteOpcao
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <CardResumo />
      </div>
    </>
  );
}