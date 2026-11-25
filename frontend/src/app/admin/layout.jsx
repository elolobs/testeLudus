"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { obterSessao } from "@/lib/sessao.mjs";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [caminhoAutorizado, setCaminhoAutorizado] = useState("");

  useEffect(() => {
    let ativo = true;

    Promise.resolve().then(() => {
      if (!ativo) return;

      const sessao = obterSessao();
      if (!sessao) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      if (sessao.usuario.cargo !== "ADMIN") {
        router.replace("/");
        return;
      }

      setCaminhoAutorizado(pathname);
    });

    return () => {
      ativo = false;
    };
  }, [pathname, router]);

  if (caminhoAutorizado !== pathname) {
    return (
      <div role="status" aria-live="polite">
        Verificando acesso...
      </div>
    );
  }

  return children;
}
