"use client";

import { useState } from "react";
import "./ingresso.css";
import { useRouter } from "next/navigation";

export default function ContadorIngresso({
  maximo = 5,
  precoUnitario = 100, // Preço obtido do backend
  taxaServico = 10     // Taxa obtida do backend
}) {
  const router = useRouter();

  // Controle de Tela: 'ingressos' | 'verificacao' | 'pagamento' | 'checkout'
  const [passo, setPasso] = useState("ingressos");

  // Controle de Setores
  const [setorAberto, setSetorAberto] = useState("");
  const [setorSelecionado, setSetorSelecionado] = useState("");

  // Quantidades individuais por tipo de ingresso
  const [ingressos, setIngressos] = useState({
    inteira: 0,
    meia: 0,
    idoso: 0,
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

  // Definição de setores disponíveis
  const setores = [
    { id: "camarote", nome: "Setor Camarote", preco: precoUnitario },
    { id: "pista", nome: "Setor Pista", preco: precoUnitario },
    { id: "cadeira", nome: "Setor Cadeira", preco: precoUnitario },
  ];

  // Definição de preços por tipo
  const precos = {
    inteira: precoUnitario,
    meia: precoUnitario * 0.5,
    idoso: precoUnitario * 0.5,
  };

  // Quantidade total acumulada
  const quantidadeTotal = ingressos.inteira + ingressos.meia + ingressos.idoso;

  // Cálculos Financeiros
  const subtotalBase =
    ingressos.inteira * precos.inteira +
    ingressos.meia * precos.meia +
    ingressos.idoso * precos.idoso;

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

  const totalDesconto = (ingressos.meia * (precos.inteira - precos.meia)) + (ingressos.idoso * (precos.inteira - precos.idoso));

  // Manipulação de Setores
  const handleSelecionarSetor = (setor) => {
    if (setorAberto !== setor.id) {
      // Ao mudar de setor, zera os ingressos para evitar compras cruzadas
      setIngressos({ inteira: 0, meia: 0, idoso: 0 });
      setSetorSelecionado(setor.nome);
      setSetorAberto(setor.id);
    } else {
      // Apenas recolhe a sanfona
      setSetorAberto("");
    }
  };

  // Manipulação de quantidade individual respeitando o limite máximo total
  const alterarQuantidade = (tipo, delta) => {
    setIngressos((prev) => {
      const atual = prev[tipo];
      const novaQtd = atual + delta;

      if (novaQtd < 0) return prev;
      if (delta > 0 && quantidadeTotal >= maximo) return prev;

      return { ...prev, [tipo]: novaQtd };
    });
  };

  const handleInputChange = (tipo, e) => {
    const valor = parseInt(e.target.value, 10);
    const valorValido = isNaN(valor) ? 0 : Math.max(0, valor);

    setIngressos((prev) => {
      const totalSemAtual = quantidadeTotal - prev[tipo];
      const permitida = Math.min(valorValido, maximo - totalSemAtual);
      return { ...prev, [tipo]: permitida };
    });
  };

  // Gerar a lista de portadores com base nos ingressos selecionados
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

    tipos.forEach(({ key, label }) => {
      for (let i = 0; i < ingressos[key]; i++) {
        novosPortadores.push({
          id: `${key}-${i}`,
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

    setDadosPortadores(novosPortadores);
    setPasso("verificacao");
  };

  // Atualizar dados de um portador específico
  const handlePortadorChange = (index, campo, valor) => {
    setDadosPortadores((prev) => {
      const atualizados = [...prev];
      atualizados[index] = { ...atualizados[index], [campo]: valor };
      return atualizados;
    });
  };

  // Validação da Veracidade dos Portadores
  const confirmarVerificacao = (e) => {
    e.preventDefault();

    for (let i = 0; i < dadosPortadores.length; i++) {
      const p = dadosPortadores[i];
      if (!p.nome || !p.cpf || !p.dataNascimento || !p.sexo) {
        alert(`Preencha todos os dados do Portador ${i + 1} (${p.tipoLabel})!`);
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

    alert(`Pedido finalizado com sucesso!\nSetor: ${setorSelecionado}\nTotal: R$ ${valorTotalFinal.toFixed(2)}`);
    router.push("/");
  };

  const formatarMoeda = (valor) => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // ----------------------------------------------------------------------
  // 1. TELA DE VERIFICAÇÃO DE PORTADORES
  // ----------------------------------------------------------------------
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
              <div key={portador.id} className="item-ingresso" style={{ flexDirection: "column", alignItems: "stretch", marginBottom: "20px" }}>
                <h2>Portador {index + 1} - {portador.tipoLabel}</h2>

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

        <div className="sidesright">
          <div className="card-resumo">
            <h3 className="text-resumo">Resumo</h3>
            <p className="resumo-text">Setor: {setorSelecionado}</p>
            <p className="resumo-text">Ingressos: {quantidadeTotal}</p>
            <p className="resumo-text">Subtotal: {formatarMoeda(subtotalBase)}</p>

            <h3 className="text-resumo">Sub-Total</h3>
            <p className="tax-text">Taxas: {formatarMoeda(totalTaxas)}</p>
            <p className="resumo-text">Total desconto: {formatarMoeda(totalDesconto)}</p>
            <p className="sub-text">Valor total: {formatarMoeda(valorSemJuros)}</p>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // 2. TELA DE SELEÇÃO DE PAGAMENTO
  // ----------------------------------------------------------------------
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
            onClick={() => setPasso("verificacao")}
          >
            Voltar
          </button>
        </div>

        <div className="sidesright">
          <div className="card-resumo">
            <h3 className="text-resumo">Resumo</h3>
            <p className="resumo-text">Setor: {setorSelecionado}</p>
            <p className="resumo-text">Ingressos: {quantidadeTotal}</p>
            <p className="resumo-text">Subtotal: {formatarMoeda(subtotalBase)}</p>

            <h3 className="text-resumo">Sub-Total</h3>
            <p className="tax-text">Taxas: {formatarMoeda(totalTaxas)}</p>
            <p className="resumo-text">Total desconto: {formatarMoeda(totalDesconto)}</p>
            <p className="sub-text">Valor total: {formatarMoeda(valorSemJuros)}</p>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // 3. TELA DE CHECKOUT (FORMULÁRIO)
  // ----------------------------------------------------------------------
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
                            {num}x de {formatarMoeda(valorParcela)}{" "}
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
                    onClick={() => setPasso("pagamento")}
                  >
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

        <div className="sidesright">
          <div className="card-resumo">
            <h3 className="text-resumo">Resumo</h3>
            <p className="resumo-text">Setor: {setorSelecionado}</p>
            <p className="resumo-text">Ingressos: {quantidadeTotal}</p>
            <p className="resumo-text">Subtotal: {formatarMoeda(subtotalBase)}</p>

            <h3 className="text-resumo">Sub-Total</h3>
            <p className="tax-text">Taxas de serviço: {formatarMoeda(totalTaxas)}</p>
            <p className="sub-text">Método: {metodoPagamento.toUpperCase()}</p>

            {metodoPagamento === "credito" && (
              <>
                <p className="resumo-text">
                  Parcelamento: {parcelas}x de {formatarMoeda(valorPorParcela)}
                </p>
                {taxaJurosAtual > 0 ? (
                  <p className="tax-text">
                    Juros: {(taxaJurosAtual * 100).toFixed(1)}% aplicado
                  </p>
                ) : (
                  <p className="tax-text">Sem juros</p>
                )}
              </>
            )}
            <p className="resumo-text">Total desconto: {formatarMoeda(totalDesconto)}</p>
            <p className="sub-text">
              Valor total: {formatarMoeda(valorTotalFinal)}
            </p>
            <br />
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // 4. TELA INICIAL (SETORES E INGRESSOS)
  // ----------------------------------------------------------------------
  const tiposIngresso = [
    { key: "inteira", label: "Ingresso Inteira", preco: precos.inteira },
    { key: "meia", label: "Ingresso Meia", preco: precos.meia },
    { key: "idoso", label: "Ingresso Idoso", preco: precos.idoso },
  ];

  return (
    <div className="container">
      <div className="sidesleft">
        <h1 className="title">Setores Disponíveis</h1>
        
        {setores.map((setor) => (
          <div key={setor.id}>
            <div className="item-ingresso">
              <div className="info-ingresso">
                <span className="nome-ingresso">{setor.nome}</span>
                <span className="preco-ingresso">{formatarMoeda(setor.preco)}</span>
              </div>
              <button
                type="button"
                className="btn-select"
                onClick={() => handleSelecionarSetor(setor)}
              >
                {setorAberto === setor.id ? "Ocultar" : "Selecionar"}
              </button>
            </div>

            {setorAberto === setor.id && (
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
                        onClick={() => alterarQuantidade(key, -1)}
                        className="btn-contador"
                        disabled={ingressos[key] === 0}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={ingressos[key]}
                        onChange={(e) => handleInputChange(key, e)}
                        className="input-numero"
                        min="0"
                        max={maximo}
                      />
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(key, 1)}
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
        ))}
      </div>

      <div className="sidesright">
        <div className="card-resumo">
          <h3 className="text-resumo">Resumo</h3>
          {setorSelecionado ? (
            <p className="resumo-text">Setor: {setorSelecionado}</p>
          ) : (
            <p className="resumo-text">Nenhum setor selecionado</p>
          )}
          <p className="resumo-text">Ingressos selecionados: {quantidadeTotal}</p>
          <p className="resumo-text">Preço: {formatarMoeda(subtotalBase)}</p>
          <h3 className="text-resumo">Sub-Total</h3>
          <p className="tax-text">Valor da taxa: {formatarMoeda(totalTaxas)}</p>
          <p className="resumo-text">Total desconto: {formatarMoeda(totalDesconto)}</p>
          <p className="sub-text">Valor total: {formatarMoeda(valorSemJuros)}</p>
          <br />
          <button 
            type="button" 
            className="btn-select" 
            onClick={irParaVerificacao}
            disabled={quantidadeTotal === 0}
            style={{ opacity: quantidadeTotal === 0 ? 0.5 : 1, cursor: quantidadeTotal === 0 ? 'not-allowed' : 'pointer' }}
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}