import { Router } from 'express';

export const conversationsRouter = Router();

conversationsRouter.post('/', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

conversationsRouter.get('/:id', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

conversationsRouter.post('/:id/messages', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

conversationsRouter.get('/:id/messages', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

