import mongoose, { Schema, Document } from 'mongoose';
import { IAbsence } from './Absence';

export interface IJustification extends Document {
    absence: IAbsence['_id'];
    fichier: string;
    commentaire?: string;
    etat: 'en attente' | 'validé' | 'refusé';
}

const JustificationSchema: Schema = new Schema({
    absence: { type: mongoose.Schema.Types.ObjectId, ref: "Absence", required: [true, "L'absence est requise"] },
    fichier: { type: String, default: '' },
    commentaire: { type: String },
    etat: { type: String, enum: ["en attente", "validé", "refusé"], default: "en attente" }
});

export default mongoose.model<IJustification>('Justification', JustificationSchema);
