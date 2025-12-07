import { Request, Response } from 'express';
import Enseignant, { IEnseignant } from '../models/Enseignant';

export const createEnseignant = async (req: Request, res: Response): Promise<void> => {
    try {
        const newEnseignant: IEnseignant = new Enseignant(req.body);
        const savedEnseignant = await newEnseignant.save();
        res.status(201).json(savedEnseignant);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getEnseignants = async (req: Request, res: Response): Promise<void> => {
    try {
        const enseignants = await Enseignant.find().populate('classes');
        res.status(200).json(enseignants);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getEnseignantById = async (req: Request, res: Response): Promise<void> => {
    try {
        const enseignant = await Enseignant.findById(req.params.id).populate('classes');
        if (!enseignant) {
            res.status(404).json({ message: 'Enseignant non trouvé' });
            return;
        }
        res.status(200).json(enseignant);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateEnseignant = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedEnseignant = await Enseignant.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEnseignant) {
            res.status(404).json({ message: 'Enseignant non trouvé' });
            return;
        }
        res.status(200).json(updatedEnseignant);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const deleteEnseignant = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedEnseignant = await Enseignant.findByIdAndDelete(req.params.id);
        if (!deletedEnseignant) {
            res.status(404).json({ message: 'Enseignant non trouvé' });
            return;
        }
        res.status(200).json({ message: 'Enseignant supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const loginEnseignant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email et mot de passe requis' });
            return;
        }
        const enseignant = await Enseignant.findOne({ email }).populate('classes');
        if (!enseignant) {
            res.status(401).json({ message: 'Email ou mot de passe incorrect' });
            return;
        }
        if (enseignant.password !== password) {
            res.status(401).json({ message: 'Email ou mot de passe incorrect' });
            return;
        }
        res.status(200).json({ 
            message: 'Connexion réussie',
            enseignant: {
                id: enseignant._id,
                nom: enseignant.nom,
                prenom: enseignant.prenom,
                email: enseignant.email,
                telephone: enseignant.telephone,
                classes: enseignant.classes
            }
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};