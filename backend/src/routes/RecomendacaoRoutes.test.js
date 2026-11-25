import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { app } from "../app.js";

test("recomendações exigem autenticação", async (t) => {
  const servidor = app.listen(0, "127.0.0.1");
  await once(servidor, "listening");
  t.after(() => new Promise((resolve, reject) => {
    servidor.close((erro) => (erro ? reject(erro) : resolve()));
  }));

  const resposta = await fetch(
    `http://127.0.0.1:${servidor.address().port}/api/recomendacoes`,
  );
  assert.equal(resposta.status, 401);
});
