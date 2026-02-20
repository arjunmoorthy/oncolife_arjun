import { Router } from 'express';

export const educationRouter = Router();

educationRouter.get('/', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

educationRouter.get('/:id', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

