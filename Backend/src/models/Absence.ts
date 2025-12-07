import mongoose, { Schema, Document } from 'mongoose';
import { IEtudiant } from './Etudiant';
import { ISeance } from './Seance';

export interface IAbsence extends Document {
    etudiant: IEtudiant['_id'];
    seance: ISeance['_id'];
    statut: 'absent' | 'present';
    date_justification?: Date;
}

const AbsenceSchema: Schema = new Schema({
    etudiant: { type: mongoose.Schema.Types.ObjectId, ref: "Etudiant", required: [true, "L'étudiant est requis"] },
    seance: { type: mongoose.Schema.Types.ObjectId, ref: "Seance", required: [true, 'La séance est requise'] },
    statut: { type: String, enum: ["absent", "present"], default: "absent" },
    date_justification: { type: Date }
});

export default mongoose.model<IAbsence>('Absence', AbsenceSchema);
