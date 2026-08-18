import { Router } from 'express';
import * as controlador from '../controllers/usuarios.controller.js';

const router = Router();

router.post('/', controlador.criar);
router.get('/', controlador.listar);
router.get('/:id', controlador.buscarPorId);
router.put('/:id', controlador.atualizar);
router.delete('/:id', controlador.remover);

export default router;
