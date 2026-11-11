import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as UsuarioModel from "../models/UsuarioModel.js";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarCpf(valor) {
  const cpf = typeof valor === "string" ? valor.replace(/\D/g, "") : "";
  return /^\d{11}$/.test(cpf) ? cpf : null;
}

function obterJwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET deve estar configurado com pelo menos 32 caracteres.");
  }
  return process.env.JWT_SECRET;
}

function erroCredenciais() {
  const erro = new Error("Credenciais inválidas.");
  erro.status = 401;
  return erro;
}

export async function registrar({
  nome_completo,
  email,
  senha,
  cpf: cpfInformado,
  telefone,
  termo_lgpd_aceito,
} = {}) {
  const nomeLimpo =
    typeof nome_completo === "string" ? nome_completo.trim() : "";
  const emailLimpo =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const cpf = validarCpf(cpfInformado);
  const telefoneLimpo =
    typeof telefone === "string" && telefone.trim()
      ? telefone.trim()
      : null;

  if (nomeLimpo.length < 3 || nomeLimpo.length > 120) {
    throw new TypeError("Nome completo deve ter entre 3 e 120 caracteres.");
  }
  if (!REGEX_EMAIL.test(emailLimpo) || emailLimpo.length > 150) {
    throw new TypeError("Informe um e-mail válido");
  }
  if (!cpf) {
    throw new TypeError("Informe o seu CPF.");
  }
  if (telefoneLimpo && telefoneLimpo.length > 20) {
    throw new TypeError("Telefone deve ter no máximo 20 caracteres.");
  }
  if (termo_lgpd_aceito !== true) {
    throw new TypeError("É necessário aceitar o termo LGPD para se cadastrar.");
  }
  if (
    typeof senha !== "string" ||
    senha.length < 8 ||
    !/[a-z]/.test(senha) ||
    !/[A-Z]/.test(senha) ||
    !/\d/.test(senha) ||
    !/[^A-Za-z0-9]/.test(senha)
  ) {
    throw new TypeError(
      "A senha deve ter no mínimo 8 caracteres, contendo maiúscula, minúscula, número e símbolo.",
    );
  }

  if (
    (await UsuarioModel.buscarPorEmail(emailLimpo)) ||
    (await UsuarioModel.buscarPorCpf(cpf))
  ) {
    const erro = new Error("E-mail ou CPF já cadastrado.");
    erro.status = 409;
    throw erro;
  }

  try {
    return await UsuarioModel.criar({
      nome_completo: nomeLimpo,
      email: emailLimpo,
      senhaHash: await bcrypt.hash(senha, 10),
      cpf,
      telefone: telefoneLimpo,
    });
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      erro.status = 409;
      erro.message = "E-mail ou CPF já cadastrado.";
    }
    throw erro;
  }
}

export async function login({ email, senha } = {}) {
  const emailLimpo =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const usuario = REGEX_EMAIL.test(emailLimpo)
    ? await UsuarioModel.buscarPorEmail(emailLimpo)
    : null;
  const senhaValida =
    usuario && usuario.ativo && typeof senha === "string"
      ? await bcrypt.compare(senha, usuario.senha_hash)
      : false;

  if (!usuario || !senhaValida) {
    throw erroCredenciais();
  }

  const token = jwt.sign(
    { cargo: usuario.cargo },
    obterJwtSecret(),
    { subject: String(usuario.id), expiresIn: "2h" },
  );

  return {
    token,
    tipo: "Bearer",
    expiraEm: "2h",
    usuario: {
      id: usuario.id,
      nome_completo: usuario.nome_completo,
      email: usuario.email,
      cargo: usuario.cargo,
    },
  };
}
