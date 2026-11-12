"use client";

import { apiRequest } from "@/lib/api.mjs";
import "./pedidos.css";
import { useState, useEffect } from "react";


export default function InfoPedidos() {
    return (
        <>
            <h1>
                <h1 className="title">Meus pedidos</h1>
                <p className="subtitle">Consulte as suas compras e faça a gestão dos seus bilhetes</p>
            </h1>
        </>
    );
};