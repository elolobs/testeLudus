"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
    <div className="container-cadastro">
      <div className="leftSide">
        <div className="container-imagem-cadastro">
          <img src="/img/fundocadastro.png" alt="Foto Cadastro" className="bg-img" />
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
          <Link href="/login" className="nav-inactive">Entrar</Link>
          <span className="nav-active">Criar conta</span>
        </div>

        <div className="right-content">
          <div className="form-header">
            <span className="bem-vindo">Bem-vindo ao EventFlow</span>
            <h1 className="Title">Crie sua conta.</h1>
            <p className="subtitle">Preencha com seus dados para criar seu cadastro.</p>
          </div>

          <form onSubmit={cadastrar}>
            <div className="input-group">
              <label htmlFor="nome">NOME COMPLETO</label>
              <input
                type="text"
                id="nome"
                name="nome_completo"
                placeholder="Seu nome"
                autoComplete="name"
                minLength={3}
                maxLength={120}
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="email">E-MAIL</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="nome@email.com"
                autoComplete="email"
                maxLength={150}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="cpf">CPF</label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                placeholder="Apenas números"
                inputMode="numeric"
                autoComplete="off"
                minLength={11}
                maxLength={14}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="telefone">TELEFONE (OPCIONAL)</label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                placeholder="Insira seu telefone"
                autoComplete="tel"
                maxLength={20}
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="senha">SENHA</label>
              <input
                type="password"
                id="senha"
                name="senha"
                placeholder="Insira uma senha segura"
                autoComplete="new-password"
                minLength={8}
                title="Use ao menos 8 caracteres, com maiúscula, minúscula, número e símbolo."
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  id="termo_lgpd_aceito"
                  name="termo_lgpd_aceito"
                  required
                />
                <span className="checkmark"></span>
                <span className="checkbox-text">Aceito o tratamento dos meus dados para criar a conta.</span>
              </label>
            </div>

            <button type="submit" className="btn-cadastro" disabled={enviando}>
              {enviando ? "Cadastrando..." : "Cadastrar"} <i className="fa-solid fa-arrow-right"></i>
            </button>
            
            {erro && <p className="error" role="alert">{erro}</p>}
            
            {mensagem && (
              <div className="success" role="status">
                <span>{mensagem}</span>
                <Link href="/login" className="success-link">Fazer login</Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}