import assert from "node:assert/strict";
import { test } from "node:test";
import { validarTiposIngresso } from "./RecursoService.js";

test("valida os tipos de ingresso para criação de evento", () => {
  assert.deepEqual(
    validarTiposIngresso(
      [
        { nome: "Pista", preco: 75, quant_total: 60 },
        { nome: "VIP", preco: 150, quant_total: 40 },
      ],
      "ORGANIZADOR",
      100,
    ),
    [
      { nome: "Pista", preco: 75, quant_total: 60 },
      { nome: "VIP", preco: 150, quant_total: 40 },
    ],
  );
});

test("rejeita lista vazia, ingresso inválido e quantidade acima da capacidade", () => {
  assert.throws(() => validarTiposIngresso([], "ORGANIZADOR", 100), { status: 422 });
  assert.throws(
    () => validarTiposIngresso([{ nome: "Pista", quant_total: 10 }], "ORGANIZADOR", 100),
    { status: 422 },
  );
  assert.throws(
    () => validarTiposIngresso(
      [{ nome: "Pista", preco: 75, quant_total: 101 }],
      "ORGANIZADOR",
      100,
    ),
    { status: 422 },
  );
  assert.throws(
    () => validarTiposIngresso(
      [{ evento_id: 1, nome: "Pista", preco: 75, quant_total: 10 }],
      "ORGANIZADOR",
      100,
    ),
    { status: 422 },
  );
});
