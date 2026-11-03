import * as dbModule from '../config/database.js';


// Suporta tanto o pool exportado diretamente quanto a fábrica criarPool()
const pool = typeof dbModule.criarPool === 'function' ? dbModule.criarPool() : dbModule.pool;


function hidratarProduto(linha) {
  if (!linha) return null;
  return { ...linha, preco: Number(linha.preco) };
}


// 1. Listagem com paginação parametrizada
export async function listar({ limite, offset }) {
  const limiteNum = Number.parseInt(limite, 10);
  const offsetNum = Number.parseInt(offset, 10);


  const [linhas] = await pool.query(
    'SELECT * FROM produtos ORDER BY id LIMIT ? OFFSET ?',
    [limiteNum, offsetNum]
  );


  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM produtos');


  return {
    produtos: linhas.map(hidratarProduto),
    total: Number(total)
  };
}


// 2. Busca por ID
export async function buscarPorId(id) {
  const [linhas] = await pool.query('SELECT * FROM produtos WHERE id = ?', [id]);
  if (linhas.length === 0) return null;
  return hidratarProduto(linhas[0]);
}


// 3. Inserção
export async function criar(produto) {
  const sql = 'INSERT INTO produtos (nome, preco, estoque, categoria) VALUES (?, ?, ?, ?)';
  const valores = [produto.nome, produto.preco, produto.estoque, produto.categoria];
  const [resultado] = await pool.query(sql, valores);
  return { ...produto, id: resultado.insertId, imagem_url: null };
}


// 4. Atualização completa (PUT)
export async function atualizar(id, produto) {
  const sql = 'UPDATE produtos SET nome = ?, preco = ?, estoque = ?, categoria = ? WHERE id = ?';
  const valores = [produto.nome, produto.preco, produto.estoque, produto.categoria, id];
  const [resultado] = await pool.query(sql, valores);
  return resultado.affectedRows > 0;
}


// 5. Atualizar URL da imagem (PATCH)
export async function atualizarImagem(id, imagemUrl) {
  const sql = 'UPDATE produtos SET imagem_url = ? WHERE id = ?';
  const [resultado] = await pool.query(sql, [imagemUrl, id]);
  return resultado.affectedRows > 0;
}


// 6. Remoção (DELETE)
export async function excluir(id) {
  const [resultado] = await pool.query('DELETE FROM produtos WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}
