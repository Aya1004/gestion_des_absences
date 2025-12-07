import { Router } from 'express';
import * as justificationController from '../controllers/justificationController';

const router = Router();

router.post('/', justificationController.createJustification);
router.get('/', justificationController.getJustifications);
router.get('/:id', justificationController.getJustificationById);
router.put('/:id', justificationController.updateJustification);
router.delete('/:id', justificationController.deleteJustification);

export default router;
