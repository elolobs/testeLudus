import { produtos, incrementarId } from '../models/Produto.js';

export const ProdutoService = {
  listarTodos: (busca) => {
    if (busca) {
      const termo = busca.toLowerCase();
      return produtos.filter(
        p => p.nome.toLowerCase().includes(termo) || p.aroma.toLowerCase().includes(termo)
      );
    }
    return produtos;
  },

  buscarPorId: (id) => {
    return produtos.find(p => p.id === id);
  },

  criar: (dados) => {
    const novoProduto = {
      id: incrementarId(),
      nome: String(dados.nome).trim(),
      aroma: String(dados.aroma).trim(),
      cera: String(dados.cera).trim(),
      peso: Number(dados.peso),
      preco: Number(dados.preco),
      estoque: Number(dados.estoque)
    };
    produtos.push(novoProduto);
    return novoProduto;
  },

  atualizar: (id, dados) => {
    const index = produtos.findIndex(p => p.id === id);
    if (index === -1) return null;

    produtos[index] = {
      id,
      nome: String(dados.nome).trim(),
      aroma: String(dados.aroma).trim(),
      cera: String(dados.cera).trim(),
      peso: Number(dados.peso),
      preco: Number(dados.preco),
      estoque: Number(dados.estoque)
    };
    return produtos[index];
  },

  excluir: (id) => {
    const index = produtos.findIndex(p => p.id === id);
    if (index === -1) return false;

    produtos.splice(index, 1);
    return true;
  }
};