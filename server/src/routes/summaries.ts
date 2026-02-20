import { Router } from 'express';

export const summariesRouter = Router();

summariesRouter.get('/:conversationId', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

summariesRouter.post('/:conversationId', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

