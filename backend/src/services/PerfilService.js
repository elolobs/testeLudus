import * as UsuarioModel from "../models/UsuarioModel.js";

const LIMITES_CAMPOS = {
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
  for (const [campo, limite] of Object.entries(LIMITES_CAMPOS)) {
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
