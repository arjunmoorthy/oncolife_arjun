import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { authRouter } from './routes/auth';
import { patientsRouter } from './routes/patients';
import { conversationsRouter } from './routes/conversations';
import { summariesRouter } from './routes/summaries';
import { educationRouter } from './routes/education';
import { staffRouter } from './routes/staff';
import { alertsRouter } from './routes/alerts';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/summaries', summariesRouter);
app.use('/api/education', educationRouter);
app.use('/api/staff', staffRouter);
app.use('/api/alerts', alertsRouter);

export { app };

