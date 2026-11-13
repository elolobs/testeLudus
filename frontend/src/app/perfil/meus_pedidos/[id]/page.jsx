"use client";

import { apiRequest } from "@/lib/api.mjs";
import "./detalhepd.css";
import { useState, useEffect } from "react";


export default function InfoPedidos() {


    return (
        <>
            <h1 className="title-pedidosDetalhe">Meus pedidos</h1>
            <p className="subtitle-pedidosDetalhe">Consulte as suas compras e faça a gestão dos seus bilhetes</p>

            <div className="container-pedidosDetalhe">
                <div className="pedidos-box-detalhe">
                    <a href="./." className="btn">
                        <i class="fa-solid fa-chevron-left"></i>VOLTAR
                    </a>

                    <h3>
                        NOME DO EVENTO
                    </h3>

                    <img src="../../img/qrcode.png" alt="QRCODE Ingresso" className="qrcode-pedido" />

                    <p className="obs-pedidos">
                        Válido apenas para o dia do evento. Apresente este QR Code na entrada (uso único e individual).
                    </p>

                    <hr />


                

                </div>
            </div>
        </>
    );
};