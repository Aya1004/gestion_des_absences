import mongoose, { Schema, Document } from 'mongoose';
import { IClasse } from './Classe';

export interface IEtudiant extends Document {
    nom: string;
    prenom: string;
    email: string;
    password?: string;
    classe: IClasse['_id'];
}

const EtudiantSchema: Schema = new Schema({
    nom: { type: String, required: [true, 'Le nom est requis'] },
    prenom: { type: String, required: [true, 'Le prénom est requis'] },
    email: { type: String, required: [true, "L'email est requis"], unique: true },
    password: { type: String, required: [true, 'Le mot de passe est requis'] },
    classe: { type: mongoose.Schema.Types.ObjectId, ref: "Classe", required: [true, 'La classe est requise'] }
});

export default mongoose.model<IEtudiant>('Etudiant', EtudiantSchema);
