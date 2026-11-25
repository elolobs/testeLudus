create database app_db;

use app_db;

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

CREATE TABLE IF NOT EXISTS suporte_chamados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  mensagem TEXT NOT NULL,
  status ENUM('PENDENTE', 'EM_ANDAMENTO', 'RESPONDIDO', 'RESOLVIDO')
    NOT NULL DEFAULT 'PENDENTE',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_suporte_chamados_usuario (usuario_id, criado_em),
  INDEX idx_suporte_chamados_status (status, criado_em),
  CONSTRAINT fk_suporte_chamados_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS suporte_respostas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chamado_id INT NOT NULL,
  autor_usuario_id INT NULL,
  autor ENUM('CLIENTE', 'SUPORTE') NOT NULL,
  texto TEXT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_suporte_respostas_chamado (chamado_id, criado_em),
  CONSTRAINT fk_suporte_respostas_chamado
    FOREIGN KEY (chamado_id) REFERENCES suporte_chamados(id) ON DELETE CASCADE,
  CONSTRAINT fk_suporte_respostas_usuario
    FOREIGN KEY (autor_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
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
  data_hora_fim TIMESTAMP NULL,
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
('Mylena Lima Pacheco', 'mylenacheco@gmail.com', '$2b$10$Fu/NwYOF4kFggyOjXkCBXuND.W34FNuNF6Ajw9TvRBGdZYtVrfAae ', '15583527080', '11943546087', 'ADMIN', TRUE, TRUE, CURRENT_TIMESTAMP),
('Eloah Lourenço', 'eloah@email.com', 'hash_senha_456', '12345678901', '11987654321', 'ORGANIZADOR', TRUE, TRUE, CURRENT_TIMESTAMP),
('João Silva', 'joao@email.com', '$2b$10$Qt8QMrPodbCXIONxQqoqv.O666Vt/4bsrxbQ4vhfNYTFVajaceGPq', '98765432100', '11911112222', 'USUARIO', TRUE, TRUE, CURRENT_TIMESTAMP);

INSERT INTO usuarios (nome_completo, email, senha_hash, cpf, telefone, cargo, ativo, termo_lgpd_aceito, termo_lgpd_data) 
values
('organizador', 'organizador@email.com', '$2b$10$2/Ix9rdFFYBJIv4T5MJaU.DvwHT6WXFN263NJhUP3Vx2kuO8R7y6O', '12345678905', '11987654322', 'ORGANIZADOR', TRUE, TRUE, CURRENT_TIMESTAMP);

INSERT INTO usuarios (nome_completo, email, senha_hash, cpf, telefone, cargo, ativo, termo_lgpd_aceito, termo_lgpd_data) 
values
('organizador', 'adm@email.com', '$2b$10$2/Ix9rdFFYBJIv4T5MJaU.DvwHT6WXFN263NJhUP3Vx2kuO8R7y6O', '12345675905', '11987634322', 'ADMIN', TRUE, TRUE, CURRENT_TIMESTAMP);


INSERT INTO categorias (nome, descricao) 
VALUES 
('Tecnologia', 'Eventos sobre programação, IA, e inovação'),
('Música', 'Shows, festivais e workshops musicais');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco) 
VALUES
(2, 1, 'Tech Summit', 'Maior evento de tecnologia do ano.', 500, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 32 DAY), 'Centro de Convenções', 'Rua Principal, 100 - São Paulo');

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

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM eventos WHERE categoria_id = 2;


SELECT id, titulo, status FROM eventos;


UPDATE eventos
SET status = 'PUBLICADO'
WHERE id IN (13, 14);

select * from eventos;

DELETE c1 FROM categorias c1
INNER JOIN categorias c2 
WHERE c1.id > c2.id 
  AND c1.nome = c2.nome;

select * from eventos;
insert into categorias (nome, descricao) values
('Tecnologia', 'Eventos sobre programação, IA, segurança digital, robótica e inovação');

INSERT INTO categorias (nome, descricao) 
VALUES 
('Tecnologia', 'Eventos sobre programação, IA, segurança digital, robótica e inovação'),
('Música', 'Shows, festivais, concertos, rodas de samba e workshops musicais'),
('Gastronomia', 'Festivais gastronômicos, feiras de food trucks, degustações e aulas de culinária'),
('Negócios e Empreendedorismo', 'Networking, palestras de liderança, feiras de franquias e encontros de startups'),
('Artes Cênicas', 'Peças de teatro, espetáculos de dança, stand-up comedy, ópera, circo e musicais'),
('Cinema e Audiovisual', 'Mostras de cinema, pré-estreias, festivais de curtas e exibições ao ar livre'),
('Artes Visuais e Exposições', 'Galerias de arte, museus, fotografia, escultura e instalações imersivas'),
('Esportes e Fitness', 'Corridas de rua, campeonatos amadores, aulas ao ar livre, trilhas e e-sports'),
('Moda e Beleza', 'Desfiles, bazares, brechós coletivos, workshops de maquiagem e feiras de cosméticos'),
('Geek e Cultura Pop', 'Convenções de quadrinhos, encontros de cosplay, jogos de tabuleiro e RPG'),
('Família e Infantil', 'Espetáculos infantis, oficinas criativas para crianças e contação de histórias')

