import dotenv from "dotenv";

export function carregarAmbiente(caminho) {
  dotenv.config({ path: caminho });
  return {
    porta: process.env.PORT || 8080,
  };
}