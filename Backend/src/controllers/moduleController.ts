import { Request, Response } from 'express';
import Module, { IModule } from '../models/Module';

export const createModule = async (req: Request, res: Response): Promise<void> => {
    try {
        const newModule: IModule = new Module(req.body);
        const savedModule = await newModule.save();
        res.status(201).json(savedModule);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getModules = async (req: Request, res: Response): Promise<void> => {
    try {
        const modules = await Module.find();
        res.status(200).json(modules);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getModuleById = async (req: Request, res: Response): Promise<void> => {
    try {
        const moduleItem = await Module.findById(req.params.id);
        if (!moduleItem) {
            res.status(404).json({ message: 'Module non trouvé' });
            return;
        }
        res.status(200).json(moduleItem);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateModule = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedModule = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedModule) {
            res.status(404).json({ message: 'Module non trouvé' });
            return;
        }
        res.status(200).json(updatedModule);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const deleteModule = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedModule = await Module.findByIdAndDelete(req.params.id);
        if (!deletedModule) {
            res.status(404).json({ message: 'Module not found' });
            return;
        }
        res.status(200).json({ message: 'Module supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
