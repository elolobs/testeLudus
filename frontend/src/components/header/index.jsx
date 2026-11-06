"use client";

import { useEffect, useState } from "react";
import "./header.css"
import Image from "next/image";
import Link from "next/link";
import { limparSessao, obterSessao } from "@/lib/sessao.mjs";

export default function Header() {
    const [sessao, setSessao] = useState(null);

    useEffect(() => {
        const atualizarSessao = () => setSessao(obterSessao());
        window.addEventListener("ludus:sessao", atualizarSessao);
        const timer = window.setTimeout(atualizarSessao, 0);

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("ludus:sessao", atualizarSessao);
        };
    }, []);

    function sair() {
        limparSessao();
        setSessao(null);
        window.dispatchEvent(new Event("ludus:sessao"));
    }

    return (
        <>
            <div className="header">
            <div className="logo">
              <Link href="/" aria-label="Ludus, início">
                <Image src="/img/logo.png" alt="Logo" width={150} height={90} />
              </Link>
            </div>
            <div className="links">
              <ul className="menu">
                <li><Link href="/"><i className="fa-solid fa-house icone-menu"></i>Home</Link></li>
                <li><Link href="/eventos"><i className="fa-solid fa-images icone-menu"></i>Catálogo</Link></li>
                {sessao ? (
                  <>
                    <li><span>{sessao.usuario.nome_completo}</span></li>
                    <li><button type="button" onClick={sair}>Sair</button></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/login"><i className="fa-solid fa-images icone-menu"></i>Entrar</Link></li>
                    <li><Link href="/cadastro"><i className="fa-solid fa-images icone-menu"></i>Cadastrar</Link></li>
                  </>
                )}
              </ul>
            </div>
           </div>
        </>
    )
}