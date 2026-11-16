import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizarItensPedido } from "./PedidoService.js";

test("normaliza itens válidos de um pedido", () => {
  assert.deepEqual(
    normalizarItensPedido([
      { tipo_ingresso_id: 4, quantidade: 2, preco_unitario: 0 },
      { tipo_ingresso_id: 8, quantidade: 1 },
    ]),
    [
      { tipo_ingresso_id: 4, quantidade: 2 },
      { tipo_ingresso_id: 8, quantidade: 1 },
    ],
  );
});

test("rejeita pedido vazio, quantidades inválidas e tipos duplicados", () => {
  for (const itens of [
    [],
    [{ tipo_ingresso_id: 4, quantidade: 0 }],
    [
      { tipo_ingresso_id: 4, quantidade: 1 },
      { tipo_ingresso_id: 4, quantidade: 1 },
    ],
  ]) {
    assert.throws(() => normalizarItensPedido(itens), { status: 422 });
  }
});

test("limita cada pedido a cinco ingressos", () => {
  assert.throws(
    () => normalizarItensPedido([{ tipo_ingresso_id: 4, quantidade: 6 }]),
    { status: 422 },
  );
});
