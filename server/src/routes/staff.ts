import { Router } from 'express';

export const staffRouter = Router();

staffRouter.get('/', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

staffRouter.get('/:id/patients', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

