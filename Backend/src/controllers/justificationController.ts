import { Request, Response } from 'express';
import Justification, { IJustification } from '../models/Justification';
import Absence from '../models/Absence';

export const createJustification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { absence } = req.body;
        
        // Vérifier que l'absence existe et a le statut 'absent'
        const absenceDoc = await Absence.findById(absence);
        if (!absenceDoc) {
            res.status(404).json({ message: 'Absence non trouvée' });
            return;
        }
        
        if (absenceDoc.statut !== 'absent') {
            res.status(400).json({ message: 'Une justification ne peut être créée que pour une absence (statut: absent)' });
            return;
        }
        
        const newJustification: IJustification = new Justification(req.body);
        const savedJustification = await newJustification.save();
        res.status(201).json(savedJustification);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getJustifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const justifications = await Justification.find()
            .populate({
                path: 'absence',
                populate: [
                    { path: 'etudiant', select: 'nom prenom email' },
                    {
                        path: 'seance',
                        populate: [
                            { path: 'module', select: 'nom_module' },
                            { path: 'classe', select: 'nom_classe niveau filiere' },
                            { path: 'enseignant', select: 'nom prenom email' }
                        ]
                    }
                ]
            });
        
        // Filtrer pour ne retourner que les justifications d'absences (statut: 'absent')
        const filteredJustifications = justifications.filter(j => 
            j.absence && (j.absence as any).statut === 'absent'
        );
        
        res.status(200).json(filteredJustifications);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getJustificationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const justification = await Justification.findById(req.params.id)
            .populate({
                path: 'absence',
                populate: [
                    { path: 'etudiant', select: 'nom prenom email' },
                    {
                        path: 'seance',
                        populate: [
                            { path: 'module', select: 'nom_module' },
                            { path: 'classe', select: 'nom_classe niveau filiere' },
                            { path: 'enseignant', select: 'nom prenom email' }
                        ]
                    }
                ]
            });
        if (!justification) {
            res.status(404).json({ message: 'Justification non trouvée' });
            return;
        }
        res.status(200).json(justification);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateJustification = async (req: Request, res: Response): Promise<void> => {
    try {
        // Si on essaie de changer l'absence, vérifier qu'elle a le statut 'absent'
        if (req.body.absence) {
            const absenceDoc = await Absence.findById(req.body.absence);
            if (!absenceDoc) {
                res.status(404).json({ message: 'Absence non trouvée' });
                return;
            }
            if (absenceDoc.statut !== 'absent') {
                res.status(400).json({ message: 'Une justification ne peut être associée qu\'à une absence (statut: absent)' });
                return;
            }
        }
        
        const updatedJustification = await Justification.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        ).populate({
            path: 'absence',
            populate: [
                { path: 'etudiant', select: 'nom prenom email' },
                {
                    path: 'seance',
                    populate: [
                        { path: 'module', select: 'nom_module' },
                        { path: 'classe', select: 'nom_classe niveau filiere' },
                        { path: 'enseignant', select: 'nom prenom email' }
                    ]
                }
            ]
        });
        if (!updatedJustification) {
            res.status(404).json({ message: 'Justification non trouvée' });
            return;
        }
        res.status(200).json(updatedJustification);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const deleteJustification = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedJustification = await Justification.findByIdAndDelete(req.params.id);
        if (!deletedJustification) {
            res.status(404).json({ message: 'Justification non trouvée' });
            return;
        }
        res.status(200).json({ message: 'Justification supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
