import "./perfil.css";


export default function Perfil() {
    return (
        <div className="perfil-container">

            <div className="perfil-header">
                <h1>Seu nome</h1>
                <p>Mantenha seus dados atualizados para receber seus ingressos</p>
            </div>

            <div className="perfil-acesso">

                <form>
                    <label htmlFor="nome">Nome:</label>
                    <input type="text" id="nome" name="nome" />
                  

                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" />
                   

                    <label htmlFor="telefone">Telefone:</label>
                    <input type="tel" id="telefone" name="telefone" />

                    <button type="submit">Atualizar</button>
                </form>

            </div>


            <div className="perfil-pessoais">

                <div className="boxes">
                    <div className="box1">
                        <span>Nome</span>
                        <p>Eloah</p>

                        <span>Nacionalidade</span>
                        <p>Brasileira</p>

                        <span>CPF</span>
                        <p>111.111.111.11</p>
                    </div>

                    <div className="box2">
                        <span>Sobrenome</span>
                        <p>Barbosa</p>

                        <span>Sexo</span>
                        <p>Feminino</p>

                        <span>Data de nascimento</span>
                        <p>25/02/2009</p>
                    </div>
                </div>

            </div>


            <div className="perfil-endereco">
                <form>
                     <span>CEP</span>
                    <label name="cep" className="label-for">0000-000</label>

                    <span>Logradouro</span>
                    <label name="logradouro" className="label-for">0000-000</label>

                    <span>Número</span>
                    <label name="number" className="label-for">0000-000</label>

                    <span>Complemento (opcional)</span>
                    <label name="complemento" className="label-for">0000-000</label>

                    <span>Bairro</span>
                    <label name="bairro" className="label-for">0000-000</label>

                    <span>Estado</span>
                    <select>
                        <option value={"AC"}>Acre</option>
                        <option value={"AL"}>Alagoas</option>
                        <option value={"AP"}>Amapá</option>
                        <option value={"AM"}>Amazonas</option>
                        <option value={"BA"}>Bahia</option>
                        <option value={"CE"}>Ceará</option>
                        <option value={"DF"}>Distrito Federal</option>
                        <option value={"ES"}>Espírito Santo</option>
                        <option value={"GO"}>Goiás</option>
                        <option value={"MA"}>Maranhão</option>
                        <option value={"MT"}>Mato Grosso</option>
                        <option value={"MS"}>Mato Grosso do Sul</option>
                        <option value={"MG"}>Minas Gerais</option>
                        <option value={"PA"}>Pará</option>
                        <option value={"PB"}>Paraíba</option>
                        <option value={"PR"}>Paraná</option>
                        <option value={"PE"}>Pernambuco</option>
                        <option value={"PI"}>Piauí</option>
                        <option value={"RJ"}>Rio de Janeiro</option>
                        <option value={"RN"}>Rio Grande do Norte</option>
                        <option value={"RS"}>Rio Grande do Sul</option>
                        <option value={"RO"}>Rondônia</option>
                        <option value={"RR"}>Roraima</option>
                        <option value={"SC"}>Santa Catarina</option>
                        <option value={"SP"}>São Paulo</option>
                        <option value={"SE"}>Sergipe</option>
                        <option value={"TO"}>Tocantins</option>
                    </select>

                    <span>Cidade</span>
                    <label name="cidade" className="label-for">0000-000</label>

                    <button type="submit">Salvar Alterações</button>
                </form>



                </div>

























        </div>
    );
}