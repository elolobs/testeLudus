import "./perfil.css";

export default function Perfil() {
  return (
    <div className="perfil-container">
      <div className="perfil-header-top">
        <div className="perfil-avatar">
          <span>EB</span>
        </div>
        <div className="perfil-titulos">
          <h1>eloah barbosa</h1>
          <p>eloahlourbar2@gmail.com</p>
        </div>
      </div>

      <div className="perfil-card">
        <div className="card-header">
          <i className="fa-solid fa-lock card-icon"></i>
          <h2>Dados de acesso</h2>
        </div>
        <div className="card-list">
          <div className="list-item">
            <div className="item-content">
              <label>E-mail</label>
              <p>eloahlourbar2@gmail.com</p>
              <span className="badge-validado">
                <i className="fa-solid fa-circle-check"></i>
                VALIDADO
              </span>
            </div>
            <button className="btn-edit" type="button" aria-label="Editar e-mail">
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>
          
          <div className="list-item">
            <div className="item-content">
              <label>Senha</label>
              <p>••••••••</p>
            </div>
            <button className="btn-edit" type="button" aria-label="Editar senha">
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>

          <div className="list-item">
            <div className="item-content">
              <label>Celular</label>
              <p>+55 (11) 93215-3624</p>
              <span className="badge-validado">
                <i className="fa-solid fa-circle-check"></i>
                VALIDADO
              </span>
            </div>
            <button className="btn-edit" type="button" aria-label="Editar celular">
              <i className="fa-solid fa-pen"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="perfil-card">
        <div className="card-header">
          <i className="fa-solid fa-user card-icon"></i>
          <h2>Dados pessoais</h2>
        </div>
        <div className="card-grid-2">
          <div className="grid-field">
            <label>Nome</label>
            <p>eloah</p>
          </div>
          <div className="grid-field">
            <label>Sobrenome</label>
            <p>barbosa</p>
          </div>
          <div className="grid-field">
            <label>Nacionalidade</label>
            <p>Brasileira</p>
          </div>
          <div className="grid-field">
            <label>Sexo</label>
            <p>Feminino</p>
          </div>
          <div className="grid-field">
            <label>CPF</label>
            <p>464.284.738-36</p>
          </div>
          <div className="grid-field">
            <label>Data de nascimento</label>
            <p>26/02/1969</p>
          </div>
        </div>
      </div>

      <div className="perfil-card">
        <div className="card-header">
          <i className="fa-solid fa-location-dot card-icon"></i>
          <h2>Endereço</h2>
        </div>
        <form className="form-endereco">
          <div className="form-group full-width">
            <label>CEP</label>
            <input type="text" placeholder="00000-000" defaultValue="09015-080" />
          </div>

          <div className="form-group full-width">
            <label>Logradouro</label>
            <input type="text" placeholder="Rua, Avenida..." defaultValue="Rua Catequese" />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Número</label>
              <input type="text" placeholder="123" defaultValue="336" />
            </div>
            <div className="form-group">
              <label>Complemento (opcional)</label>
              <input type="text" placeholder="Apto, Sala..." defaultValue="Apto 200" />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Bairro</label>
            <input type="text" placeholder="Seu bairro" defaultValue="Parque das Nações" />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Estado</label>
              <select defaultValue="SP">
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cidade</label>
              <input type="text" placeholder="Sua cidade" defaultValue="Santo André" />
            </div>
          </div>
        </form>
      </div>

      <div className="perfil-card">
        <div className="card-header">
          <i className="fa-solid fa-bell card-icon"></i>
          <h2>Comunicação</h2>
        </div>
        
        <div className="toggle-list">
          <div className="toggle-item">
            <label>Desejo receber SMS e WhatsApp com novidades</label>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="toggle-item">
            <label>Desejo receber newsletter</label>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="perfil-actions">
        <button className="btn-salvar" type="button">Salvar alterações</button>
      </div>
    </div>
  );
}