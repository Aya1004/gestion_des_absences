import { Router } from 'express';
import * as moduleController from '../controllers/moduleController';

const router = Router();

router.post('/', moduleController.createModule);
router.get('/', moduleController.getModules);
router.get('/:id', moduleController.getModuleById);
router.put('/:id', moduleController.updateModule);
router.delete('/:id', moduleController.deleteModule);

export default router;
