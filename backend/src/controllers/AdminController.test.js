import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { pool } from "../config/database.js";
import { obterDashboard } from "./AdminController.js";

const originalQuery = pool.query;

afterEach(() => {
  pool.query = originalQuery;
});

test("retorna métricas e eventos recentes no formato do dashboard", async () => {
  pool.query = async (sql) => {
    if (sql.includes("AS totalUsuarios")) {
      return [[{
        totalUsuarios: 8,
        eventosPublicados: 3,
        receitaTotal: "125.50",
        ingressosVendidos: 4,
      }]];
    }

    if (sql.includes("FROM eventos e")) {
      return [[{
        id: 12,
        titulo: "Evento de teste",
        status: "PUBLICADO",
        organizador: "Organizador",
        criado_em: "2026-11-24T12:00:00.000Z",
      }]];
    }

    throw new Error("Consulta inesperada.");
  };

  let resultado;
  let erroEncaminhado;
  await obterDashboard(
    {},
    { json: (dados) => (resultado = dados) },
    (erro) => (erroEncaminhado = erro),
  );

  assert.equal(erroEncaminhado, undefined);
  assert.equal(resultado.metricas.ingressosVendidos, 4);
  assert.equal(resultado.eventosRecentes[0].id, 12);
});
