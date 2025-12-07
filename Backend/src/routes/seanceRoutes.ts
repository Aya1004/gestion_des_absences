import { Router } from 'express';
import * as seanceController from '../controllers/seanceController';

const router = Router();

router.post('/', seanceController.createSeance);
router.get('/', seanceController.getSeances);
router.get('/:id', seanceController.getSeanceById);
router.put('/:id', seanceController.updateSeance);
router.delete('/:id', seanceController.deleteSeance);

export default router;
