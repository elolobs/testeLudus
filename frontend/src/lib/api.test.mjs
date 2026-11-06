import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { apiRequest, formatarData, obterDataCard, formatarPreco } from "./api.mjs";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("faz GET e interpreta a resposta JSON", async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "http://localhost:8080/api/eventos?limite=10");
    assert.equal(options.method, undefined);
    return Response.json({ sucesso: true, dados: [] });
  };

  assert.deepEqual(await apiRequest("eventos?limite=10"), {
    sucesso: true,
    dados: [],
  });
});

test("envia JSON e token Bearer", async () => {
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.headers.get("Content-Type"), "application/json");
    assert.equal(options.headers.get("Authorization"), "Bearer teste");
    assert.deepEqual(JSON.parse(options.body), { email: "teste@example.com" });
    return Response.json({ sucesso: true });
  };

  await apiRequest("/auth/login", {
    method: "POST",
    token: "teste",
    body: { email: "teste@example.com" },
  });
});

test("mostra a mensagem de erro enviada pela API", async () => {
  globalThis.fetch = async () => new Response(
    JSON.stringify({ sucesso: false, erro: "Credenciais inválidas." }),
    { status: 401 },
  );

  await assert.rejects(apiRequest("auth/login"), {
    message: "Credenciais inválidas.",
  });
});

test("informa falha de conexão e aceita resposta sem corpo", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("fetch failed");
  };
  await assert.rejects(apiRequest("eventos"), {
    message: "Não foi possível conectar à API. Verifique se o backend está em execução.",
  });

  globalThis.fetch = async () => new Response(null, { status: 204 });
  assert.equal(await apiRequest("pedidos/1"), null);
});

test("formata datas, datas de cartão e preços", () => {
  assert.equal(formatarData("invalid"), "Data a confirmar");
  assert.deepEqual(obterDataCard(null), { dia: "--", mes: "--" });
  assert.notEqual(obterDataCard("2026-10-18").dia, "--");
  assert.match(formatarPreco(25), /25,00/);
  assert.equal(formatarPreco(null), "Preço a confirmar");
});
