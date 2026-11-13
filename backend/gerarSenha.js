import bcrypt from "bcryptjs";

async function gerarHash() {
  const hash = await bcrypt.hash("12345678A*", 10);
  console.log("Copie o hash abaixo e cole no banco de dados na coluna senha_hash:");
  console.log(hash); 
}
gerarHash();

// Use esse arquivo para mudar as senhas não criptografadas do banco de dados
// para JWT, para isso, rode o comando: node backend/gerarSenha.js
// vai retornar o HASH, copie o hash e cole no banco de dados na coluna senha_hash do usuário que deseja alterar a senha.