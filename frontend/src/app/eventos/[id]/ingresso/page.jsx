"use client";

import { useState } from "react";
import "./ingresso.css";
import { useRouter } from 'next/navigation';

export default function ContadorIngresso({
  maximo = 5
}) {
  const router = useRouter();

  // Controle de Tela: 'ingressos' | 'pagamento' | 'checkout'
  const [passo, setPasso] = useState("ingressos");

  // Ingressos
  const [quantidade, setQuantidade] = useState(0);
  const [mostrarTipos, setMostrarTipos] = useState(false);

  // Pagamento Selecionado
  const [metodoPagamento, setMetodoPagamento] = useState("");

  // Dados do Formulário
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [numeroCartao, setNumeroCartao] = useState("");
  const [cvv, setCvv] = useState("");
  const [validade, setValidade] = useState("");

  // Manipulação de quantidade
  const decrementar = () => {
    setQuantidade((qtdAtual) => Math.max(0, qtdAtual - 1));
  };

  const incrementar = () => {
    setQuantidade((qtdAtual) => Math.min(maximo, qtdAtual + 1));
  };

  const handleInputChange = (e) => {
    const valor = parseInt(e.target.value, 10);
    if (isNaN(valor)) {
      setQuantidade(0);
    } else {
      setQuantidade(Math.max(0, Math.min(maximo, valor)));
    }
  };

  // Navegação e Ações
  const irParaPagamento = () => {
    if (quantidade === 0) {
      alert("Selecione ao menos um Ingresso!");
      return;
    }
    setPasso("pagamento");
  };

  const selecionarMetodo = (metodo) => {
    setMetodoPagamento(metodo);
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

    alert("Pedido finalizado com sucesso!");
    router.push("/");
  };

  // 1. TELA DE SELEÇÃO DE PAGAMENTO
  if (passo === "pagamento") {
    return (
      <div className="container">
        <div className="sidesleft">
          <h1 className="title">Pagamentos Disponíveis</h1>

          {/* PIX */}
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

          {/* CRÉDITO */}
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

          {/* DÉBITO */}
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
            onClick={() => setPasso("ingressos")}
          >
            Voltar
          </button>
        </div>

        <div className="sidesright">
          <div className="card-resumo">
            <h3 className="text-resumo">Resumo</h3>
            <p className="resumo-text">Ingressos selecionados: {quantidade}</p>
            <p className="resumo-text">Tipo de ingresso: Meia/Inteira/Idoso...</p>
            <p className="resumo-text">Preço R$ Valor sem taxa</p>

            <h3 className="text-resumo">Sub-Total</h3>
            <p className="tax-text">Valor da taxa R$ Taxa</p>
            <p className="sub-text">Valor total: R$ Valor Total + Taxa</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. TELA DE CHECKOUT (FORMULÁRIO)
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
                  <label htmlFor="nome">Nome Completo:</label>
                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>

                <div className="campo-form">
                  <label htmlFor="cpf">CPF:</label>
                  <input
                    id="cpf"
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>

                {precisaDadosCartao && (
                  <>
                    <div className="campo-form">
                      <label htmlFor="cartao">Número do Cartão:</label>
                      <input
                        id="cartao"
                        type="text"
                        value={numeroCartao}
                        onChange={(e) => setNumeroCartao(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        required
                      />
                    </div>

                    <div className="campo-form">
                      <label htmlFor="validade">Validade:</label>
                      <input
                        id="validade"
                        type="text"
                        value={validade}
                        onChange={(e) => setValidade(e.target.value)}
                        placeholder="MM/AA"
                        required
                      />
                    </div>

                    <div className="campo-form">
                      <label htmlFor="cvv">CVV:</label>
                      <input
                        id="cvv"
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        required
                      />
                    </div>
                  </>
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
                  <button type="submit" className="btn-select">
                    {metodoPagamento === "pix" ? "Gerar PIX" : "Pagar Agora"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="sidesright">
          <div className="card-resumo">
            <h3 className="text-resumo">Resumo</h3>
            <p className="resumo-text">Ingressos selecionados: {quantidade}</p>
            <p className="resumo-text">Tipo de ingresso: Meia/Inteira/Idoso...</p>
            <p className="resumo-text">Preço R$ Valor sem taxa</p>

            <h3 className="text-resumo">Sub-Total</h3>
            <p className="tax-text">Valor da taxa R$ Taxa</p>
            <p className="sub-text">Valor total: R$ Valor Total + Taxa</p>
            <br />
          </div>
        </div>
      </div>
    );
  }

  // 3. TELA INICIAL (SETORES E INGRESSOS)
  return (
    <div className="container">
      <div className="sidesleft">
        <h1 className="title">Setores Disponíveis</h1>
        <div className="item-ingresso">
          <div className="info-ingresso">
            <span className="nome-ingresso">Nome do Setor </span>
            <span className="preco-ingresso">Preço</span>
          </div>
          <button
            type="button"
            className="btn-select"
            onClick={() => setMostrarTipos((prev) => !prev)}
          >
            {mostrarTipos ? "Ocultar" : "Selecionar"}
          </button>
        </div>

        {mostrarTipos && (
          <div>
            <div className="item-ingresso">
              <div className="info-ingresso">
                <span className="nome-ingresso">Tipo de Ingresso </span>
                <span className="preco-ingresso">Preço</span>
              </div>
              <div className="contador-container">
                <button
                  type="button"
                  onClick={decrementar}
                  className="btn-contador"
                  disabled={quantidade === 0}
                >
                  −
                </button>

                <input
                  type="number"
                  value={quantidade}
                  onChange={handleInputChange}
                  className="input-numero"
                  min="0"
                  max={maximo}
                />

                <button
                  type="button"
                  onClick={incrementar}
                  className="btn-contador"
                  disabled={quantidade === maximo}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="sidesright">
        <div className="card-resumo">
          <h3 className="text-resumo">Resumo</h3>
          <p className="resumo-text">Ingressos selecionados: {quantidade}</p>
          <p className="resumo-text">Tipo de ingresso: Meia/Inteira/Idoso...</p>
          <p className="resumo-text">Preço R$ Valor sem taxa</p>

          <h3 className="text-resumo">Sub-Total</h3>
          <p className="tax-text">Valor da taxa R$ Taxa</p>
          <p className="sub-text">Valor total: R$ Valor Total + Taxa</p>
          <br />
          <button type="button" className="btn-select" onClick={irParaPagamento}>
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}