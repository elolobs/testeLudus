import assert from "node:assert/strict";
import { test } from "node:test";
import {
  normalizarNovoChamado,
  normalizarTextoResposta,
  validarStatusChamado,
} from "./SuporteService.js";

test("normaliza os dados de um chamado", () => {
  assert.deepEqual(
    normalizarNovoChamado({
      nome: "  Ana Silva ",
      email: " ANA@EXEMPLO.COM ",
      telefone: " (11) 99999-0000 ",
      mensagem: "  Preciso de ajuda. ",
    }),
    {
      nome: "Ana Silva",
      email: "ana@exemplo.com",
      telefone: "(11) 99999-0000",
      mensagem: "Preciso de ajuda.",
    },
  );
});

test("rejeita dados incompletos, e-mail inválido e campos acima do limite", () => {
  assert.throws(() => normalizarNovoChamado(null), { status: 422 });
  assert.throws(
    () =>
      normalizarNovoChamado({
        nome: "Ana",
        email: "email-invalido",
        telefone: "11999990000",
        mensagem: "Preciso de ajuda",
      }),
    { status: 422 },
  );
  assert.throws(
    () =>
      normalizarNovoChamado({
        nome: "Ana",
        email: "ana@exemplo.com",
        telefone: "11999990000",
        mensagem: "x".repeat(5001),
      }),
    { status: 422 },
  );
});

test("valida mensagens de resposta e estados dos chamados", () => {
  assert.equal(normalizarTextoResposta("  Pode me ajudar?  "), "Pode me ajudar?");
  assert.throws(() => normalizarTextoResposta(" "), { status: 422 });
  assert.equal(validarStatusChamado("RESOLVIDO"), "RESOLVIDO");
  assert.throws(() => validarStatusChamado("INVALIDO"), { status: 422 });
});
