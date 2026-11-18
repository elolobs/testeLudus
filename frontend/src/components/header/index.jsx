"use client";

import { useEffect, useState, useRef } from "react";
import "./header.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { limparSessao, obterSessao } from "@/lib/sessao.mjs";

export default function Header() {
  const [sessao, setSessao] = useState(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const atualizarSessao = () => setSessao(obterSessao());
    window.addEventListener("ludus:sessao", atualizarSessao);
    const timer = window.setTimeout(atualizarSessao, 0);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("ludus:sessao", atualizarSessao);
    };
  }, []);

  useEffect(() => {
    function handleClickFora(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  function sair() {
    limparSessao();
    setSessao(null);
    setMenuAberto(false);
    window.dispatchEvent(new Event("ludus:sessao"));
  }

  const getIniciais = (nome) => {
    if (!nome) return "U";
    const partes = nome.split(" ");
    if (partes.length > 1) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return partes[0][0].toUpperCase();
  };

  return (
    <header className="header">
      <div className="logo">
        <Link href="/" aria-label="Ludus, início">
          <Image src="/img/logo.png" alt="Logo" width={120} height={45} style={{ objectFit: 'contain' }} />
        </Link>
      </div>

      <nav className="nav-links">
        <ul>
          <li>
            <Link href="/" className={pathname === "/" ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/eventos" className={pathname === "/eventos" ? "active" : ""}>
              Catálogo
            </Link>
          </li>
        </ul>
      </nav>



      <div className="action-area">
        <div className="auth-links">
          {sessao ? (
            <div className="user-menu-container" ref={menuRef}>
              <div
                className={`user-profile-pill ${menuAberto ? 'ativo' : ''}`}
                onClick={() => setMenuAberto(!menuAberto)}
              >
                <span className="greeting">
                  Olá,{" "}<strong>{sessao.usuario.nome_completo.split(' ')[0]}</strong>
                </span>
                <div className="profile-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>

              {menuAberto && (
                <div className="profile-dropdown">
                  <div className="dropdown-header-box">
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar">
                        {getIniciais(sessao.usuario.nome_completo)}
                      </div>
                      <div className="dropdown-text">
                        <span className="dropdown-name">{sessao.usuario.nome_completo}</span>
                        {sessao.usuario.email && (
                          <span className="dropdown-email">{sessao.usuario.email}</span>
                        )}
                      </div>
                    </div>
                    <button onClick={sair} className="logout-btn" title="Sair">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                    </button>
                  </div>

                  <div className="dropdown-body">
                    <span className="dropdown-section-title">ATIVIDADE</span>
                    <ul className="dropdown-links">
                      <li>
                        <Link href="/ingressos" onClick={() => setMenuAberto(false)}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
                            <path d="M7 7v10"></path>
                            <path d="M17 7v10"></path>
                          </svg>
                          Meus Ingressos
                        </Link>
                      </li>
                      <li>
                        <Link href="/pedidos" onClick={() => setMenuAberto(false)}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                          </svg>
                          Meus Pedidos
                        </Link>
                      </li>
                      <li>
                        <Link href="/perfil" onClick={() => setMenuAberto(false)}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          Minha Conta
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="auth-separator"></div>
              <Link href="/cadastro" className="link-secundario">Cadastrar</Link>
              <Link href="/login" className="btn-principal">Entrar</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}