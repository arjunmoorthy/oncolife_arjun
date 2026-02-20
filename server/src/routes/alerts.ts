import { Router } from 'express';

export const alertsRouter = Router();

alertsRouter.get('/', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

alertsRouter.patch('/:id/acknowledge', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

