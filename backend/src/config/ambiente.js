import dotenv from "dotenv";

export function carregarAmbiente(caminho) {
  dotenv.config({ path: './.env' });
  return {
    porta: process.env.PORT || 8080,
  };
}