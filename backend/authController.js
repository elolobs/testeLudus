import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "./db.js"; // Supondo que você tenha um arquivo de conexão com o banco de dados
import dotenv from "dotenv";

dotenv.config();

export async function login(req, res) {
  const { email, senha } = req.body;

  try {
    // Verificar se o usuário existe
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) {
      console.log("Usuário não encontrado:", email);
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const usuario = rows[0];

    // Comparar a senha fornecida com o hash armazenado
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      console.log("Senha inválida para o usuário:", email);
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    // Gerar token JWT
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Login bem-sucedido para o usuário:", email);
    res.json({ token });
  } catch (err) {
    console.error("Erro ao processar login:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}
