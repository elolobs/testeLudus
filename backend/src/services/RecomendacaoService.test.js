import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { pool } from "../config/database.js";
import { listarParaUsuario } from "./RecomendacaoService.js";

const originalQuery = pool.query;

afterEach(() => {
  pool.query = originalQuery;
});

test("recomenda eventos futuros de categorias compradas e exclui eventos já comprados", async () => {
  const recomendacoesEsperadas = [
    {
      id: 12,
      titulo: "Festival futuro",
      categoria_id: 3,
      categoria_nome: "Música",
      data_inicio: "2027-01-15T20:00:00.000Z",
      local_nome: "São Paulo",
      imagem_capa_url: null,
    },
  ];

  pool.query = async (sql, valores) => {
    assert.match(sql, /p\.status = 'pago'/);
    assert.match(sql, /e\.status = 'PUBLICADO'/);
    assert.match(sql, /e\.data_inicio >= CURRENT_TIMESTAMP/);
    assert.match(sql, /NOT EXISTS/);
    assert.deepEqual(valores, [42, 42]);
    return [recomendacoesEsperadas];
  };

  assert.deepEqual(await listarParaUsuario(42), recomendacoesEsperadas);
});
