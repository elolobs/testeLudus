import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const diretorioConfig = dirname(fileURLToPath(import.meta.url));

export function carregarAmbiente(caminho = resolve(diretorioConfig, "../../.env")) {
  dotenv.config({ path: caminho });

  const porta = Number(process.env.PORT || 8080);
  if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
    throw new TypeError("PORT deve ser um número entre 1 e 65535.");
  }

  return { porta };
}
