import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata = {
  title: "Ludus - Site de Eventos",
  description: "Encontre seus eventos e experiências favoritas na Ludus. Descubra shows, festivais, peças de teatro e muito mais. Compre ingressos online de forma rápida e segura.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
