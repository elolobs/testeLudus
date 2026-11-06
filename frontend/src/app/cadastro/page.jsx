"use client";

import { useState } from "react";
import Link from "next/link";
import "./cadastro.css";
import { apiRequest } from "@/lib/api.mjs";

export default function Cadastro() {
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cadastrar(event) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    setEnviando(true);

    const form = event.currentTarget;
    const dados = Object.fromEntries(new FormData(form).entries());

    try {
      await apiRequest("auth/registrar", {
        method: "POST",
        body: {
          nome_completo: dados.nome_completo,
          email: dados.email,
          senha: dados.senha,
          cpf: dados.cpf,
          telefone: dados.telefone || null,
          termo_lgpd_aceito: dados.termo_lgpd_aceito === "on",
        },
      });
      form.reset();
      setMensagem("Cadastro realizado com sucesso. Agora você já pode entrar.");
    } catch (erroApi) {
      setErro(erroApi.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="container">
      <div className="leftSide">
        <div className="container-imagem">
          <img src="/img/fundocadastro.png" alt="Foto Cadastro" />
          <div className="imgblur">
            <div className="texto-sobreposto">
              <h3>O seu próximo evento<br /> começa aqui.</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="rightSide">
        <div className="titleCad">
          <h4>Crie sua conta</h4>
          <p>
            Entra no teu ritmo.
            <br />
            Acede aos teus eventos, ingressos e experiências.
          </p>
        </div>
        <form onSubmit={cadastrar}>
          <label htmlFor="nome">Nome completo</label>
          <input
            type="text"
            id="nome"
            name="nome_completo"
            placeholder=" Nome"
            autoComplete="name"
            minLength={3}
            maxLength={120}
            required
          />
          <br />
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder=" E-mail"
            autoComplete="email"
            maxLength={150}
            required
          />
          <br />
          <label htmlFor="cpf">CPF</label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            placeholder=" CPF fictício com 11 números"
            inputMode="numeric"
            autoComplete="off"
            minLength={11}
            maxLength={14}
            required
          />
          <br />
          <label htmlFor="telefone">Telefone (opcional)</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            placeholder=" Telefone"
            autoComplete="tel"
            maxLength={20}
          />
          <br />
          <label htmlFor="senha">Senha</label>
          <input
            type="password"
            id="senha"
            name="senha"
            placeholder=" Senha"
            autoComplete="new-password"
            minLength={8}
            title="Use ao menos 8 caracteres, com maiúscula, minúscula, número e símbolo."
            required
          />
          <br />
          <label htmlFor="termo_lgpd_aceito">
            <input
              type="checkbox"
              id="termo_lgpd_aceito"
              name="termo_lgpd_aceito"
              required
              style={{ width: "auto", height: "auto", maxWidth: "none" }}
            />
            Aceito o tratamento dos meus dados para criar a conta.
          </label>
          <button type="submit" disabled={enviando}>
            {enviando ? "Cadastrando..." : "Cadastrar"}
          </button>
          {erro && <p role="alert">{erro}</p>}
          {mensagem && (
            <p role="status">
              {mensagem} <Link href="/login">Fazer login</Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
