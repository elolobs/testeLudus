"use client";

import { useState } from "react";
import "./ingresso.css";

export default function ContadorIngresso({
  maximo = 5
  // O maximo quem define é o cara que realiza o evento ou pode ser pré-definido já
}) {
  const [quantidade, setQuantidade] = useState(0);
  const [mostrarTipos, setMostrarTipos] = useState(false);

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

  const toggleMostrarTipos = () => {
    setMostrarTipos((prev) => !prev);
  };

  return (
    <div className="container">
      <div className="sidesleft">
        <h1 className="title">Setores Disponiveis</h1>
        <div className="item-ingresso">
          <div className="info-ingresso">
            <span className="nome-ingresso">Nome do Setor </span>
            <span className="preco-ingresso">
              Preço
            </span>
          </div>
          <button
            type="button"
            className="btn-select"
            onClick={toggleMostrarTipos}
          >
            {mostrarTipos ? "Ocultar" : "Selecionar"}
          </button>
        </div>

        {mostrarTipos && (
          <div>
            <div className="item-ingresso">
              <div className="info-ingresso">
                <span className="nome-ingresso">Tipo de Ingresso </span>
                <span className="preco-ingresso">
                  Preço
                </span>
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



        {/* Direita --- Resumo */}

      </div>
      <div className="sidesright">
        <div className="card-resumo">
          <h3 className="text-resumo">Resumo</h3>
          <p className="resumo-text">
            Ingresos selecionados: {quantidade}
          </p>
          <p className="resumo-text">
            Tipo de ingresso: {"Meia/Inteira/Idoso..."}
          </p>
          <p className="resumo-text">
            Preço R$ {"Valor sem taxa"}
          </p>

          <h3 className="text-resumo">Sub-Total</h3>
          <p className="tax-text">
            Valor da taxa R$ {"Taxa"}
          </p>
          <p className="sub-text">
            Valor total: R$ {"Valor Total + Taxa"}
          </p>
          <br />
          <button type="submit" className="btn-select">
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}

// contador

// <div className="contador-container">
//   <button
//     type="button"
//     onClick={decrementar}
//     className="btn-contador"
//     disabled={quantidade === 0}
//   >
//     −
//   </button>

//   <input
//     type="number"
//     value={quantidade}
//     onChange={handleInputChange}
//     className="input-numero"
//     min="0"
//     max={maximo}
//   />

//   <button
//     type="button"
//     onClick={incrementar}
//     className="btn-contador"
//     disabled={quantidade === maximo}
//   >
//     +
//   </button>
// </div>