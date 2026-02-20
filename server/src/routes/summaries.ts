import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { createSummarySchema } from '../lib/validation';

export const summariesRouter = Router();

// All summary routes require authentication
summariesRouter.use(authenticate);

// GET /api/summaries/:conversationId — get summary for a conversation
summariesRouter.get('/:conversationId', async (req, res) => {
  try {
    const conversationId = req.params.conversationId as string;

    const summary = await prisma.sessionSummary.findUnique({
      where: { conversationId },
    });

    if (!summary) {
      res.status(404).json({ error: 'Summary not found' });
      return;
    }

    // Access control for patients
    if (req.user!.role === 'PATIENT') {
      const patient = await prisma.patient.findFirst({ where: { userId: req.user!.userId } });
      if (!patient || summary.patientId !== patient.id) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/summaries/:conversationId — create summary for a conversation
summariesRouter.post('/:conversationId', async (req, res) => {
  try {
    const conversationId = req.params.conversationId as string;

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    // Check if summary already exists
    const existing = await prisma.sessionSummary.findUnique({ where: { conversationId } });
    if (existing) {
      res.status(409).json({ error: 'Summary already exists for this conversation' });
      return;
    }

    const parsed = createSummarySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { summaryText, patientAddedNotes, recommendations, educationLinks } = parsed.data;

    const summary = await prisma.sessionSummary.create({
      data: {
        conversationId,
        patientId: conversation.patientId,
        summaryText,
        patientAddedNotes,
        recommendations,
        educationLinks,
      },
    });

    res.status(201).json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

