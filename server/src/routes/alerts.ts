import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

export const alertsRouter = Router();

// All alert routes require authentication
alertsRouter.use(authenticate);

// GET /api/alerts — list all unacknowledged alerts (clinician only)
alertsRouter.get('/', requireRole('ADMIN', 'PROVIDER', 'NAVIGATOR'), async (req, res) => {
  try {
    const where: any = { acknowledged: false };

    // Non-admin clinicians only see alerts for their assigned patients
    if (req.user!.role !== 'ADMIN') {
      const clinician = await prisma.clinician.findUnique({ where: { userId: req.user!.userId } });
      if (clinician) {
        const assignments = await prisma.patientProvider.findMany({
          where: { clinicianId: clinician.id },
          select: { patientId: true },
        });
        where.patientId = { in: assignments.map((a) => a.patientId) };
      }
    }

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        patient: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/alerts/:id/acknowledge — mark alert acknowledged
alertsRouter.patch('/:id/acknowledge', requireRole('ADMIN', 'PROVIDER', 'NAVIGATOR'), async (req, res) => {
  try {
    const id = req.params.id as string;

    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: {
        acknowledged: true,
        acknowledgedBy: req.user!.userId as string,
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

