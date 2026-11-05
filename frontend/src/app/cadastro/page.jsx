'use client';

import "./cadastro.css";

export default function Cadastro() {


    return (
        <div className="container">

            <div className="leftSide">
                <div className="container-imagem">
                    <img src="../img/fundocadastro.png" alt="Foto Cadastro" />

                    <div className="imgblur">
                        <div className="texto-sobreposto">
                            <h3>O seu próximo evento<br /> começa aqui.</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rightSide">
                <div className="titleCad">
                    <h4>Crie sua conta</h4>
                    <p>
                        Entra no teu ritmo.
                        <br />
                        Acede aos teus eventos, ingressos e experiências.
                    </p>
                </div>
                <form action="" method="post">
                    <label htmlFor="nome">Nome</label>
                    <input type="text" id="nome" placeholder=" Nome" required /><br />
                    <label htmlFor="email">E-mail</label>
                    <input type="email" id="email" placeholder=" E-mail" required />
                    <br />
                    <label htmlFor="cpf">CPF</label>
                    <input type="number" id="cpf" placeholder=" CPF" required />
                    <br />
                    <label htmlFor="senha">Senha</label>
                    <input type="password" id="senha" placeholder=" Senha" minLength={8} pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
                    title="A palavra-passe deve ter pelo menos 8 carateres, incluindo uma letra e um número" required />
                    <br />
                    <button type="submit">Cadastrar</button>
                </form>
            </div>

        </div>
    );
}
