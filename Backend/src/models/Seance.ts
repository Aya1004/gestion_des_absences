import mongoose, { Schema, Document } from 'mongoose';
import { IEnseignant } from './Enseignant';
import { IModule } from './Module';
import { IClasse } from './Classe';

export interface ISeance extends Document {
    date_seance: Date;
    heure_debut: string;
    heure_fin: string;
    enseignant: IEnseignant['_id'];
    module: IModule['_id'];
    classe: IClasse['_id'];
}

const SeanceSchema: Schema = new Schema({
    date_seance: { type: Date, required: [true, 'La date de la séance est requise'] },
    heure_debut: { type: String, required: [true, "L'heure de début est requise"] },
    heure_fin: { type: String, required: [true, "L'heure de fin est requise"] },
    enseignant: { type: mongoose.Schema.Types.ObjectId, ref: "Enseignant", required: [true, "L'enseignant est requis"] },
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: [true, 'Le module est requis'] },
    classe: { type: mongoose.Schema.Types.ObjectId, ref: "Classe", required: [true, 'La classe est requise'] }
});

export default mongoose.model<ISeance>('Seance', SeanceSchema);
