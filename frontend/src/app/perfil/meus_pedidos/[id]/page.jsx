"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, formatarData, formatarPreco } from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";
import "./detalhepd.css";

const statusPedido = {
  pendente: "Pendente de pagamento",
  pago: "Pago",
  cancelado: "Cancelado",
  reservado: "Reservado",
  reembolsado: "Reembolsado",
};

export default function InfoPedidos() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarPedido() {
      const sessaoAtual = obterSessao();
      if (!ativo) return;
      setSessao(sessaoAtual);
      if (!sessaoAtual) {
        setCarregando(false);
        return;
      }

      try {
        const resposta = await apiRequest(`pedidos/${id}`, {
          token: sessaoAtual.token,
        });
        if (ativo) setPedido(resposta.dados);
      } catch (erroApi) {
        if (ativo) setErro(erroApi.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarPedido();
    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando) return <p role="status">Carregando pedido...</p>;

  return (
    <>
      <h1 className="title-pedidosDetalhe">Detalhes do pedido</h1>
      <p className="subtitle-pedidosDetalhe">Consulte os itens e o status da compra.</p>

      <div className="container-pedidosDetalhe">
        <div className="pedidos-box-detalhe">
          <Link href="/perfil/meus_pedidos" className="voltar-pedidos">
            ← Voltar para meus pedidos
          </Link>

          {!sessao ? (
            <p>
              Entre na sua conta para consultar este pedido.{" "}
              <Link href={`/login?redirect=${encodeURIComponent(`/perfil/meus_pedidos/${id}`)}`}>
                Fazer login
              </Link>
            </p>
          ) : erro ? (
            <p role="alert" className="erro-pedidos">{erro}</p>
          ) : pedido ? (
            <>
              <h2>{pedido.evento_titulo || "Pedido de ingresso"}</h2>
              <p>Pedido #{pedido.id}</p>
              <p>Realizado em {formatarData(pedido.criado_em)}</p>
              <p>
                Status: {statusPedido[pedido.status] || pedido.status}
              </p>
              {pedido.data_inicio && (
                <p>
                  Evento: {formatarData(pedido.data_inicio, {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                  {pedido.local_nome ? ` · ${pedido.local_nome}` : ""}
                </p>
              )}

              <h3>Ingressos</h3>
              <ul className="itens-pedido">
                {pedido.itens.map((item) => (
                  <li key={item.id}>
                    <span>
                      {item.tipo_ingresso_nome} ·
                      {" "}{item.categoria === "meia" ? "Meia-entrada" : "Inteira"} ·
                      {" "}{item.quantidade}x
                      {item.ingressos.length > 0 && (
                        <small>
                          {" "}({item.ingressos.map((ingresso) =>
                            `Ingresso #${ingresso.id} — ${ingresso.status}`,
                          ).join(", ")})
                        </small>
                      )}
                    </span>
                    <span>
                      {formatarPreco(Number(item.preco_unitario) * Number(item.quantidade))}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="total-pedido">
                Total: {formatarPreco(pedido.valor_total)}
              </p>
              {pedido.status === "pendente" && (
                <p className="obs-pedidos">
                  O pagamento ainda não está integrado. Este pedido não confirma
                  uma cobrança nem emite ingresso.
                </p>
              )}
            </>
          ) : (
            <p>Pedido não encontrado.</p>
          )}
        </div>
      </div>
    </>
  );
}
