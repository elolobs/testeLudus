"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest, formatarData, formatarPreco } from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";
import "./detalhepd.css";

const statusPedido = {
  pendente: { texto: "Pendente de pagamento", classe: "status-pendente" },
  pago: { texto: "Pago", classe: "status-pago" },
  cancelado: { texto: "Cancelado", classe: "status-cancelado" },
  reservado: { texto: "Reservado", classe: "status-reservado" },
  reembolsado: { texto: "Reembolsado", classe: "status-cancelado" },
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

  if (carregando) return <p className="estado-tela">Carregando detalhes do pedido...</p>;

  return (
    <div className="container-pedidosDetalhe">
      <h1 className="title-pedidosDetalhe">Detalhes do pedido</h1>
      <p className="subtitle-pedidosDetalhe">Consulte os itens e o status da sua compra.</p>

      <div className="pedidos-box-detalhe">
        <Link href="/perfil/meus_pedidos" className="voltar-pedidos">
          &larr; Voltar para meus pedidos
        </Link>

        {!sessao ? (
          <p className="mensagem-aviso">
            Entre na sua conta para consultar este pedido.{" "}
            <Link href={`/login?redirect=${encodeURIComponent(`/perfil/meus_pedidos/${id}`)}`}>
              Fazer login
            </Link>
          </p>
        ) : erro ? (
          <p role="alert" className="erro-pedidos">{erro}</p>
        ) : pedido ? (
          <>
            <div className="pedido-header-info">
              <h2>{pedido.evento_titulo || "Pedido de ingresso"}</h2>

              <div className={`pedido-status-badge ${statusPedido[pedido.status]?.classe || ""}`}>
                {statusPedido[pedido.status]?.texto || pedido.status}
              </div>

              <p className="pedido-meta"><strong>Pedido:</strong> #{pedido.id}</p>
              <p className="pedido-meta"><strong>Realizado em:</strong> {formatarData(pedido.criado_em)}</p>

              {pedido.data_inicio && (
                <p className="pedido-meta">
                  <strong>Evento:</strong> {formatarData(pedido.data_inicio, {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                  {pedido.local_nome ? ` · ${pedido.local_nome}` : ""}
                </p>
              )}
            </div>

            <div className="pedido-header-info">
              <img src="../../img/qringresso.png" alt="QR Ingresso" className="qr-code" />
              <p className="pedido-meta">
                Ingresso individual e intransferível. Apresente este código na portaria junto com um documento com foto. Inválido após a primeira leitura.
              </p>
            </div>

            <div className="secao-ingressos">
              <h3>Ingressos adquiridos</h3>
              <ul className="itens-pedido">
                {pedido.itens.map((item) => (
                  <li key={item.id}>
                    <div className="item-info">
                      <span className="item-nome">
                        {item.quantidade}x {item.tipo_ingresso_nome}
                      </span>
                      <span className="item-detalhes">
                        {item.categoria === "meia" ? "Meia-entrada" : "Inteira"}
                        {item.ingressos.length > 0 && (
                          <>
                            <br />
                            Cod: {item.ingressos.map(ing => `#${ing.id}`).join(", ")}
                          </>
                        )}
                      </span>
                    </div>
                    <span className="item-preco">
                      {formatarPreco(Number(item.preco_unitario) * Number(item.quantidade))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="total-pedido">
              <span>Total pago</span>
              <span>{formatarPreco(pedido.valor_total)}</span>
            </div>

            {pedido.status === "pendente" && (
              <div className="obs-pedidos">
                O pagamento ainda não está integrado. Este pedido não confirma
                uma cobrança nem emite ingresso até que o pagamento seja processado.
              </div>
            )}
          </>
        ) : (
          <p className="mensagem-aviso">Pedido não encontrado.</p>
        )}
      </div>
    </div>
  );
}