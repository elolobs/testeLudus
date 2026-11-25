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
