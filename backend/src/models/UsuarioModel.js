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
  senhaHash,
  cpf,
  telefone,
}) {
  const [resultado] = await pool.query(
    `INSERT INTO usuarios
      (nome_completo, email, senha_hash, cpf, telefone, cargo, ativo,
       termo_lgpd_aceito, termo_lgpd_data)
     VALUES (?, ?, ?, ?, ?, 'USUARIO', TRUE, TRUE, CURRENT_TIMESTAMP)`,
    [nome_completo, email, senhaHash, cpf, telefone],
  );

  const [linhas] = await pool.query(
    `SELECT ${COLUNAS_PUBLICAS} FROM usuarios WHERE id = ?`,
    [resultado.insertId],
  );
  return linhas[0];
}
