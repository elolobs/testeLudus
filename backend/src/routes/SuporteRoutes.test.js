import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { app } from "../app.js";

test("rotas de suporte estão montadas e aplicam validação e autenticação", async (t) => {
  const servidor = app.listen(0, "127.0.0.1");
  await once(servidor, "listening");
  t.after(() => new Promise((resolve, reject) => {
    servidor.close((erro) => (erro ? reject(erro) : resolve()));
  }));

  const baseUrl = `http://127.0.0.1:${servidor.address().port}`;
  const criarChamado = await fetch(`${baseUrl}/api/suporte`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(criarChamado.status, 422);

  const meusChamados = await fetch(`${baseUrl}/api/suporte/meus-chamados`);
  assert.equal(meusChamados.status, 401);

  const suporteAdmin = await fetch(`${baseUrl}/api/admin/suporte`);
  assert.equal(suporteAdmin.status, 401);
});
