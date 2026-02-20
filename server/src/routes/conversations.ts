import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { createConversationSchema, respondConversationSchema, createSummarySchema } from '../lib/validation';

export const conversationsRouter = Router();

// All conversation routes require authentication
conversationsRouter.use(authenticate);

// POST /api/conversations — start new conversation
conversationsRouter.post('/', async (req, res) => {
  try {
    const parsed = createConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { patientId } = parsed.data;

    // Verify patient exists and user has access
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    // Patient can only start their own conversations
    if (req.user!.role === 'PATIENT' && patient.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const conversation = await prisma.conversation.create({
      data: {
        patientId,
        phase: 'DISCLAIMER',
      },
    });

    res.status(201).json({
      id: conversation.id,
      phase: conversation.phase,
      patientId: conversation.patientId,
      startedAt: conversation.startedAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/conversations/:id — get full conversation with messages
conversationsRouter.get('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { timestamp: 'asc' } },
        symptomReports: true,
        sessionSummary: true,
      },
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    // Access control
    if (req.user!.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { id: conversation.patientId } });
      if (!patient || patient.userId !== req.user!.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/conversations/:id/respond — patient sends response (engine is Wave 2b)
conversationsRouter.post('/:id/respond', async (req, res) => {
  try {
    const id = req.params.id as string;

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    // Validate input
    const parsed = respondConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    // Store the patient message
    await prisma.conversationMessage.create({
      data: {
        conversationId: id,
        role: 'PATIENT',
        content: parsed.data.content,
        messageType: 'TEXT',
        selectedOption: parsed.data.selectedOption,
      },
    });

    // Engine processing is Wave 2b — return 501
    res.status(501).json({ error: 'Conversation engine not yet implemented (Wave 2b)' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/conversations/:id/summary — submit final summary
conversationsRouter.post('/:id/summary', async (req, res) => {
  try {
    const id = req.params.id as string;

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
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
        conversationId: id,
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

