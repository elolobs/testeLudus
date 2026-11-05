import "./footer.css";

export default function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="left-sides">
                    <img src="../img/logo.png" alt="Logo" className="footer-logo" />
                    <p className="footer-desc">
                        Criação e gestão de eventos num só lugar — descoberta, bilhetes por QR Code e painéis em tempo real.
                    </p>
                    <div className="phone-block">
                        <img src="../img/icon_phone.png" alt="Telefone" />
                        <span>(11) 4002-8922</span>
                    </div>
                </div>

                <div className="center-side">
                    <h3 className="h3a">Acesso Rápido</h3>
                    <div className="columns-grid">
                        <div className="column">
                            <a href="#">Página</a>
                            <a href="#">Página</a>
                            <a href="#">Página</a>
                        </div>
                        <div className="column">
                            <a href="#">Página</a>
                            <a href="#">Página</a>
                            <a href="#">Página</a>
                        </div>
                        <div className="column">
                            <a href="#">Página</a>
                            <a href="#">Página</a>
                            <a href="#">Página</a>
                        </div>
                    </div>
                </div>

                <div className="right-sides">
                    <div className="social-icons">
                        <a href="#"><img src="../img/tiktok.png" alt="TikTok" /></a>
                        <a href="#"><img src="../img/instagram.png" alt="Instagram" /></a>
                        <a href="#"><img src="../img/email.png" alt="E-mail" /></a>
                        <a href="#"><img src="../img/linkedin.png" alt="LinkedIn" /></a>
                        <a href="#"><img src="../img/x.png" alt="X" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}