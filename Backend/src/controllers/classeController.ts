import { Request, Response } from 'express';
import Classe, { IClasse } from '../models/Classe';

export const createClasse = async (req: Request, res: Response): Promise<void> => {
    try {
        const newClasse: IClasse = new Classe(req.body);
        const savedClasse = await newClasse.save();
        res.status(201).json(savedClasse);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getClasses = async (req: Request, res: Response): Promise<void> => {
    try {
        const classes = await Classe.find();
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getClasseById = async (req: Request, res: Response): Promise<void> => {
    try {
        const classe = await Classe.findById(req.params.id);
        if (!classe) {
            res.status(404).json({ message: 'Classe non trouvée' });
            return;
        }
        res.status(200).json(classe);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateClasse = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedClasse = await Classe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedClasse) {
            res.status(404).json({ message: 'Classe non trouvée' });
            return;
        }
        res.status(200).json(updatedClasse);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const deleteClasse = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedClasse = await Classe.findByIdAndDelete(req.params.id);
        if (!deletedClasse) {
            res.status(404).json({ message: 'Classe non trouvée' });
            return;
        }
        res.status(200).json({ message: 'Classe supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
