"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest, formatarData, formatarPreco } from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";
import "./pedidos.css";

const statusPedido = {
  pendente: { texto: "Pendente de pagamento", classe: "status-pendente" },
  pago: { texto: "Pago", classe: "status-pago" },
  cancelado: { texto: "Cancelado", classe: "status-cancelado" },
  reservado: { texto: "Reservado", classe: "status-reservado" },
  reembolsado: { texto: "Reembolsado", classe: "status-cancelado" },
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

  if (carregando) return <p className="estado-tela">Carregando pedidos...</p>;

  return (
    <div className="pedidos-wrapper">
      <h1 className="title-pedidos">Meus pedidos</h1>
      <p className="subtitle-pedidos">Acompanhe suas compras e o status de cada pedido.</p>

      {!sessao ? (
        <div className="pedidos-estado-vazio">
          <p>Entre na sua conta para consultar seus pedidos.</p>
          <Link href="/login" className="btn-pedidos-primario">Fazer login</Link>
        </div>
      ) : erro ? (
        <p className="erro-pedidos" role="alert">Erro: {erro}</p>
      ) : pedidos.length === 0 ? (
        <div className="pedidos-estado-vazio">
          <p>Você ainda não tem pedidos nos últimos 24 meses.</p>
          <Link href="/eventos" className="btn-pedidos-secundario">Explorar eventos</Link>
        </div>
      ) : (
        <div className="pedidos-mural">
          <div className="pedidos-lista">
            {pedidos.map((pedido) => (
              <Link
                href={`/perfil/meus_pedidos/${pedido.id}`}
                className="pedido-card"
                key={pedido.id}
              >
                <div className="pedido-card-header">
                  <h2>{pedido.evento_titulo || "Pedido de ingresso"}</h2>
                  <span className={`status-pedido ${statusPedido[pedido.status]?.classe || "status-padrao"}`}>
                    {statusPedido[pedido.status]?.texto || pedido.status}
                  </span>
                </div>
                
                <div className="pedido-card-body">
                  <div className="pedido-info-linha">
                    <strong>Evento:</strong>
                    <span>
                      {formatarData(pedido.data_inicio, { dateStyle: "long", timeStyle: "short" })}
                      {pedido.local_nome ? ` · ${pedido.local_nome}` : ""}
                    </span>
                  </div>
                  
                  <div className="pedido-info-linha">
                    <strong>Pedido:</strong>
                    <span>#{pedido.id} realizado em {formatarData(pedido.criado_em)}</span>
                  </div>
                </div>

                <div className="pedido-card-footer">
                  <span className="pedido-ingressos">
                    {pedido.itens.reduce((total, item) => total + Number(item.quantidade), 0)} ingresso(s)
                  </span>
                  <span className="pedido-valor">
                    {formatarPreco(pedido.valor_total)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}