DELETE FROM eventos 
WHERE titulo IN (
    'Lana Del Rey - Did You Know That There''s a Tunnel Under Ocean Blvd Tour',
    'Olivia Rodrigo - The Unraveled Tour',
    'BTS - Arirang',
    'Marina Sena - Turnê Coisas Naturais'
);

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url) 
VALUES
(2, 2, 'Lana Del Rey - Did You Know That There''s a Tunnel Under Ocean Blvd Tour', 'Show único no Brasil trazendo os maiores sucessos.', 500, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 40 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 40 DAY), 'Allianz Parque', 'Av. Francisco Matarazzo, 1705 - São Paulo', '../../img/lana.png'),
(2, 2, 'Olivia Rodrigo - The Unraveled Tour', 'The Unraveled Tour é a terceira turnê de shows de Olivia Rodrigo, criada para promover seu terceiro álbum de estúdio, You Seem Pretty Sad for a Girl So in Love (2026)', 500, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 55 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 55 DAY), 'Estádio Nilton Santos (Engenhão)', 'Rua José dos Reis, 425 - Rio de Janeiro', '../../img/olivia.png'),
(2, 2, 'BTS - Arirang', 'Espetáculo grandioso do grupo sul-coreano com coreografias icônicas e efeitos pirotécnicos.', 500, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 75 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 76 DAY), 'Estádio do MorumBIS', 'Praça Roberto Gomes Pedrosa, 1 - São Paulo', './bts.png'),
(2, 2, 'Marina Sena - Turnê Coisas Naturais', 'Show vibrante misturando pop brasileiro, MPB e coreografias marcantes.', 500, 'RASCUNHO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 22 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 22 DAY), 'Audio', 'Av. Francisco Matarazzo, 694 - São Paulo', '../../img/marina.png');

ALTER TABLE usuarios
  ADD COLUMN nacionalidade VARCHAR(80) NULL,
  ADD COLUMN sexo VARCHAR(30) NULL,
  ADD COLUMN data_nascimento DATE NULL,
  ADD COLUMN cep VARCHAR(9) NULL,
  ADD COLUMN logradouro VARCHAR(150) NULL,
  ADD COLUMN numero VARCHAR(20) NULL,
  ADD COLUMN complemento VARCHAR(100) NULL,
  ADD COLUMN bairro VARCHAR(100) NULL,
  ADD COLUMN estado CHAR(2) NULL,
  ADD COLUMN cidade VARCHAR(100) NULL,
  ADD COLUMN receber_sms_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN receber_newsletter BOOLEAN NOT NULL DEFAULT FALSE;

select * from usuarios;

UPDATE tipo_ingresso
SET venda_inicio = CASE
        WHEN venda_inicio IS NULL OR venda_inicio < CURRENT_TIMESTAMP
        THEN DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY)
        ELSE venda_inicio
    END,
    venda_final = CASE
        WHEN venda_final IS NULL OR venda_final < CURRENT_TIMESTAMP
        THEN DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 60 DAY)
        ELSE venda_final
    END
WHERE venda_final IS NULL OR venda_final < CURRENT_TIMESTAMP;


ALTER TABLE eventos
  ADD COLUMN IF NOT EXISTS playlist_url VARCHAR(255) NULL AFTER imagem_capa_url;

ALTER TABLE itens_pedido ADD COLUMN categoria VARCHAR(100) NULL;

