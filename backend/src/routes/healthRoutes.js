import { Router } from 'express';
import { ProdutoController } from '../controllers/ProdutoController.js';

const router = Router();

router.get('/', ProdutoController.listar);
router.get('/:id', ProdutoController.buscarPorId);
router.post('/', ProdutoController.criar);
router.put('/:id', ProdutoController.atualizar);
router.delete('/:id', ProdutoController.excluir);

export default router;