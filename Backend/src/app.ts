import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import classeRoutes from './routes/classeRoutes';
import moduleRoutes from './routes/moduleRoutes';
import etudiantRoutes from './routes/etudiantRoutes';
import enseignantRoutes from './routes/enseignantRoutes';
import seanceRoutes from './routes/seanceRoutes';
import absenceRoutes from './routes/absenceRoutes';
import justificationRoutes from './routes/justificationRoutes';

const app: Application = express();

app.use(express.json());
app.use(cors());

app.use('/api/classes', classeRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/etudiants', etudiantRoutes);
app.use('/api/enseignants', enseignantRoutes);
app.use('/api/seances', seanceRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/justifications', justificationRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('L\'API de gestion des absences est en cours d\'exécution...');
});

export default app;