SELECT * FROM eventos;
INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 2, 'Billie Eilish - Hit Me Hard and Soft: The Tour', 'Apresentação imersiva com palco em 360 graus, sucessos do novo álbum e clássicos da carreira.', 500, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), 'Autódromo de Interlagos', 'Av. Sen. Teotônio Vilela, 261 - São Paulo', '../../img/billie.png', 'https://open.spotify.com/playlist/42oqJaJWDG8N351uKLqpjl?si=yTn5fWpZRCyEIZkZbxu56Q');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 2, 'The Weeknd - After Hours Til Dawn (Encore)', 'Superprodução futurista com iluminação de estádio e setlist repleto de hits mundiais.', 500, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 48 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 49 DAY), 'Estádio do MorumBIS', 'Praça Roberto Gomes Pedrosa, 1 - São Paulo', '../../img/theweeknd.png', 'https://open.spotify.com/playlist/257yy74d75KsYkrU7DoFmT?si=yy22p0unTOudSRi-MVsijA');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 2, 'Sabrina Carpenter - Short n'' Sweet Tour', 'Show pop teatral e bem-humorado trazendo os maiores sucessos das paradas globais.', 500, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 62 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 62 DAY), 'Espaço Unimed', 'Rua Tagipuru, 795 - São Paulo', '../../img/sabrina.png', 'https://open.spotify.com/playlist/37i9dQZF1DXchqrcYVfAQC?si=_4vaWUb8TNiMdrFCNLiolg');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 2, 'Liniker - Caju Tour', 'Espetáculo emocionante celebrando o álbum Caju, unindo MPB, soul e arranjos orquestrais.', 500, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 15 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 15 DAY), 'Vivo Rio', 'Av. Infante Dom Henrique, 85 - Rio de Janeiro', '../../img/liniker.png', 'https://open.spotify.com/playlist/42zURFykuOwhnR7KLEhPzL?si=B3oqLh3QTJyOuJzSu2KbnQ');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 2, 'Travis Scott - Circus Maximus Tour', 'Experiência audiovisual intensa com cenografia monumental e os maiores hits do trap.', 500, 'RASCUNHO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 90 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 90 DAY), 'Allianz Parque', 'Av. Francisco Matarazzo, 1705 - São Paulo', '../../img/travis.png', 'https://open.spotify.com/playlist/2CvbMi6sOixfSuDTs3keu7?si=tvWH0jKAQGewL1_wNrMDpw');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 2, 'Charli XCX - BRAT Arena Tour', 'Festa eletropop de alta energia com estética clubber e batidas marcantes.', 500, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 35 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 35 DAY), 'Farmasi Arena', 'Av. Embaixador Abelardo Bueno, 3401 - Rio de Janeiro', '../../img/charli.png', 'https://open.spotify.com/playlist/0nO82yJhXb3zoiOurO5mQL?si=ePk4ON6WT1-Sp2Cdc8KGmQ');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 2, 'Jão - Supernova: O Último Ato', 'Encerramento épico da era Super com pirotecnia, passarela gigante e grandes sucessos do pop nacional.', 500, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 18 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 18 DAY), 'Pedreira Paulo Leminski', 'Rua João Gava, 970 - Curitiba', '../../img/jao.png', 'https://open.spotify.com/playlist/1ppFAV7DJfkzhoxzBa3xOm?si=qPhQteHIRROHyLLnf0ZclQ');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 2, 'Chappell Roan - The Midwest Princess Tour', 'Show vibrante com estética drag, figurinos extravagantes e hinos pop cantados em coro.', 500, 'RASCUNHO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 82 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 82 DAY), 'Audio', 'Av. Francisco Matarazzo, 694 - São Paulo', '../../img/chappell.png', 'https://open.spotify.com/playlist/2j8D22k7Vr6bsnZ44bLJ3T?si=q-Hm4vlqSDyzX9flYhVZyA');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 1, 'DevSummit Brasil: Inteligência Artificial e Arquitetura Cloud', 'Dois dias intensivos de palestras técnicas, hackathons e workshops práticos focados em modelos de linguagem, cibersegurança ofensiva e escalabilidade de sistemas. Ideal para desenvolvedores e líderes técnicos que buscam atualização e networking com especialistas do mercado.', 800, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 18 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 19 DAY), 'Expo Center Norte', 'Rua José Bernardo Pinto, 333 - São Paulo', '../../img/devsummit.png');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 2, 'Festival Aurora Sonora: Edição Especial', 'Uma celebração da música independente e do pop alternativo brasileiro reunindo mais de doze artistas em dois palcos simultâneos. O evento conta ainda com praça de alimentação variada, áreas de descanso ao ar livre e ativações culturais durante todo o dia.', 1500, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 32 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 32 DAY), 'Parque Villa-Lobos', 'Av. Prof. Fonseca Rodrigues, 2001 - São Paulo', '../../img/aurora_sonora.png');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 3, 'Sabor & Brasa: Festival de Gastronomia Artesanal', 'Encontro gastronômico ao ar livre que reúne chefs renomados, estações de churrasco fogo de chão, cervejarias artesanais e opções vegetarianas autorais. Inclui aulas-show gratuitas ao longo da tarde e espaço dedicado a produtores locais de queijos e doces.', 600, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 12 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 13 DAY), 'Memorial da América Latina', 'Av. Mário de Andrade, 664 - São Paulo', '../../img/sabor_brasa.png');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 4, 'Conexão Startup & Liderança 2027', 'Evento voltado para fundadores, investidores e gestores que desejam escalar seus negócios. A programação oferece painéis sobre captação de recursos, rodadas de pitch ao vivo, mentorias individuais e espaços estruturados para geração de parcerias estratégicas.', 400, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 45 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 45 DAY), 'Cubo Itaú', 'Alameda Vicente Pinzon, 54 - São Paulo', '../../img/conexao_startup.png');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 5, 'O Fantasma da Ópera - Temporada Nacional', 'Superprodução teatral com orquestra ao vivo, figurinos elaborados e cenografia monumental que dá vida a um dos maiores clássicos dos musicais mundiais. Uma experiência emocionante que combina drama, romance e interpretações vocais marcantes.', 900, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 25 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 25 DAY), 'Teatro Renault', 'Av. Brigadeiro Luís Antônio, 411 - São Paulo', '../../img/fantasma_opera.png');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 6, 'Mostra Cine Horizonte: Curtas e Cinema ao Ar Livre', 'Exibição gratuita de curtas-metragens premiados do cinema nacional e latino-americano em telão de alta definição sob as estrelas. Após as sessões, o público poderá participar de debates abertos com diretores, roteiristas e produtores independentes.', 350, 'RASCUNHO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 20 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 22 DAY), 'Cinemateca Brasileira', 'Largo Sen. Raul Cardoso, 207 - São Paulo', '../../img/cine_horizonte.png');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 7, 'Imersão Luz & Forma: Arte Digital Interativa', 'Exposição sensorial que transforma obras clássicas e contemporâneas em projeções mapeadas de 360 graus responsivas ao movimento dos visitantes. O percurso reúne instalações sonoras, realidade aumentada e esculturas luminosas de artistas brasileiros.', 500, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 10 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 40 DAY), 'Farol Santander', 'Rua João Brícola, 24 - São Paulo', '../../img/luz_forma.png');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 8, 'Night Run Urbano 10K & Arena Fitness', 'Corrida noturna pelas principais avenidas iluminadas da cidade com percursos de 5 km e 10 km para iniciantes e atletas experientes. A arena pós-prova oferece DJ ao vivo, massagem esportiva, hidratação e aulas coletivas de alongamento funcional.', 2000, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 28 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 28 DAY), 'Praça Charles Miller', 'Praça Charles Miller, s/n - São Paulo', '../../img/night_run.png');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 9, 'Coletivo Criativo: Bazar de Moda Autoral e Brechó', 'Curadoria especial com mais de sessenta marcas independentes de vestuário sustentável, acessórios artesanais e brechós selecionados. O evento também promove oficinas de customização de peças e consultoria gratuita de coloração pessoal.', 450, 'RASCUNHO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 15 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 16 DAY), 'Casa das Caldeiras', 'Av. Francisco Matarazzo, 2000 - São Paulo', '../../img/coletivo_criativo.png');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 8, 'Pixel & Dados: Convenção Geek e RPG de Mesa', 'Ponto de encontro para fãs de cultura pop, quadrinhos, jogos de tabuleiro e universo geek. Conta com campeonatos de card games, mesas abertas de RPG narradas por mestres convidados, concurso de cosplay com premiação e beco dos artistas independentes.', 1000, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 50 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 51 DAY), 'Centro de Convenções Frei Caneca', 'Rua Frei Caneca, 569 - São Paulo', '../../img/pixel_dados.png');

INSERT INTO eventos (organizador_id, categoria_id, titulo, descricao, capacidade_maxima, status, data_inicio, data_fim, local_nome, local_endereco, imagem_capa_url, playlist_url) 
VALUES (2, 11, 'Fábrica de Histórias: Teatro e Oficinas Criativas', 'Programação cultural pensada para toda a família com espetáculo musical lúdico sobre preservação da natureza, seguido de oficinas de pintura, construção de fantoches com materiais recicláveis e contação de histórias interativa no jardim.', 300, 'PUBLICADO', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 14 DAY), DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 14 DAY), 'Sesc Pinheiros', 'Rua Paes Leme, 195 - São Paulo', '../../img/fabrica_historias.png');

UPDATE eventos 
SET status = 'PUBLICADO' 
WHERE titulo = 'Marina Sena - Turnê Coisas Naturais';