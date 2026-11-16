"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, formatarData, formatarPreco } from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";
import "./pedidos.css";

const statusPedido = {
  pendente: "Pendente de pagamento",
  pago: "Pago",
  cancelado: "Cancelado",
  reservado: "Reservado",
  reembolsado: "Reembolsado",
};

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarPedidos() {
      const sessaoAtual = obterSessao();
      if (!ativo) return;
      setSessao(sessaoAtual);
      setErro("");

      if (!sessaoAtual) {
        setPedidos([]);
        setCarregando(false);
        return;
      }

      setCarregando(true);
      try {
        const resposta = await apiRequest("pedidos", {
          token: sessaoAtual.token,
        });
        if (ativo) setPedidos(resposta.dados);
      } catch (erroApi) {
        if (ativo) setErro(erroApi.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarPedidos();
    window.addEventListener("ludus:sessao", carregarPedidos);
    return () => {
      ativo = false;
      window.removeEventListener("ludus:sessao", carregarPedidos);
    };
  }, []);

  if (carregando) return <p role="status">Carregando pedidos...</p>;

  return (
    <>
      <h1 className="title">Meus pedidos</h1>
      <p className="subtitle">Consulte suas compras e acompanhe seus pedidos.</p>

      {!sessao ? (
        <div className="pedidos-container">
          <p>Entre na sua conta para consultar seus pedidos.</p>
          <Link href="/login">Fazer login</Link>
        </div>
      ) : erro ? (
        <p className="erro-pedidos" role="alert">Erro: {erro}</p>
      ) : pedidos.length === 0 ? (
        <div className="pedidos-container">
          <p>Você ainda não tem pedidos.</p>
          <Link href="/eventos">Explorar eventos</Link>
        </div>
      ) : (
        <div className="pedidos-container">
          <div className="pedidos-lista">
            {pedidos.map((pedido) => (
              <Link
                href={`/perfil/meus_pedidos/${pedido.id}`}
                className="pedido-card"
                key={pedido.id}
              >
                <h2>{pedido.evento_titulo || "Pedido de ingresso"}</h2>
                <p>
                  {formatarData(pedido.data_inicio, { dateStyle: "long", timeStyle: "short" })}
                  {pedido.local_nome ? ` · ${pedido.local_nome}` : ""}
                </p>
                <p>Pedido #{pedido.id} · {formatarData(pedido.criado_em)}</p>
                <p>
                  {pedido.itens.reduce((total, item) => total + Number(item.quantidade), 0)}
                  {" ingresso(s) · "}
                  {formatarPreco(pedido.valor_total)}
                </p>
                <span className={`status-pedido status-${pedido.status}`}>
                  {statusPedido[pedido.status] || pedido.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
