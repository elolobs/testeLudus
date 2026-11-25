import assert from "node:assert/strict";
import { test } from "node:test";
import { validarAtividades, validarTiposIngresso } from "./RecursoService.js";

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

test("valida atividades para criação de evento", () => {
  assert.deepEqual(
    validarAtividades(
      [
        {
          titulo: "Workshop",
          tipo: "Palestra",
          palestrante: "Ana",
          data_hora_inicio: "2026-10-18T10:00",
          data_hora_fim: "2026-10-18T11:00",
          local_sala: "",
          vagas_maximas: 30,
        },
      ],
      "ORGANIZADOR",
    ),
    [
      {
        titulo: "Workshop",
        tipo: "Palestra",
        palestrante: "Ana",
        data_hora_inicio: "2026-10-18T10:00",
        data_hora_fim: "2026-10-18T11:00",
        local_sala: null,
        vagas_maximas: 30,
      },
    ],
  );
  assert.deepEqual(validarAtividades([], "ORGANIZADOR"), []);
});

test("rejeita atividades incompletas, fora de ordem ou com campos não permitidos", () => {
  const atividade = {
    titulo: "Workshop",
    tipo: "Palestra",
    palestrante: "Ana",
    data_hora_inicio: "2026-10-18T11:00",
    data_hora_fim: "2026-10-18T10:00",
    vagas_maximas: 30,
  };

  assert.throws(
    () => validarAtividades([atividade], "ORGANIZADOR"),
    { status: 422, message: "data_hora_fim deve ser posterior a data_hora_inicio." },
  );
  assert.throws(
    () => validarAtividades([{ ...atividade, programacao: [] }], "ORGANIZADOR"),
    { status: 422, message: "Os dados de uma atividade são inválidos." },
  );
  assert.throws(
    () => validarAtividades([{ ...atividade, vagas_maximas: 0 }], "ORGANIZADOR"),
    { status: 422 },
  );
});
