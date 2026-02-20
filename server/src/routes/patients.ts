import { Router } from 'express';

export const patientsRouter = Router();

patientsRouter.get('/', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

patientsRouter.get('/:id', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

patientsRouter.put('/:id', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

patientsRouter.get('/:id/check-ins', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

patientsRouter.get('/:id/diary', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

