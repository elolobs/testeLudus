import { pool } from "../config/database.js";

const COLUNAS_PUBLICAS = `
  id, nome_completo, email, cpf, telefone, cargo, ativo,
  termo_lgpd_aceito, termo_lgpd_data, criado_em, atualizado_em
`;

export async function buscarPorEmail(email) {
  const [linhas] = await pool.query(
    `SELECT ${COLUNAS_PUBLICAS}, senha_hash FROM usuarios WHERE email = ? LIMIT 1`,
    [email],
  );
  return linhas[0] || null;
}

export async function buscarPorCpf(cpf) {
  const [linhas] = await pool.query(
    "SELECT id FROM usuarios WHERE cpf = ? LIMIT 1",
    [cpf],
  );
  return linhas[0] || null;
}

export async function criar({
  nome_completo,
  email,
  senha_hash,
  cpf,
  telefone,
}) {
  const [resultado] = await pool.query(
    `INSERT INTO usuarios
      (nome_completo, email, senha_hash, cpf, telefone, cargo, ativo,
       termo_lgpd_aceito, termo_lgpd_data)
     VALUES (?, ?, ?, ?, ?, 'USUARIO', TRUE, TRUE, CURRENT_TIMESTAMP)`,
    [nome_completo, email, senha_hash, cpf, telefone],
  );

  const [linhas] = await pool.query(
    `SELECT ${COLUNAS_PUBLICAS} FROM usuarios WHERE id = ?`,
    [resultado.insertId],
  );
  return linhas[0];
}

export async function buscarPerfilPorId(id) {
  const [linhas] = await pool.query(
    `SELECT id, nome_completo, email, cpf, telefone, nacionalidade, sexo,
            DATE_FORMAT(data_nascimento, '%Y-%m-%d') AS data_nascimento,
            cep, logradouro, numero, complemento, bairro, estado, cidade,
            receber_sms_whatsapp, receber_newsletter
     FROM usuarios
     WHERE id = ?
     LIMIT 1`,
    [id],
  );
  return linhas[0] || null;
}

export async function atualizarPerfil(id, perfil) {
  await pool.query(
    `UPDATE usuarios
     SET nome_completo = ?, email = ?, cpf = ?, telefone = ?,
         nacionalidade = ?, sexo = ?, data_nascimento = ?, cep = ?,
         logradouro = ?, numero = ?, complemento = ?, bairro = ?, estado = ?,
         cidade = ?, receber_sms_whatsapp = ?, receber_newsletter = ?
     WHERE id = ?`,
    [
      perfil.nome_completo,
      perfil.email,
      perfil.cpf,
      perfil.telefone,
      perfil.nacionalidade,
      perfil.sexo,
      perfil.data_nascimento,
      perfil.cep,
      perfil.logradouro,
      perfil.numero,
      perfil.complemento,
      perfil.bairro,
      perfil.estado,
      perfil.cidade,
      perfil.receber_sms_whatsapp,
      perfil.receber_newsletter,
      id,
    ],
  );
  return buscarPerfilPorId(id);
}

export async function buscarSenhaHashPorId(id) {
  const [linhas] = await pool.query(
    "SELECT senha_hash FROM usuarios WHERE id = ? LIMIT 1",
    [id],
  );
  return linhas[0]?.senha_hash || null;
}

export async function atualizarSenha(id, senhaHash) {
  await pool.query(
    "UPDATE usuarios SET senha_hash = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?",
    [senhaHash, id],
  );
}
