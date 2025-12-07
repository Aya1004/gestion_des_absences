import { Router } from 'express';
import * as classeController from '../controllers/classeController';

const router = Router();

router.post('/', classeController.createClasse);
router.get('/', classeController.getClasses);
router.get('/:id', classeController.getClasseById);
router.put('/:id', classeController.updateClasse);
router.delete('/:id', classeController.deleteClasse);

export default router;
