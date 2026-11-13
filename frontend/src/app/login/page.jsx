"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      router.push("/");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <div className="container-login">
        <div className="leftSide">
          <div className="container-imagem-login">
            <img src="/img/fundocadastro.png" alt="Foto Cadastro" width={450} />
            <div className="imgblur">
              <div className="texto-sobreposto">
                <h3>Conecte-se às suas<br /> melhores experiências.</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="rightSide">
          <div className="subCad">
            <h4>Bem-Vindo de volta</h4>
            <p>
              Entra no teu ritmo.
              <br />
              Acede aos teus eventos, ingressos e experiências.
            </p>
          </div>
          <h1 className="Title">Seu Login</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder=" E-mail"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <br />
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              placeholder=" Senha"
              autoComplete="current-password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
            />
            <br />
            <button type="submit" disabled={enviando}>
              {enviando ? "Entrando..." : "Fazer Login"}
            </button>
            {errorMessage && <p className="error" role="alert">{errorMessage}</p>}
            <br/>
            <p>Ainda não tem conta? <Link href="/cadastro">Cadastre-se</Link></p>
          </form>
        </div>
      </div>
    </>
  );
}
