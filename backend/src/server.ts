import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import apiRouter from './routes';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api', apiRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});


