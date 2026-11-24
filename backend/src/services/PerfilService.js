import * as UsuarioModel from "../models/UsuarioModel.js";
import bcrypt from "bcryptjs";

const LIMITES_CAMPOS = {
  nome_completo: 120,
  email: 150,
  cpf: 14,
  telefone: 20,
  nacionalidade: 80,
  sexo: 30,
  cep: 9,
  logradouro: 150,
  numero: 20,
  complemento: 100,
  bairro: 100,
  estado: 2,
  cidade: 100,
};

function erroPerfil(mensagem) {
  const erro = new Error(mensagem);
  erro.status = 422;
  return erro;
}

function normalizarTexto(valor, campo, limite) {
  if (typeof valor !== "string") {
    throw erroPerfil(`O campo ${campo} deve ser um texto.`);
  }
  const texto = valor.trim();
  if (texto.length > limite) {
    throw erroPerfil(`O campo ${campo} deve ter no máximo ${limite} caracteres.`);
  }
  return texto || null;
}

export function validarDadosPerfil(dados) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
    throw erroPerfil("Informe os dados do perfil.");
  }

  const perfil = {};
  for (const campo of ["nome_completo", "email", "cpf", "telefone"]) {
    if (!(campo in dados)) continue;
    perfil[campo] =
      typeof dados[campo] === "string"
        ? dados[campo].trim() || null
        : null;
  }
  if (perfil.nome_completo && perfil.nome_completo.length > LIMITES_CAMPOS.nome_completo) {
    throw erroPerfil("O nome completo deve ter no máximo 120 caracteres.");
  }
  if (perfil.email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.email) || perfil.email.length > 150)) {
    throw erroPerfil("Informe um e-mail válido.");
  }
  if (perfil.cpf) {
    const cpfNumeros = perfil.cpf.replace(/\D/g, "");
    if (!/^\d{11}$/.test(cpfNumeros)) throw erroPerfil("Informe um CPF válido.");
    perfil.cpf = cpfNumeros;
  }
  if (perfil.telefone && perfil.telefone.length > 20) {
    throw erroPerfil("O telefone deve ter no máximo 20 caracteres.");
  }
  for (const [campo, limite] of Object.entries(LIMITES_CAMPOS)) {
    if (["nome_completo", "email", "cpf", "telefone"].includes(campo)) continue;
    perfil[campo] = normalizarTexto(dados[campo], campo, limite);
  }

  if (perfil.cep && !/^\d{5}-?\d{3}$/.test(perfil.cep)) {
    throw erroPerfil("Informe um CEP válido.");
  }
  if (perfil.estado && !/^[A-Z]{2}$/.test(perfil.estado)) {
    throw erroPerfil("Informe a sigla de um estado válida.");
  }

  if (typeof dados.data_nascimento !== "string" && dados.data_nascimento !== null) {
    throw erroPerfil("Informe uma data de nascimento válida.");
  }
  const dataNascimento = dados.data_nascimento || null;
  if (
    dataNascimento &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento) ||
      Number.isNaN(Date.parse(`${dataNascimento}T00:00:00Z`)) ||
      new Date(`${dataNascimento}T00:00:00Z`).toISOString().slice(0, 10) !== dataNascimento)
  ) {
    throw erroPerfil("Informe uma data de nascimento válida.");
  }
  perfil.data_nascimento = dataNascimento;

  for (const campo of ["receber_sms_whatsapp", "receber_newsletter"]) {
    if (typeof dados[campo] !== "boolean") {
      throw erroPerfil(`O campo ${campo} deve ser verdadeiro ou falso.`);
    }
    perfil[campo] = dados[campo];
  }
  return perfil;
}

export async function buscarPerfil(usuarioId) {
  return UsuarioModel.buscarPerfilPorId(usuarioId);
}

export async function atualizarPerfil(usuarioId, dados) {
  return UsuarioModel.atualizarPerfil(usuarioId, validarDadosPerfil(dados));
}

export async function alterarSenha(usuarioId, dados) {
  if (!dados || typeof dados !== "object") throw erroPerfil("Informe os dados da senha.");
  if (typeof dados.senhaAtual !== "string" || typeof dados.novaSenha !== "string") {
    throw erroPerfil("Informe a senha atual e a nova senha.");
  }
  if (
    dados.novaSenha.length < 8 ||
    !/[a-z]/.test(dados.novaSenha) ||
    !/[A-Z]/.test(dados.novaSenha) ||
    !/\d/.test(dados.novaSenha) ||
    !/[^A-Za-z0-9]/.test(dados.novaSenha)
  ) {
    throw erroPerfil("A nova senha deve ter no mínimo 8 caracteres, contendo maiúscula, minúscula, número e símbolo.");
  }
  const senhaHash = await UsuarioModel.buscarSenhaHashPorId(usuarioId);
  if (!senhaHash || !(await bcrypt.compare(dados.senhaAtual, senhaHash))) {
    const erro = new Error("A senha atual está incorreta.");
    erro.status = 401;
    throw erro;
  }
  await UsuarioModel.atualizarSenha(usuarioId, await bcrypt.hash(dados.novaSenha, 10));
  return true;
}
