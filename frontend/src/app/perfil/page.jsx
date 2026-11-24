"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api.mjs";
import { obterSessao } from "@/lib/sessao.mjs";
import "./perfil.css";

const PERFIL_VAZIO = {
  nome_completo: "",
  email: "",
  cpf: "",
  telefone: "",
  nacionalidade: "",
  sexo: "",
  data_nascimento: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  estado: "",
  cidade: "",
  receber_sms_whatsapp: false,
  receber_newsletter: false,
};

function iniciais(nome) {
  return nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

function formatarCpf(cpf) {
  const numeros = String(cpf || "").replace(/\D/g, "");
  if (numeros.length !== 11) return cpf || "Não informado";
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatarDataNascimento(data) {
  if (!data) return "Não informado";
  const [ano, mes, dia] = String(data).slice(0, 10).split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : "Não informado";
}

function normalizarPerfil(dados) {
  const perfil = { ...PERFIL_VAZIO, ...dados };
  for (const campo of Object.keys(PERFIL_VAZIO)) {
    if (typeof PERFIL_VAZIO[campo] === "string") {
      perfil[campo] = perfil[campo] ?? "";
    }
  }
  perfil.receber_sms_whatsapp = Boolean(perfil.receber_sms_whatsapp);
  perfil.receber_newsletter = Boolean(perfil.receber_newsletter);
  return perfil;
}

export default function Perfil() {
  const [sessao, setSessao] = useState(null);
  const [perfil, setPerfil] = useState(PERFIL_VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      const sessaoAtual = obterSessao();
      if (!ativo) return;
      setSessao(sessaoAtual);
      setErro("");

      if (!sessaoAtual) {
        setPerfil(PERFIL_VAZIO);
        setCarregando(false);
        return;
      }

      setCarregando(true);
      try {
        const resposta = await apiRequest("perfil", {
          token: sessaoAtual.token,
        });
        if (ativo) {
          setPerfil(normalizarPerfil(resposta.dados));
        }
      } catch (erroApi) {
        if (ativo) setErro(erroApi.message);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarPerfil();
    window.addEventListener("ludus:sessao", carregarPerfil);
    return () => {
      ativo = false;
      window.removeEventListener("ludus:sessao", carregarPerfil);
    };
  }, []);

  function alterarCampo(event) {
    const { name, value, checked, type } = event.target;
    setPerfil((atual) => ({
      ...atual,
      [name]: type === "checkbox" ? checked : value,
    }));
    setMensagem("");
  }

  async function salvarPerfil(event) {
    event.preventDefault();
    if (!sessao) return;

    setErro("");
    setMensagem("");
    setSalvando(true);
    try {
      const resposta = await apiRequest("perfil", {
        method: "PUT",
        token: sessao.token,
        body: perfil,
      });
      setPerfil(normalizarPerfil(resposta.dados));
      setMensagem("Alterações salvas com sucesso.");
    } catch (erroApi) {
      setErro(erroApi.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p role="status">Carregando perfil...</p>;

  if (!sessao) {
    return (
      <div className="perfil-container">
        <p>Entre na sua conta para consultar e editar seu perfil.</p>
        <Link href="/login">Fazer login</Link>
      </div>
    );
  }

  const [nome, ...sobrenomes] = perfil.nome_completo.trim().split(/\s+/);

  return (
    <div className="perfil-container">
      {erro && <p role="alert">Erro: {erro}</p>}
      {mensagem && <p role="status">{mensagem}</p>}
      <div className="perfil-header-top">
        <div className="perfil-avatar">
          <span>{iniciais(perfil.nome_completo) || "?"}</span>
        </div>
        <div className="perfil-titulos">
          <h1>{perfil.nome_completo || "Perfil"}</h1>
          <p>{perfil.email}</p>
        </div>
      </div>

      <div className="perfil-card">
        <div className="card-header">
          <i className="fa-solid fa-lock card-icon"></i>
          <h2>Dados de acesso</h2>
        </div>
        <div className="card-list">
          <div className="list-item">
            <div className="item-content">
              <label>E-mail</label>
              <p>{perfil.email}</p>
            </div>
            <button className="btn-edit" type="button" aria-label="Editar e-mail">
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>

          <div className="list-item">
            <div className="item-content">
              <label>Senha</label>
              <p>••••••••</p>
            </div>
            <button className="btn-edit" type="button" aria-label="Editar senha">
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>

          <div className="list-item">
            <div className="item-content">
              <label>Celular</label>
              <p>{perfil.telefone || "Não informado"}</p>
              {perfil.telefone && (
                <span className="badge-validado">
                  <i className="fa-solid fa-circle-check"></i>
                  VALIDADO
                </span>
              )}
            </div>
            <button className="btn-edit" type="button" aria-label="Editar celular">
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="perfil-card">
        <div className="card-header">
          <i className="fa-solid fa-user card-icon"></i>
          <h2>Dados pessoais</h2>
        </div>
        <div className="card-grid-2">
          <div className="grid-field">
            <label>Nome</label>
            <p>{nome || "Não informado"}</p>
          </div>
          <div className="grid-field">
            <label>Sobrenome</label>
            <p>{sobrenomes.join(" ") || "Não informado"}</p>
          </div>
          <div className="grid-field">
            <label>Nacionalidade</label>
            <p>{perfil.nacionalidade || "Não informado"}</p>
          </div>
          <div className="grid-field">
            <label>Sexo</label>
            <p>{perfil.sexo || "Não informado"}</p>
          </div>
          <div className="grid-field">
            <label>CPF</label>
            <p>{formatarCpf(perfil.cpf)}</p>
          </div>
          <div className="grid-field">
            <label>Data de nascimento</label>
            <p>{formatarDataNascimento(perfil.data_nascimento)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={salvarPerfil}>
        <div className="perfil-card">
          <div className="card-header">
            <i className="fa-solid fa-location-dot card-icon"></i>
            <h2>Endereço</h2>
          </div>
          <div className="form-endereco">
            <div className="form-group full-width">
              <label htmlFor="cep">CEP</label>
              <input id="cep" name="cep" type="text" placeholder="00000-000" value={perfil.cep || ""} onChange={alterarCampo} />
            </div>

            <div className="form-group full-width">
              <label htmlFor="logradouro">Logradouro</label>
              <input id="logradouro" name="logradouro" type="text" placeholder="Rua, Avenida..." value={perfil.logradouro || ""} onChange={alterarCampo} />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="numero">Número</label>
                <input id="numero" name="numero" type="text" placeholder="123" value={perfil.numero || ""} onChange={alterarCampo} />
              </div>
              <div className="form-group">
                <label htmlFor="complemento">Complemento (opcional)</label>
                <input id="complemento" name="complemento" type="text" placeholder="Apto, Sala..." value={perfil.complemento || ""} onChange={alterarCampo} />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="bairro">Bairro</label>
              <input id="bairro" name="bairro" type="text" placeholder="Seu bairro" value={perfil.bairro || ""} onChange={alterarCampo} />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="estado">Estado</label>
                <select id="estado" name="estado" value={perfil.estado || ""} onChange={alterarCampo}>
                  <option value="">Selecione</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="cidade">Cidade</label>
                <input id="cidade" name="cidade" type="text" placeholder="Sua cidade" value={perfil.cidade || ""} onChange={alterarCampo} />
              </div>
            </div>
          </div>
        </div>

        <div className="perfil-card">
          <div className="card-header">
            <i className="fa-solid fa-bell card-icon"></i>
            <h2>Comunicação</h2>
          </div>

          <div className="toggle-list">
            <div className="toggle-item">
              <label htmlFor="receber_sms_whatsapp">Desejo receber SMS e WhatsApp com novidades</label>
              <label className="switch">
                <input id="receber_sms_whatsapp" name="receber_sms_whatsapp" type="checkbox" checked={Boolean(perfil.receber_sms_whatsapp)} onChange={alterarCampo} />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="toggle-item">
              <label htmlFor="receber_newsletter">Desejo receber newsletter</label>
              <label className="switch">
                <input id="receber_newsletter" name="receber_newsletter" type="checkbox" checked={Boolean(perfil.receber_newsletter)} onChange={alterarCampo} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="perfil-actions">
          <button className="btn-salvar" type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
