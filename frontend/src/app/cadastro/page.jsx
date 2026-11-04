'use client';

import "./cadastro.css";

export default function Cadastro() {
    return (
        <div className="container">

            <div className="leftSide">
                <div className="container-imagem">
                    <img src="../img/fundocadastro.png" alt="Foto Cadastro" width={450} />
                    <div className="texto-sobreposto">
                        <h3>O seu próximo evento começa aqui</h3>
                    </div>
                </div>
            </div>

            <div className="rightSide">
                <div>
                    <div>
                        <h4>Crie sua conta</h4>
                        <p>
                            Entra no teu ritmo.
                            <br />
                            Acede aos teus eventos, ingressos e experiências.
                        </p>
                    </div>
                    <h4>Crie sua conta</h4>
                    <form action="" method="post">
                        <input type="text" placeholder="Nome" required />
                        <input type="email" placeholder="E-mail" required />
                        <input type="number" placeholder="CPF" required />
                        <input type="password" placeholder="Senha" required />
                        <button type="submit">Cadastrar</button>
                    </form>
                </div>
            </div>

        </div>
    );
}
