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
              Início
            </Link>
          </li>
          <li>
            <Link href="/eventos" className={pathname === "/eventos" ? "active" : ""}>
              Eventos
            </Link>
          </li>
          <li>
            <Link href="/sobre" className={pathname === "/sobre" ? "active" : ""}>
              Sobre Nós
            </Link>
          </li>
          <li>
            <Link href="/suporte" className={pathname === "/suporte" ? "active" : ""}>
              Suporte ao fã
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
                  <i className="fa-solid fa-user"></i>
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
                      <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    </button>
                  </div>

                  <div className="dropdown-body">
                    <span className="dropdown-section-title">ATIVIDADE</span>
                    <ul className="dropdown-links">

                   
                      {sessao.usuario.cargo === 'ADMIN' && (
                        <>
                          <li>
                            <Link href="/admin" onClick={() => setMenuAberto(false)}>
                              <i className="fa-solid fa-chart-line"></i>
                              Dashboard
                            </Link>
                          </li>
                          <li>
                            <Link href="/admin/suporte" onClick={() => setMenuAberto(false)}>
                              <i className="fa-solid fa-headset"></i>
                              Mensagens do suporte
                            </Link>
                          </li>
                        </>
                      )}

                   
                      {sessao.usuario.cargo === 'ORGANIZADOR' && (
                        <li>
                          <Link href="/organizador" onClick={() => setMenuAberto(false)}>
                            <i className="fa-solid fa-chart-line"></i>
                            Dashboard
                          </Link>
                        </li>
                      )}

                
                      {(!sessao.usuario.cargo || sessao.usuario.cargo === 'USER') && (
                        <li>
                          <Link href="/perfil/meus_pedidos" onClick={() => setMenuAberto(false)}>
                            <i className="fa-solid fa-box"></i>
                            Meus Pedidos
                          </Link>
                        </li>
                      )}

                      
                      <li>
                        <Link href="/perfil" onClick={() => setMenuAberto(false)}>
                          <i className="fa-solid fa-user"></i>
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