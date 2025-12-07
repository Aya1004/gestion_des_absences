import { Router } from 'express';
import * as enseignantController from '../controllers/enseignantController';

const router = Router();

router.post('/', enseignantController.createEnseignant);
router.post('/login', enseignantController.loginEnseignant);
router.get('/', enseignantController.getEnseignants);
router.get('/:id', enseignantController.getEnseignantById);
router.put('/:id', enseignantController.updateEnseignant);
router.delete('/:id', enseignantController.deleteEnseignant);

export default router;
