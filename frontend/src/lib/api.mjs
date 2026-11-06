const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
).replace(/\/+$/, "");

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_URL}/${String(path).replace(/^\/+/, "")}`, {
      ...options,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new Error("Não foi possível conectar à API. Verifique se o backend está em execução.");
  }

  const text = response.status === 204 ? "" : await response.text();
  let result = null;
  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      if (response.ok) throw new Error("A API retornou uma resposta inválida.");
    }
  }

  if (!response.ok) {
    throw new Error(result?.erro || `Erro na comunicação com a API (${response.status}).`);
  }

  return result;
}

export function formatarData(valor, options = {}) {
  if (!valor) return "Data a confirmar";
  const data = new Date(valor);
  if (!Number.isFinite(data.getTime())) return "Data a confirmar";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    ...options,
  }).format(data);
}

export function obterDataCard(valor) {
  if (!valor) return { dia: "--", mes: "--" };
  const data = new Date(valor);
  if (!Number.isFinite(data.getTime())) return { dia: "--", mes: "--" };
  return {
    dia: new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(data),
    mes: new Intl.DateTimeFormat("pt-BR", { month: "short" })
      .format(data)
      .replace(".", "")
      .toUpperCase(),
  };
}

export function formatarPreco(valor) {
  if (valor === null || valor === undefined) return "Preço a confirmar";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor));
}
