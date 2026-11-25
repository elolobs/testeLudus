"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./suporte.css";
import { apiRequest } from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";

export default function Suporte() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState({ tipo: "", texto: "" });
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    const sessao = obterSessao();
    if (sessao?.usuario) {
      setLogado(true);
      setForm((prev) => ({
        ...prev,
        nome: sessao.usuario.nome || prev.nome,
        email: sessao.usuario.email || prev.email,
      }));
    }
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setFeedback({ tipo: "", texto: "" });

    const sessao = obterSessao();

    try {
      await apiRequest("suporte", {
        method: "POST",
        token: sessao?.token,
        body: form,
      });

      setFeedback({
        tipo: "sucesso",
        texto:
          "Solicitação enviada com sucesso! Nossa equipe responderá em breve.",
      });
      setForm((prev) => ({
        ...prev,
        telefone: "",
        mensagem: "",
      }));
    } catch (erro) {
      setFeedback({
        tipo: "erro",
        texto:
          erro.message || "Não foi possível enviar sua solicitação. Tente novamente.",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="suporte-container">
      <section className="suporte-hero">
        <div className="suporte-hero-kicker">CENTRO DE AJUDA</div>
        <h1>
          Como podemos
          <br />
          <span className="destaque-roxo">ajudar?</span>
        </h1>
        <p>
          Conte-nos sobre o problema que você está enfrentando. Nossa equipe de
          especialistas <br />
          está pronta para resolver qualquer questão na plataforma.
        </p>
      </section>

      <main className="suporte-content">
        <aside className="sidebar-info">
          <div className="info-card">
            <h3>Atendimento</h3>
            <div className="status-indicator">
              <span className="status-title">Rápido e Preciso</span>
              <span className="status-desc">
                Tempo Médio de Resposta: 45 min
              </span>
            </div>

            {logado && (
              <div style={{ marginTop: "1rem" }}>
                <Link href="/perfil/chamados" className="btn-submit" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
                  Minhas Solicitações
                </Link>
              </div>
            )}
          </div>

          <div className="info-card">
            <h3>Canais Diretos</h3>
            <div className="contact-list">
              <div className="contact-item">
                <i className="fa-brands fa-whatsapp"></i>
                <span>(11) 4002-8922</span>
              </div>
              <div className="contact-item">
                <i className="fa-regular fa-envelope"></i>
                <span>suporte@ldeventos.com</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="form-container">
          <div className="form-header-interno">
            <h2>Abrir Solicitação</h2>
          </div>

          <form className="support-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nome">Nome Completo</label>
                <div className="input-wrapper">
                  <i className="fa-regular fa-user icon"></i>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    placeholder="Seu nome"
                    value={form.nome}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">E-mail de Contato</label>
                <div className="input-wrapper">
                  <i className="fa-regular fa-envelope icon"></i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="nome@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Telefone / WhatsApp</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-phone icon"></i>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  placeholder="(11) 4002-8922"
                  value={form.telefone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="mensagem">Descrição Detalhada do Problema</label>
              <textarea
                id="mensagem"
                name="mensagem"
                placeholder="Descreva o que aconteceu, onde você clicou ou eventuais códigos de erro..."
                value={form.mensagem}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {feedback.texto && (
              <div
                className={`suporte-feedback ${
                  feedback.tipo === "sucesso"
                    ? "feedback-sucesso"
                    : "feedback-erro"
                }`}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  backgroundColor:
                    feedback.tipo === "sucesso" ? "#dcfce7" : "#fee2e2",
                  color: feedback.tipo === "sucesso" ? "#15803d" : "#b91c1c",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
              >
                {feedback.texto}{" "}
                {feedback.tipo === "sucesso" && logado && (
                  <Link
                    href="/perfil/chamados"
                    style={{ textDecoration: "underline", fontWeight: 700 }}
                  >
                    Acompanhar resposta →
                  </Link>
                )}
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar Solicitação"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}