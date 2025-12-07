import { Request, Response } from 'express';
import Etudiant, { IEtudiant } from '../models/Etudiant';

export const createEtudiant = async (req: Request, res: Response): Promise<void> => {
    try {
        const newEtudiant: IEtudiant = new Etudiant(req.body);
        const savedEtudiant = await newEtudiant.save();
        res.status(201).json(savedEtudiant);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getEtudiants = async (req: Request, res: Response): Promise<void> => {
    try {
        const etudiants = await Etudiant.find().populate('classe');
        res.status(200).json(etudiants);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getEtudiantById = async (req: Request, res: Response): Promise<void> => {
    try {
        const etudiant = await Etudiant.findById(req.params.id).populate('classe');
        if (!etudiant) {
            res.status(404).json({ message: 'Étudiant non trouvé' });
            return;
        }
        res.status(200).json(etudiant);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateEtudiant = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedEtudiant = await Etudiant.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEtudiant) {
            res.status(404).json({ message: 'Étudiant non trouvé' });
            return;
        }
        res.status(200).json(updatedEtudiant);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const deleteEtudiant = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedEtudiant = await Etudiant.findByIdAndDelete(req.params.id);
        if (!deletedEtudiant) {
            res.status(404).json({ message: 'Etudiant not found' });
            return;
        }
        res.status(200).json({ message: 'Étudiant supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const loginEtudiant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email et mot de passe requis' });
            return;
        }
        const etudiant = await Etudiant.findOne({ email }).populate('classe');
        if (!etudiant) {
            res.status(401).json({ message: 'Email ou mot de passe incorrect' });
            return;
        }
        if (etudiant.password !== password) {
            res.status(401).json({ message: 'Email ou mot de passe incorrect' });
            return;
        }
        res.status(200).json({ 
            message: 'Connexion réussie',
            etudiant: {
                id: etudiant._id,
                nom: etudiant.nom,
                prenom: etudiant.prenom,
                email: etudiant.email,
                classe: etudiant.classe
            }
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};