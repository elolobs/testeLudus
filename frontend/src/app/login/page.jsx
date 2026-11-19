"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import "./login.css";
import { apiRequest } from "@/lib/api.mjs";
import { salvarSessao } from "@/lib/sessao.mjs";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setEnviando(true);

    try {
      const resposta = await apiRequest("auth/login", {
        method: "POST",
        body: { email, senha },
      });
      salvarSessao(resposta.dados);
      window.dispatchEvent(new Event("ludus:sessao"));
      const destino = new URLSearchParams(window.location.search).get("redirect");
      router.push(
        destino?.startsWith("/") &&
          !destino.startsWith("//") &&
          !destino.startsWith("/\\")
          ? destino
          : "/",
      );
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container-login">
      <div className="leftSide">
        <div className="container-imagem-login">
          <img src="/img/fundocadastro.png" alt="Fundo Login" className="bg-img" />
          <div className="imgblur"></div>
          
          <div className="left-content">
            <div className="left-header">
              <Image 
                src="/img/logo.png" 
                alt="Logo Ludus" 
                width={80} 
                height={30} 
                style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
              />
              <Link href="/" className="voltar-link">
                Voltar ao início <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
            
            <div className="left-text">
              <span className="badge-text">UMA CONTA. TODOS OS MOMENTOS.</span>
              <h2>O seu próximo<br/><span className="text-purple">evento começa<br/>aqui.</span></h2>
              <p>Descubra experiências, guarde ingressos e entre sem filas com o seu QR Code.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rightSide">
        <div className="right-top-nav">
          <span className="nav-active">Entrar</span>
          <Link href="/cadastro" className="nav-inactive">Criar conta</Link>
        </div>

        <div className="right-content">
          <div className="form-header">
            <span className="bem-vindo">BEM-VINDO DE VOLTA</span>
            <h1 className="Title">Entre no seu ritmo.</h1>
            <p className="subtitle">Acesse aos seus eventos, ingressos e experiências.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">E-MAIL</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="nome@email.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="senha">SENHA</label>
              <input
                type="password"
                id="senha"
                name="senha"
                placeholder="Digite sua senha"
                autoComplete="current-password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-login" disabled={enviando}>
              {enviando ? "Entrando..." : "Fazer Login"} <i className="fa-solid fa-arrow-right"></i>
            </button>
            
            {errorMessage && <p className="error" role="alert">{errorMessage}</p>}
            
            <div className="form-footer">
              <p>Ainda não tem uma conta? <Link href="/cadastro">Criar conta gratuitamente</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}