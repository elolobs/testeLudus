CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_completo VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  ativo BOOLEAN DEFAULT TRUE,
  termo_lgpd_aceito BOOLEAN NOT NULL DEFAULT FALSE,
  termo_lgpd_data TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  role_id
);

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL descricao TEXT
);

CREATE TABLE eventos (
  id SERIAL PRIMARY KEY,
  organizador_id INT NOT NULL REFERENCES usuarios(id),
  categoria_id INT NOT NULL REFERENCES categorias(id),
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  capacidade_maxima INT NOT NULL CHECK (capacidade_maxima > 0),
  status VARCHAR(20) DEFAULT 'RASCUNHO' CHECK (
    status IN (
      'RASCUNHO',
      'PUBLICADO',
      'SUSPENSO',
      'CANCELADO',
      'CONCLUIDO'
    )
  ),
  data_inicio TIMESTAMP NOT NULL,
  data_fim TIMESTAMP NOT NULL,
  local_nome VARCHAR(150) NOT NULL,
  local_endereco TEXT NOT NULL,
  imagem_capa_url VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipe_evento (
  id SERIAL PRIMARY KEY,
  evento_id INT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  funcao VARCHAR(20) NOT NULL CHECK (funcao IN ('CO_ORGANIZADOR', 'STAFF')),
  atribuido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(evento_id, usuario_id)
);

CREATE TABLE atividades (
  id SERIAL PRIMARY KEY,
  evento_id INT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) NOT NULL,
  palestrante VARCHAR(150) NOT NULL,
  data_hora_inicio TIMESTAMP NOT NULL,
  data_hora_fim TIMESTAMP NOT NULL,
  local_sala VARCHAR(100),
  vagas_maximas INT NOT NULL CHECK (vagas_maximas > 0),
  vagas_ocupadas INT DEFAULT 0 CHECK (vagas_ocupadas <= vagas_maximas)
);

CREATE TABLE ingressos_adquiridos (
  id SERIAL PRIMARY KEY,
  pedido_id INT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  usuario_id INT NOT NULL REFERENCES usuarios(id),
  evento_id INT NOT NULL REFERENCES eventos(id),
  lote_id INT NOT NULL REFERENCES lotes_ingressos(id),
  codigo_qr_hash VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'CONFIRMADO' CHECK (
    status IN ('CONFIRMADO', 'UTILIZADO', 'CANCELADO')
  ),
  presenca_confirmada BOOLEAN DEFAULT FALSE,
  data_checkin TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tipo_ingresso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10, 2),
  quant_total INT NOT NUL,
  quant_vendida INT DEFAULT 0,
  venda_inicio DATETIME,
  venda_final DATETIME
);

CREATE TABLE IF NOT EXISTS lista_espera (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL REFERENCES usuarios(id),
  evento_id INT REFERENCES eventos(id) ON DELETE CASCADE,
  atividade_id INT REFERENCES atividades(id) ON DELETE CASCADE,
  posicao INT NOT NULL,
  status VARCHAR(20) DEFAULT 'AGUARDANDO' CHECK (
    status IN (
      'AGUARDANDO',
      'NOTIFICADO',
      'EXPIRADO',
      'CONVERTIDO',
      'CANCELADO'
    )
  ),
  data_notificacao TIMESTAMP,
  data_limite_resposta TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carrinho(
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  valor_total DECIMAL (10, 2) NOT NULL,
  status ENUM(
    ‘ pendente ’,
    ‘ pago ’,
    ‘ cancelado ’,
    ‘ reservado ’,
    ‘ reembolsado ’
  ) DEFAULT pendente,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itens_pedido(
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  tipo_ingresso_id VARCHAR(150) NOT NULL UNIQUE,
  quantidade INT NOT NULL,
  preco_unitario VARCHAR(20) NOT NULL DEFAULT 'usuario',
);

CREATE TABLE IF NOT EXISTSingressos(
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  tipo_ingresso_id INT NOT NULL,
  user_id INT NOT NULL,
  quantidade INT NOT NULL,
  qr_core VARCHAR(255) UNIQUE NOT NULL,
  status ENUM (’ valido ’, ‘ utilizado ’, ‘ cancelado ’) DEFAULT ‘ valido ’,
  preco_unitario VARCHAR(20) NOT NULL DEFAULT 'usuario'
);

CREATE TABLE IF NOT EXISTS interacoes_usuario (
id SERIAL PRIMARY KEY,
usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
evento_id INT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
tipo_interacao VARCHAR(20) NOT NULL CHECK (tipo_interacao IN (' CLIQUE ', ' FAVORITO ', ' COMPRA ')),
peso INT NOT NULL,
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favoritos (
id SERIAL PRIMARY KEY,
usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
evento_id INT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE(usuario_id, evento_id)
);

CREATE TABLE IF NOT EXISTS logs_auditoria (
id SERIAL PRIMARY KEY,
usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
acao VARCHAR(100) NOT NULL,
recurso VARCHAR(100) NOT NULL,
detalhes JSON,
ip_origem VARCHAR(45),
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



insert into usuarios( nome_completo, email, senha_hash, cpf, telefone, ativo, termo_lgpd_data)
VALUES
('Mylena Lima Pacheco', 'mylenacheco@gmail.com', 'CBJR', '15583527080', '11943546087', TRUE, CURRENT_TIMESTAMP),
('Eloah Loure')