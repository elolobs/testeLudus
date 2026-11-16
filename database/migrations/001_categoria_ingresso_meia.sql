ALTER TABLE itens_pedido
  ADD COLUMN categoria ENUM('inteira', 'meia') NOT NULL DEFAULT 'inteira'
  AFTER tipo_ingresso_id;
