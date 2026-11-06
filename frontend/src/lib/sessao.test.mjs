import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { limparSessao, obterSessao, salvarSessao } from "./sessao.mjs";

const windowOriginal = globalThis.window;

function criarJanelaDeTeste() {
  const dados = new Map();
  globalThis.window = {
    sessionStorage: {
      getItem: (chave) => dados.get(chave) ?? null,
      setItem: (chave, valor) => dados.set(chave, valor),
      removeItem: (chave) => dados.delete(chave),
    },
  };
}

afterEach(() => {
  if (windowOriginal === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = windowOriginal;
  }
});

test("salva e recupera sessão ativa", () => {
  criarJanelaDeTeste();
  salvarSessao({ token: "token-teste", usuario: { id: 8, nome_completo: "Ana" } });

  assert.equal(obterSessao().token, "token-teste");
  assert.equal(obterSessao().usuario.id, 8);

  limparSessao();
  assert.equal(obterSessao(), null);
});

test("remove sessão expirada ou inválida", () => {
  criarJanelaDeTeste();
  window.sessionStorage.setItem(
    "ludus.sessao",
    JSON.stringify({ token: "expirado", usuario: { id: 8 }, expiraEm: 0 }),
  );
  assert.equal(obterSessao(), null);
  assert.equal(window.sessionStorage.getItem("ludus.sessao"), null);

  window.sessionStorage.setItem("ludus.sessao", "{");
  assert.equal(obterSessao(), null);
  assert.equal(window.sessionStorage.getItem("ludus.sessao"), null);
});
