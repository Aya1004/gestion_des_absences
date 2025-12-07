import { Router } from 'express';
import * as absenceController from '../controllers/absenceController';

const router = Router();

router.post('/', absenceController.createAbsence);
router.get('/', absenceController.getAbsences);
router.get('/:id', absenceController.getAbsenceById);
router.put('/:id', absenceController.updateAbsence);
router.delete('/:id', absenceController.deleteAbsence);

export default router;
