import mongoose, { Schema, Document } from 'mongoose';
import { IClasse } from './Classe';

export interface IEnseignant extends Document {
    nom: string;
    prenom: string;
    email: string;
    password?: string;
    telephone: string;
    classes: IClasse['_id'][];
}

const EnseignantSchema: Schema = new Schema({
    nom: { type: String, required: [true, 'Le nom est requis'] },
    prenom: { type: String, required: [true, 'Le prénom est requis'] },
    email: { type: String, required: [true, "L'email est requis"], unique: true },
    password: { type: String, required: [true, 'Le mot de passe est requis'] },
    telephone: { type: String, required: [true, 'Le téléphone est requis'] },
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Classe" }]
});

export default mongoose.model<IEnseignant>('Enseignant', EnseignantSchema);
