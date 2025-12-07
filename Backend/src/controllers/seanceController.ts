import { Request, Response } from 'express';
import Seance, { ISeance } from '../models/Seance';

export const createSeance = async (req: Request, res: Response): Promise<void> => {
    try {
        const newSeance: ISeance = new Seance(req.body);
        const savedSeance = await newSeance.save();
        res.status(201).json(savedSeance);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getSeances = async (req: Request, res: Response): Promise<void> => {
    try {
        const seances = await Seance.find()
            .populate('enseignant')
            .populate('module')
            .populate('classe');
        res.status(200).json(seances);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getSeanceById = async (req: Request, res: Response): Promise<void> => {
    try {
        const seance = await Seance.findById(req.params.id)
            .populate('enseignant')
            .populate('module')
            .populate('classe');
        if (!seance) {
            res.status(404).json({ message: 'Séance non trouvée' });
            return;
        }
        res.status(200).json(seance);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateSeance = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedSeance = await Seance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSeance) {
            res.status(404).json({ message: 'Séance non trouvée' });
            return;
        }
        res.status(200).json(updatedSeance);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const deleteSeance = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedSeance = await Seance.findByIdAndDelete(req.params.id);
        if (!deletedSeance) {
            res.status(404).json({ message: 'Séance non trouvée' });
            return;
        }
        res.status(200).json({ message: 'Séance supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
