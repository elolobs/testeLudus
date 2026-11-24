"use client";

import { usePathname } from "next/navigation";
import "./footer.css";

export default function Footer() {
    const pathname = usePathname();

    const rotasSemFooter = ["/perfil", "/login", "/cadastro"];
    const caminhoAtual = (pathname || "").toLowerCase();

    const deveEsconder = rotasSemFooter.some(
        (rota) => caminhoAtual === rota || caminhoAtual.startsWith(`${rota}/`)
    );

    if (deveEsconder) {
        return null;
    }
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="left-sides">
                    <img src="../../../img/logo.png" alt="Logo" className="footer-logo" />
                    <p className="footer-desc">
                        Criação e gestão de eventos num só lugar — descoberta, bilhetes por QR Code e painéis em tempo real.
                    </p>
                    <div className="phone-block">
                        <img src="../../../img/icon_phone.png" alt="Telefone" />
                        <span>(11) 4002-8922</span>
                    </div>
                </div>

                <div className="center-side">
                    <div className="columns-grid">
                        <div className="column">
                            <h3 className="column-title">Acesso Rápido</h3>
                            <a href="#">Minhas Compras</a>
                            <a href="#">Meu Perfil</a>
                            <a href="#">Suporte ao Fã</a>
                        </div>
                        <div className="column">
                            <h3 className="column-title">Termos e Políticas</h3>
                            <a href="#">Termos de Uso</a>
                            <a href="#">Política de Compra</a>
                            <a href="#">Política de Privacidade</a>
                        </div>
                        <div className="column">
                            <h3 className="column-title">Sobre a Ludus</h3>
                            <a href="#">Ludus Brasil</a>
                            <a href="#">Ludus Internacional</a>
                            <a href="#">Trabalhe com a gente</a>
                        </div>
                    </div>
                </div>

                <div className="right-sides">
                    <div className="social-icons">
                        <a href="#"><img src="../../../img/tiktok.png" alt="TikTok" /></a>
                        <a href="#"><img src="../../../img/instagram.png" alt="Instagram" /></a>
                        <a href="#"><img src="../../../img/email.png" alt="E-mail" /></a>
                        <a href="#"><img src="../../../img/linkedin.png" alt="LinkedIn" /></a>
                        <a href="#"><img src="../../../img/x.png" alt="X" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}