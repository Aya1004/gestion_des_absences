import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/absence_management');
        console.log(`MongoDB Connecté: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Erreur: ${(error as Error).message}`);
        process.exit(1);
    }
};

export default connectDB;
