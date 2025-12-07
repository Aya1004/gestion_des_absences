import mongoose, { Schema, Document } from 'mongoose';

export interface IClasse extends Document {
    nom_classe: string;
    niveau: string;
    departement: string;
    filiere: string;
}

const ClasseSchema: Schema = new Schema({
    nom_classe: { type: String, required: [true, 'Le nom de la classe est requis'] },
    niveau: { type: String, required: [true, 'Le niveau est requis'] },
    departement: { type: String, required: [true, 'Le département est requis'] },
    filiere: { type: String, required: [true, 'La filière est requise'] }
});

export default mongoose.model<IClasse>('Classe', ClasseSchema);
