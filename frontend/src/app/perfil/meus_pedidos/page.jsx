"use client";

import { apiRequest } from "@/lib/api.mjs";
import "./pedidos.css";
import { useState, useEffect } from "react";


export default function Pedidos() {

    const [pedidos, setPedidos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        Promise.all([
            apiRequest("eventos?limite=100"),
            apiRequest("categorias?limite=100"),
        ])
            .then(([respostaEventos, respostaCategorias]) => {
                if (!ativo) return;
                setPedidos(respostaEventos.dados);
            })
            .catch((erroApi) => {
                if (ativo) setErro(erroApi.message);
            })
            .finally(() => {
                if (ativo) setCarregando(false);
            });


        return () => {
            ativo = false;
        };
    }, []);

    const locais = Array.isArray(pedidos) ? [...new Set(pedidos.map((pedido) => pedido.local_nome).filter(Boolean))] : [];
    const categorias = Array.isArray(pedidos) ? [...new Set(pedidos.map((pedido) => pedido.categoria_nome).filter(Boolean))] : [];

    if (carregando) return <p>Carregando...</p>;
    if (erro) return <p>Erro: {erro}</p>;

    return (

        <>
            <h1 className="title">Meus pedidos</h1>
            <p className="subtitle">Consulte as suas compras e faça a gestão dos seus bilhetes</p>

            <div className="pedidos-container">
                <div className="pedidos-box">
                    <div className="container text-center">
                        <div className="row">
                            <div className="col">
                                <a href="./" target="_blank" rel="noopener noreferrer">
                                    <div className="card" style={{ width: "335px" }}>
                                        <img src="../../img/qrcode.png" className="card-img-top" alt="..." />
                                        <div className="card-body">
                                            <p className="card-text">
                                                Nome do Evento:
                                            </p>
                                            <p className="card-text">
                                                Data | Local
                                            </p>
                                            <p className="card-text">
                                                ID pedido e data de compra
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                            <div className="col">
                                <a href="#" target="_blank" rel="noopener noreferrer">
                                    <div className="card" style={{ width: "335px" }}>
                                        <img src="../../img/qrcode.png" className="card-img-top" alt="..." />
                                        <div className="card-body">
                                            <p className="card-text">
                                                Nome do Evento:
                                            </p>
                                            <p className="card-text">
                                                Data | Local
                                            </p>
                                            <p className="card-text">
                                                ID pedido e data de compra
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                            <div className="col">
                                <a href="#" target="_blank" rel="noopener noreferrer">
                                    <div className="card" style={{ width: "335px" }}>
                                        <img src="../../img/qrcode.png" className="card-img-top" alt="..." />
                                        <div className="card-body">
                                            <p className="card-text">
                                                Nome do Evento:
                                            </p>
                                            <p className="card-text">
                                                Data | Local
                                            </p>
                                            <p className="card-text">
                                                ID pedido e data de compra
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            </div>

                        </div>
                    </div>
                    <br />

                </div>
            </div>

        </>
    );
};