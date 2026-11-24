import assert from "node:assert/strict";
import { test } from "node:test";
import { validarDadosPerfil } from "./PerfilService.js";

function criarPerfilValido() {
  return {
    nacionalidade: "",
    sexo: "",
    data_nascimento: "2000-02-29",
    cep: "09015-080",
    logradouro: "Rua Catequese",
    numero: "336",
    complemento: "",
    bairro: "Centro",
    estado: "SP",
    cidade: "Santo André",
    receber_sms_whatsapp: true,
    receber_newsletter: false,
  };
}

test("valida dados completos de perfil e normaliza texto vazio", () => {
  const dados = validarDadosPerfil(criarPerfilValido());

  assert.equal(dados.complemento, null);
  assert.equal(dados.data_nascimento, "2000-02-29");
  assert.equal(dados.receber_sms_whatsapp, true);
});

test("rejeita CEP, estado e data de nascimento inválidos", () => {
  assert.throws(
    () => validarDadosPerfil({ ...criarPerfilValido(), cep: "123" }),
    { status: 422, message: "Informe um CEP válido." },
  );
  assert.throws(
    () => validarDadosPerfil({ ...criarPerfilValido(), estado: "sp" }),
    { status: 422, message: "Informe a sigla de um estado válida." },
  );
  assert.throws(
    () => validarDadosPerfil({ ...criarPerfilValido(), data_nascimento: "2023-02-29" }),
    { status: 422, message: "Informe uma data de nascimento válida." },
  );
});

test("exige preferências de comunicação booleanas", () => {
  assert.throws(
    () => validarDadosPerfil({ ...criarPerfilValido(), receber_newsletter: "sim" }),
    { status: 422, message: "O campo receber_newsletter deve ser verdadeiro ou falso." },
  );
});
