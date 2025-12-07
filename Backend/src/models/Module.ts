import mongoose, { Schema, Document } from 'mongoose';

export interface IModule extends Document {
    nom_module: string;
    coefficient: number;
}

const ModuleSchema: Schema = new Schema({
    nom_module: { type: String, required: [true, 'Le nom du module est requis'] },
    coefficient: { type: Number, required: [true, 'Le coefficient est requis'] }
});

export default mongoose.model<IModule>('Module', ModuleSchema);
