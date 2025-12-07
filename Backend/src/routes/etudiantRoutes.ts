import { Router } from 'express';
import * as etudiantController from '../controllers/etudiantController';

const router = Router();

router.post('/', etudiantController.createEtudiant);
router.post('/login', etudiantController.loginEtudiant);
router.get('/', etudiantController.getEtudiants);
router.get('/:id', etudiantController.getEtudiantById);
router.put('/:id', etudiantController.updateEtudiant);
router.delete('/:id', etudiantController.deleteEtudiant);

export default router;
