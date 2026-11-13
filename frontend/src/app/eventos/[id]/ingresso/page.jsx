"use client";

import { useState } from "react";
import "./ingresso.css";
import { useRouter } from "next/navigation";

export default function ContadorIngresso({
  maximo = 5,
  precoUnitario = 100, // Preço base obtido do backend
  taxaServico = 10     // Taxa obtida do backend
}) {
  const router = useRouter();

  // Controle de Tela: 'ingressos' | 'verificacao' | 'pagamento' | 'checkout'
  const [passo, setPasso] = useState("ingressos");

  const [setoresAbertos, setSetoresAbertos] = useState({});

  // Definição de setores disponíveis
  const setores = [
    { id: "camarote", nome: "Setor Camarote", preco: precoUnitario * 1.5 },
    { id: "pista", nome: "Setor Pista", preco: precoUnitario },
    { id: "cadeira", nome: "Setor Cadeira", preco: precoUnitario * 1.2 },
  ];

  // Quantidades separadas por setor: { camarote: { inteira: 0, meia: 0, idoso: 0 }, ... }
  const [ingressosPorSetor, setIngressosPorSetor] = useState(() => {
    const inicial = {};
    setores.forEach((s) => {
      inicial[s.id] = { inteira: 0, meia: 0, idoso: 0 };
    });
    return inicial;
  });

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

  // Helper para pegar preços de um setor específico
  const getPrecosSetor = (precoBase) => ({
    inteira: precoBase,
    meia: precoBase * 0.5,
    idoso: precoBase * 0.5,
  });

  // Lista de setores que têm pelo menos 1 ingresso selecionado
  const setoresComIngressos = setores.filter((setor) => {
    const qtd = ingressosPorSetor[setor.id];
    return qtd.inteira + qtd.meia + qtd.idoso > 0;
  });

  // Quantidade total acumulada em TODOS os setores
  const quantidadeTotal = setores.reduce((acc, setor) => {
    const qtd = ingressosPorSetor[setor.id];
    return acc + qtd.inteira + qtd.meia + qtd.idoso;
  }, 0);

  // Cálculos Financeiros considerando o preço específico de cada setor
  const subtotalBase = setores.reduce((acc, setor) => {
    const qtd = ingressosPorSetor[setor.id];
    const p = getPrecosSetor(setor.preco);
    return acc + qtd.inteira * p.inteira + qtd.meia * p.meia + qtd.idoso * p.idoso;
  }, 0);

  const totalDesconto = setores.reduce((acc, setor) => {
    const qtd = ingressosPorSetor[setor.id];
    const p = getPrecosSetor(setor.preco);
    return (
      acc +
      qtd.meia * (p.inteira - p.meia) +
      qtd.idoso * (p.inteira - p.idoso)
    );
  }, 0);

  const totalTaxas = quantidadeTotal * taxaServico;
  const valorSemJuros = subtotalBase + totalTaxas;

  const numParcelas = parseInt(parcelas, 10) || 1;

  const calcularTaxaJuros = (nParcelas) => {
    if (nParcelas <= 3) return 0;
    return (nParcelas - 3) * 0.015;
  };

  const taxaJurosAtual = metodoPagamento === "credito" ? calcularTaxaJuros(numParcelas) : 0;
  const valorTotalFinal = valorSemJuros * (1 + taxaJurosAtual);
  const valorPorParcela = valorTotalFinal / numParcelas;

  const toggleSetor = (setorId) => {
    setSetoresAbertos((prev) => ({
      ...prev,
      [setorId]: !prev[setorId],
    }));
  };

  const alterarQuantidade = (setorId, tipo, delta) => {
    setIngressosPorSetor((prev) => {
      const atual = prev[setorId][tipo];
      const novaQtd = atual + delta;

      if (novaQtd < 0) return prev;
      if (delta > 0 && quantidadeTotal >= maximo) return prev;

      return {
        ...prev,
        [setorId]: {
          ...prev[setorId],
          [tipo]: novaQtd,
        },
      };
    });
  };

  const handleInputChange = (setorId, tipo, e) => {
    const valor = parseInt(e.target.value, 10);
    const valorValido = isNaN(valor) ? 0 : Math.max(0, valor);

    setIngressosPorSetor((prev) => {
      const totalSemAtual = quantidadeTotal - prev[setorId][tipo];
      const permitida = Math.min(valorValido, maximo - totalSemAtual);

      return {
        ...prev,
        [setorId]: {
          ...prev[setorId],
          [tipo]: permitida,
        },
      };
    });
  };

  const irParaVerificacao = () => {
    if (quantidadeTotal === 0) {
      alert("Selecione ao menos um Ingresso!");
      return;
    }

    const novosPortadores = [];
    const tipos = [
      { key: "inteira", label: "Ingresso Inteira" },
      { key: "meia", label: "Ingresso Meia" },
      { key: "idoso", label: "Ingresso Idoso" },
    ];

    setores.forEach((setor) => {
      const qtdSetor = ingressosPorSetor[setor.id];
      tipos.forEach(({ key, label }) => {
        for (let i = 0; i < qtdSetor[key]; i++) {
          novosPortadores.push({
            id: `${setor.id}-${key}-${i}`,
            setorId: setor.id,
            setorNome: setor.nome,
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

    for (let i = 0; i < dadosPortadores.length; i++) {
      const p = dadosPortadores[i];
      if (!p.nome || !p.cpf || !p.dataNascimento || !p.sexo) {
        alert(`Preencha todos os dados do Portador ${i + 1} (${p.setorNome} - ${p.tipoLabel})!`);
        return;
      }
      if (p.tipo === "meia" && !p.dne) {
        alert(`Informe o número da DNE (Carteira de Estudante) para o Portador ${i + 1}!`);
        return;
      }
    }

    setPasso("pagamento");
  };

  const selecionarMetodo = (metodo) => {
    setMetodoPagamento(metodo);
    setParcelas("1");
    setPasso("checkout");
  };

  const handleFinalizarPedido = (e) => {
    e.preventDefault();

    if (!nome || !cpf) {
      alert("Preencha o Nome e CPF!");
      return;
    }

    const ehCartao = metodoPagamento === "credito" || metodoPagamento === "debito";
    if (ehCartao && (!numeroCartao || !validade || !cvv)) {
      alert("Preencha os Dados do Cartão!");
      return;
    }

    const resumoSetores = setoresComIngressos.map((s) => s.nome).join(", ");
    alert(`Pedido finalizado com sucesso!\nSetores: ${resumoSetores}\nTotal: R$ ${valorTotalFinal.toFixed(2)}`);
    router.push("/");
  };

  const formatarMoeda = (valor) => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const CardResumo = ({ mostrarMetodo = false }) => (
    <div className="sidesright">
      <div className="card-resumo">
        <h3 className="text-resumo">Resumo</h3>
        {setoresComIngressos.length > 0 ? (
          setoresComIngressos.map((setor) => {
            const q = ingressosPorSetor[setor.id];
            const totalSetor = q.inteira + q.meia + q.idoso;
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
        <p className="resumo-text">Subtotal: {formatarMoeda(subtotalBase)}</p>

        <h3 className="text-resumo">Sub-Total</h3>
        <p className="tax-text">Taxas de serviço: {formatarMoeda(totalTaxas)}</p>

        {mostrarMetodo && (
          <>
            <p className="sub-text">Método: {metodoPagamento.toUpperCase()}</p>
            {metodoPagamento === "credito" && (
              <>
                <p className="resumo-text">
                  Parcelamento: {parcelas}x de {formatarMoeda(valorPorParcela)}
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

        <p className="resumo-text">Total desconto: {formatarMoeda(totalDesconto)}</p>
        <p className="sub-text">
          Valor total: {formatarMoeda(mostrarMetodo ? valorTotalFinal : valorSemJuros)}
        </p>

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
              Concluir
            </button>
          </>
        )}
      </div>
    </div>
  );

  // 1. TELA DE VERIFICAÇÃO DE PORTADORES
  if (passo === "verificacao") {
    return (
      <div className="container">
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
                style={{ flexDirection: "column", alignItems: "stretch", marginBottom: "20px" }}
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
                    maxlength={14}
                    required
                  />
                </div>

                <div className="campo-form">
                  <label className="estiloLabel">Data de Nascimento:</label>
                  <input
                    type="date"
                    className="nametext"
                    value={portador.dataNascimento}
                    onChange={(e) => handlePortadorChange(index, "dataNascimento", e.target.value)}
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
                    <label className="estiloLabel">Número DNE (Documento Nacional do Estudante):</label>
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

                {portador.tipo === "idoso" && (
                  <p style={{ fontSize: "12px", color: "#d9534f", marginTop: "5px" }}>
                    * O benefício de idoso (60+ anos) será validado com base na Data de Nascimento e documento original no acesso ao evento.
                  </p>
                )}
              </div>
            ))}

            <div className="acoes-checkout" style={{ marginTop: "20px" }}>
              <button
                type="button"
                className="btn-select"
                onClick={() => setPasso("ingressos")}
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
    );
  }

  // 2. TELA DE SELEÇÃO DE PAGAMENTO
  if (passo === "pagamento") {
    return (
      <div className="container">
        <div className="sidesleft">
          <h1 className="title">Pagamentos Disponíveis</h1>

          <div className="item-ingresso">
            <div className="info-ingresso">
              <span className="nome-ingresso">PIX</span>
              <span className="preco-ingresso">
                <i className="fa-brands fa-pix"></i> Aprovação Instantânea
              </span>
            </div>
            <button type="button" className="btn-select" onClick={() => selecionarMetodo("pix")}>
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
            <button type="button" className="btn-select" onClick={() => selecionarMetodo("credito")}>
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
            <button type="button" className="btn-select" onClick={() => selecionarMetodo("debito")}>
              Selecionar Pagamento
            </button>
          </div>

          <br />
          <button type="button" className="btn-select" onClick={() => setPasso("verificacao")}>
            Voltar
          </button>
        </div>

        <CardResumo />
      </div>
    );
  }

  // 3. TELA DE CHECKOUT (FORMULÁRIO)
  if (passo === "checkout") {
    const precisaDadosCartao = metodoPagamento === "credito" || metodoPagamento === "debito";

    return (
      <div className="container">
        <div className="sidesleft">
          <h1 className="title">
            {metodoPagamento === "pix" ? "Pagamento via PIX" : "Dados do Cartão"}
          </h1>

          <div className="item-ingresso">
            <div className="info-ingresso">
              <form onSubmit={handleFinalizarPedido} className="form-checkout">
                <div className="campo-form">
                  <h2>Dados Do Pagador</h2>
                  <label htmlFor="nome" className="estiloLabel">Nome Completo:</label>
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
                  <label htmlFor="cpf" className="estiloLabel">CPF:</label>
                  <input
                    id="cpf"
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="nametext"
                    minLength={11}
                    maxlength={14}
                    required
                  />
                </div>

                {metodoPagamento === "pix" && (
                  <div className="campo-form">
                    <img src="../../img/qrcode.png" alt="QR Code" className="qr" />
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
                      <li>Escolha a opção *PIX* e depois *PIX Copia e Cola* ou *Ler QR Code*;</li>
                      <li>Confirme os dados e finalize o pagamento.</li>
                    </ol>
                  </div>
                )}

                {precisaDadosCartao && (
                  <>
                    <div className="campo-form">
                      <label htmlFor="cartao" className="estiloLabel">Número do Cartão:</label>
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
                      <label htmlFor="validade" className="estiloLabel">Validade:</label>
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
                      <label htmlFor="cvv" className="estiloLabel">CVV:</label>
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
                    <label htmlFor="parcelas" className="estiloLabel">Parcelamento:</label>
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
                            {num}x de {formatarMoeda(valorParcela)}{" "}
                            {taxa === 0 ? "(Sem juros)" : `(Juros de ${(taxa * 100).toFixed(1)}%)`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <br />
                <div className="acoes-checkout">
                  <button type="button" className="btn-select" onClick={() => setPasso("pagamento")}>
                    Voltar
                  </button>
                  <button type="submit" className="btn-selects">
                    {metodoPagamento === "pix" ? "Já Paguei" : "Pagar Agora"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <CardResumo mostrarMetodo />
      </div>
    );
  }

  // 4. TELA INICIAL (SETORES E INGRESSOS)
  return (
    <div className="container">
      <div className="sidesleft">
        <h1 className="title">Setores Disponíveis</h1>

        {setores.map((setor) => {
          const precosSetor = getPrecosSetor(setor.preco);
          const tiposIngresso = [
            { key: "inteira", label: "Ingresso Inteira", preco: precosSetor.inteira },
            { key: "meia", label: "Ingresso Meia", preco: precosSetor.meia },
            { key: "idoso", label: "Ingresso Idoso", preco: precosSetor.idoso },
          ];
          const qtdNoSetor =
            ingressosPorSetor[setor.id].inteira +
            ingressosPorSetor[setor.id].meia +
            ingressosPorSetor[setor.id].idoso;

          return (
            <div key={setor.id}>
              <div className="item-ingresso">
                <div className="info-ingresso">
                  <span className="nome-ingresso">
                    {setor.nome} {qtdNoSetor > 0 && `(${qtdNoSetor} selecionado${qtdNoSetor > 1 ? "s" : ""})`}
                  </span>
                  <span className="preco-ingresso">{formatarMoeda(setor.preco)}</span>
                </div>
                <button
                  type="button"
                  className="btn-select"
                  onClick={() => toggleSetor(setor.id)}
                >
                  {setoresAbertos[setor.id] ? "Ocultar" : "Selecionar"}
                </button>
              </div>

              {setoresAbertos[setor.id] && (
                <div>
                  {tiposIngresso.map(({ key, label, preco }) => (
                    <div key={key} className="item-ingresso">
                      <div className="info-ingresso">
                        <span className="nome-ingresso">{label}</span>
                        <span className="preco-ingresso">{formatarMoeda(preco)}</span>
                      </div>
                      <div className="contador-container">
                        <button
                          type="button"
                          onClick={() => alterarQuantidade(setor.id, key, -1)}
                          className="btn-contador"
                          disabled={ingressosPorSetor[setor.id][key] === 0}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={ingressosPorSetor[setor.id][key]}
                          onChange={(e) => handleInputChange(setor.id, key, e)}
                          className="input-numero"
                          min="0"
                          max={maximo}
                        />
                        <button
                          type="button"
                          onClick={() => alterarQuantidade(setor.id, key, 1)}
                          className="btn-contador"
                          disabled={quantidadeTotal >= maximo}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CardResumo />
    </div>
  );
}