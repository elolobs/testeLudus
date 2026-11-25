import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { pool } from "../config/database.js";
import { obterDashboard } from "./AdminController.js";

const originalQuery = pool.query;

afterEach(() => {
  pool.query = originalQuery;
});

test("retorna métricas e todos os eventos no formato do dashboard", async () => {
  const eventos = Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    titulo: `Evento ${index + 1}`,
    status: "PUBLICADO",
    organizador: "Organizador",
    criado_em: "2026-11-24T12:00:00.000Z",
  }));

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
      assert.doesNotMatch(sql, /LIMIT\s+5/i);
      return [eventos];
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
  assert.equal(resultado.eventosRecentes.length, 6);
  assert.equal(resultado.eventosRecentes[5].id, 6);
});
