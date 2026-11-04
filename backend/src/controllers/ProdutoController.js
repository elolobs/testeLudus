// filepath: /c:/Users/25254090/Documents/testeLudus/backend/src/controllers/ProdutoController.js
import * as ProdutoService from '../services/ProdutoService.js';

function responderErro(erro, res, next) {
    if (erro instanceof TypeError) {
        return res.status(400).json({ sucesso: false, erro: erro.message });
    }
    if (erro.message.includes('não encontrado')) {
        return res.status(404).json({ sucesso: false, erro: erro.message });
    }
    return next(erro);
}

async function listar(req, res, next) {
    try {
        const resultado = await ProdutoService.listar(req.query);
        return res.status(200).json({
            sucesso: true,
            dados: resultado.produtos,
            paginacao: resultado.paginacao
        });
    } catch (erro) {
        return responderErro(erro, res, next);
    }
}

async function buscarPorId(req, res, next) {
    try {
        const produto = await ProdutoService.buscarPorId(req.params.id);
        return res.status(200).json({ sucesso: true, dados: produto });
    } catch (erro) {
        return responderErro(erro, res, next);
    }
}

async function criar(req, res, next) {
    try {
        const produto = await ProdutoService.criar(req.body);
        return res.status(201).json({ sucesso: true, dados: produto });
    } catch (erro) {
        return responderErro(erro, res, next);
    }
}

async function atualizar(req, res, next) {
    try {
        const produto = await ProdutoService.atualizar(req.params.id, req.body);
        return res.status(200).json({ sucesso: true, dados: produto });
    } catch (erro) {
        return responderErro(erro, res, next);
    }
}

async function enviarImagem(req, res, next) {
    try {
        const imagemUrl = `/uploads/produtos/${req.file.filename}`;
        const produto = await ProdutoService.salvarImagem(req.params.id, imagemUrl);
        return res.status(200).json({ sucesso: true, dados: produto });
    } catch (erro) {
        return responderErro(erro, res, next);
    }
}

async function excluir(req, res, next) {
    try {
        await ProdutoService.excluir(req.params.id);
        return res.status(204).send();
    } catch (erro) {
        return responderErro(erro, res, next);
    }
}

export const ProdutoController = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    enviarImagem,
    excluir
};