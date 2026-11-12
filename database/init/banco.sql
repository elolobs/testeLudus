CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_completo VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  cargo ENUM('ADMIN', 'ORGANIZADOR', 'USUARIO') DEFAULT 'USUARIO',
  ativo BOOLEAN DEFAULT TRUE,
  termo_lgpd_aceito BOOLEAN NOT NULL DEFAULT FALSE,
  termo_lgpd_data TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL, 
  descricao TEXT
);

CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizador_id INT NOT NULL,
  categoria_id INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  capacidade_maxima INT NOT NULL CHECK (capacidade_maxima > 0),
  status ENUM('RASCUNHO', 'PUBLICADO', 'SUSPENSO', 'CANCELADO', 'CONCLUIDO') DEFAULT 'RASCUNHO',
  data_inicio TIMESTAMP NULL,
  data_fim TIMESTAMP NULL,
  local_nome VARCHAR(150) NOT NULL,
  local_endereco TEXT NOT NULL,
  imagem_capa_url VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizador_id) REFERENCES usuarios(id),
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE IF NOT EXISTS equipe_evento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  usuario_id INT NOT NULL,
  funcao ENUM('CO_ORGANIZADOR', 'STAFF') NOT NULL,
  atribuido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(evento_id, usuario_id),
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS atividades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) NOT NULL,
  palestrante VARCHAR(150) NOT NULL,
  data_hora_inicio TIMESTAMP NULL,
  data_hora_fim TIMESTAMP  NULL,
  local_sala VARCHAR(100),
  vagas_maximas INT NOT NULL CHECK (vagas_maximas > 0),
  vagas_ocupadas INT DEFAULT 0 CHECK (vagas_ocupadas <= vagas_maximas),
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tipo_ingresso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10, 2),
  quant_total INT NOT NULL,
  quant_vendida INT DEFAULT 0,
  venda_inicio DATETIME,
  venda_final DATETIME,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  valor_total DECIMAL(10, 2) NOT NULL,
  status ENUM('pendente', 'pago', 'cancelado', 'reservado', 'reembolsado') DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS itens_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  tipo_ingresso_id INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (tipo_ingresso_id) REFERENCES tipo_ingresso(id)
);

CREATE TABLE IF NOT EXISTS ingressos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  tipo_ingresso_id INT NOT NULL,
  usuario_id INT NOT NULL,
  quantidade INT NOT NULL,
  status ENUM('valido', 'utilizado', 'cancelado') DEFAULT 'valido',
  preco_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (tipo_ingresso_id) REFERENCES tipo_ingresso(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS lista_espera (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  evento_id INT,
  atividade_id INT,
  posicao INT NOT NULL,
  status ENUM('AGUARDANDO', 'NOTIFICADO', 'EXPIRADO', 'CONVERTIDO', 'CANCELADO') DEFAULT 'AGUARDANDO',
  data_notificacao TIMESTAMP NULL,
  data_limite_resposta TIMESTAMP NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  FOREIGN KEY (atividade_id) REFERENCES atividades(id) ON DELETE CASCADE
);

INSERT INTO usuarios (nome_completo, email, senha_hash, cpf, telefone, cargo, ativo, termo_lgpd_aceito, termo_lgpd_data) 
VALUES 
('Mylena Lima Pacheco', 'mylenacheco@gmail.com', 'hash_senha_123', '15583527080', '11943546087', 'ADMIN', TRUE, TRUE, CURRENT_TIMESTAMP),
('Eloah Lourenço', 'eloah@email.com', 'hash_senha_456', '12345678901', '11987654321', 'ORGANIZADOR', TRUE, TRUE, CURRENT_TIMESTAMP),
('João Silva', 'joao@email.com', 'hash_senha_789', '98765432100', '11911112222', 'USUARIO', TRUE, TRUE, CURRENT_TIMESTAMP);

INSERT INTO categorias (nome, descricao) 
VALUES 
('Tecnologia', 'Eventos sobre programação, IA, e inovação'),
('Música', 'Shows, festivais e workshops musicais');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco) 
VALUES 
(2, 1, 'Tech Summit 2024', 'Maior evento de tecnologia do ano.', 500, 'PUBLICADO', '2024-10-15 09:00:00', '2024-10-17 18:00:00', 'Centro de Convenções', 'Rua Principal, 100 - São Paulo');

INSERT INTO atividades (evento_id, titulo, descricao, tipo, palestrante, data_hora_inicio, data_hora_fim, local_sala, vagas_maximas) 
VALUES 
(1, 'Workshop de Python', 'Aprenda Python do zero', 'Workshop', 'Mylena Lima', '2024-10-15 10:00:00', '2024-10-15 12:00:00', 'Sala A', 50);

INSERT INTO tipo_ingresso (evento_id, nome, preco, quant_total, quant_vendida, venda_inicio, venda_final) 
VALUES 
(1, 'Ingresso VIP', 150.00, 100, 0, '2024-01-01 00:00:00', '2024-10-14 23:59:59'),
(1, 'Ingresso Padrão', 75.00, 400, 0, '2024-01-01 00:00:00', '2024-10-14 23:59:59');

INSERT INTO pedidos (usuario_id, valor_total, status) 
VALUES 
(3, 75.00, 'pago');

INSERT INTO itens_pedido (pedido_id, tipo_ingresso_id, quantidade, preco_unitario) 
VALUES
(1, 2, 1, 75.00);

INSERT INTO ingressos (pedido_id, tipo_ingresso_id, usuario_id, quantidade, status, preco_unitario) 
VALUES 
(1, 2, 3, 1, 'valido', 75.00);