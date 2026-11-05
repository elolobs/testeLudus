'use client';

import "./login.css";

export default function Login() {

    return (
        <>
            <div className="container">

                <div className="leftSide">
                    <div className="container-imagem">
                        <img src="../img/fundocadastro.png" alt="Foto Cadastro" width={450} />

                        <div className="imgblur">
                            <div className="texto-sobreposto">
                                <h3>Conecte-se às suas<br /> melhores experiências.</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rightSide">
                    <h1 className="Title">Seu Login</h1>
                    <form action="" method="get">
                        <label htmlFor="email">E-mail</label>
                        <input type="email" id="email" placeholder=" E-mail" required />
                        <br />
                        <label htmlFor="senha">Senha</label>
                        <input type="password" id="senha" placeholder=" Senha" minLength={8} pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
                            title="A palavra-passe deve ter pelo menos 8 carateres, incluindo uma letra e um número" required />
                        <br />
                        <button type="submit">Fazer Login</button>
                        <div className="subCad">
                            <h4>Bem-Vindo de volta</h4>
                            <p>
                                Entra no teu ritmo.
                                <br />
                                Acede aos teus eventos, ingressos e experiências.
                            </p>
                        </div>
                    </form>
                </div>

            </div>
        </>
    );
}