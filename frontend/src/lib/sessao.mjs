const CHAVE_SESSAO = "ludus.sessao";
const DURACAO_SESSAO_MS = 2 * 60 * 60 * 1000;

export function salvarSessao(dados) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    CHAVE_SESSAO,
    JSON.stringify({
      token: dados.token,
      usuario: dados.usuario,
      expiraEm: Date.now() + DURACAO_SESSAO_MS,
    }),
  );
}

export function obterSessao() {
  if (typeof window === "undefined") return null;
  const valor = window.sessionStorage.getItem(CHAVE_SESSAO);
  if (!valor) return null;

  try {
    const sessao = JSON.parse(valor);
    if (
      typeof sessao.token !== "string" ||
      !sessao.usuario?.id ||
      !Number.isFinite(sessao.expiraEm) ||
      sessao.expiraEm <= Date.now()
    ) {
      window.sessionStorage.removeItem(CHAVE_SESSAO);
      return null;
    }
    return sessao;
  } catch {
    window.sessionStorage.removeItem(CHAVE_SESSAO);
    return null;
  }
}

export function limparSessao() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(CHAVE_SESSAO);
  }
}
