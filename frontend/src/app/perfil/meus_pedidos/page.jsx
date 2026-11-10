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
    <h1>Meus pedidos</h1>
    <h4>Consulte as suas compras e faça a gestão dos seus bilhetes</h4>


    </>
    );
};