import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db/connection';
import apiRouter from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database connection (handles MongoDB + fallback to local file)
connectDB();

// Mount Routes
app.use('/api', apiRouter);

// Service Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'crm-core' });
});

app.listen(PORT, () => {
  console.log(`💚 [CRM Core] Core Service running on port ${PORT}`);
});
