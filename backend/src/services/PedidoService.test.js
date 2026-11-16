import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calcularPrecoCentavos,
  normalizarItensPedido,
} from "./PedidoService.js";

test("normaliza itens válidos de um pedido", () => {
  assert.deepEqual(
    normalizarItensPedido([
      { tipo_ingresso_id: 4, quantidade: 2, preco_unitario: 0 },
      { tipo_ingresso_id: 8, quantidade: 1 },
    ]),
    [
      { tipo_ingresso_id: 4, categoria: "inteira", quantidade: 2 },
      { tipo_ingresso_id: 8, categoria: "inteira", quantidade: 1 },
    ],
  );
});

test("rejeita pedido vazio, quantidades inválidas, categorias inválidas e duplicatas", () => {
  for (const itens of [
    [],
    [{ tipo_ingresso_id: 4, quantidade: 0 }],
    [{ tipo_ingresso_id: 4, quantidade: 1, categoria: "estudante" }],
    [
      { tipo_ingresso_id: 4, quantidade: 1 },
      { tipo_ingresso_id: 4, quantidade: 1 },
    ],
  ]) {
    assert.throws(() => normalizarItensPedido(itens), { status: 422 });
  }
});

test("aceita inteira e meia do mesmo tipo de ingresso", () => {
  assert.deepEqual(
    normalizarItensPedido([
      { tipo_ingresso_id: 4, quantidade: 1, categoria: "inteira" },
      { tipo_ingresso_id: 4, quantidade: 2, categoria: "meia" },
    ]),
    [
      { tipo_ingresso_id: 4, categoria: "inteira", quantidade: 1 },
      { tipo_ingresso_id: 4, categoria: "meia", quantidade: 2 },
    ],
  );
});

test("limita cada pedido a cinco ingressos", () => {
  assert.throws(
    () => normalizarItensPedido([{ tipo_ingresso_id: 4, quantidade: 6 }]),
    { status: 422 },
  );
});

test("calcula meia-entrada pela metade do preço cadastrado", () => {
  assert.equal(calcularPrecoCentavos(100, "meia"), 5000);
  assert.equal(calcularPrecoCentavos(75.01, "meia"), 3751);
  assert.equal(calcularPrecoCentavos(75.01, "inteira"), 7501);
});
