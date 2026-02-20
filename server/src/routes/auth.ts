import { Router } from 'express';

export const authRouter = Router();

authRouter.post('/login', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

authRouter.post('/register', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

authRouter.post('/refresh', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

authRouter.get('/me', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

