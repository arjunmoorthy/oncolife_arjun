import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

export const educationRouter = Router();

// All education routes require authentication
educationRouter.use(authenticate);

// GET /api/education — list resources, filter by symptom/category
educationRouter.get('/', async (req, res) => {
  try {
    const { category, symptom } = req.query;

    const where: any = {};
    if (category) {
      where.category = String(category);
    }

    const resources = await prisma.educationResource.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });

    // Filter by symptom if provided (symptoms is a JSON array)
    let result = resources;
    if (symptom) {
      const symptomStr = String(symptom);
      result = resources.filter((r) => {
        const symptoms = r.symptoms as string[];
        return Array.isArray(symptoms) && symptoms.includes(symptomStr);
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/education/:id — single resource
educationRouter.get('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;

    const resource = await prisma.educationResource.findUnique({ where: { id } });
    if (!resource) {
      res.status(404).json({ error: 'Education resource not found' });
      return;
    }

    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

