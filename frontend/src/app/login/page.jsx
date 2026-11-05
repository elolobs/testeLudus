'use client';

import { useState } from "react";
import "./login.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
            });

            if (!response.ok) {
                throw new Error("Login falhou. Verifique suas credenciais.");
            }

            const data = await response.json();
            console.log("Login bem-sucedido:", data);

            

        } catch (error) {
            console.error("Erro ao fazer login:", error);
            setErrorMessage(error.message);
        }
    };

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
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            placeholder=" E-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <br />
                        <label htmlFor="senha">Senha</label>
                        <input
                            type="password"
                            id="senha"
                            placeholder=" Senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            minLength={8}
                            pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
                            title="A palavra-passe deve ter pelo menos 8 carateres, incluindo uma letra e um número"
                            required
                        />
                        <br />
                        <button type="submit">Fazer Login</button>
                        {errorMessage && <p className="error">{errorMessage}</p>}
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