import assert from "node:assert/strict";
import { test } from "node:test";
import { validarCpf } from "./AuthService.js";

test("aceita CPF fictício com 11 dígitos, inclusive formatado", () => {
  assert.equal(validarCpf("12345678900"), "12345678900");
  assert.equal(validarCpf("000.000.000-00"), "00000000000");
});

test("rejeita CPF fictício com quantidade diferente de 11 dígitos", () => {
  assert.equal(validarCpf("1234567890"), null);
  assert.equal(validarCpf("123456789012"), null);
  assert.equal(validarCpf("sem números"), null);
  assert.equal(validarCpf(null), null);
});
