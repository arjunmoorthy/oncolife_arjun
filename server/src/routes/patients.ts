import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import {
  createPatientSchema,
  updatePatientSchema,
  createDiaryEntrySchema,
  updateDiaryEntrySchema,
  createCheckInSchema,
} from '../lib/validation';

export const patientsRouter = Router();

// All patient routes require authentication
patientsRouter.use(authenticate);

// Helper: check if user can access patient data
async function canAccessPatient(userId: string, role: string, patientId: string): Promise<boolean> {
  if (role === 'ADMIN') return true;
  if (role === 'PATIENT') {
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    return patient?.userId === userId;
  }
  // PROVIDER or NAVIGATOR — check if assigned
  const clinician = await prisma.clinician.findUnique({ where: { userId } });
  if (!clinician) return false;
  const assignment = await prisma.patientProvider.findUnique({
    where: { patientId_clinicianId: { patientId, clinicianId: clinician.id } },
  });
  return !!assignment;
}

// GET /api/patients — list patients (clinician only)
patientsRouter.get('/', requireRole('ADMIN', 'PROVIDER', 'NAVIGATOR'), async (req, res) => {
  try {
    const { search, severity, lastCheckIn } = req.query;

    const where: any = {};

    if (search) {
      const s = String(search);
      where.OR = [
        { user: { firstName: { contains: s, mode: 'insensitive' } } },
        { user: { lastName: { contains: s, mode: 'insensitive' } } },
        { mrn: { contains: s, mode: 'insensitive' } },
        { cancerType: { contains: s, mode: 'insensitive' } },
      ];
    }

    // For non-admin clinicians, only show assigned patients
    if (req.user!.role !== 'ADMIN') {
      const clinician = await prisma.clinician.findUnique({ where: { userId: req.user!.userId } });
      if (clinician) {
        where.providers = { some: { clinicianId: clinician.id } };
      }
    }

    const patients = await prisma.patient.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        dailyCheckIns: { orderBy: { date: 'desc' }, take: 1 },
        alerts: { where: { acknowledged: false } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patients/:id — patient detail
patientsRouter.get('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    const allowed = await canAccessPatient(req.user!.userId, req.user!.role, id);
    if (!allowed) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        sessionSummaries: { orderBy: { createdAt: 'desc' }, take: 1 },
        alerts: { where: { acknowledged: false } },
        providers: { include: { clinician: { include: { user: { select: { firstName: true, lastName: true } } } } } },
      },
    });

    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/patients — create patient (clinician only)
patientsRouter.post('/', requireRole('ADMIN', 'PROVIDER', 'NAVIGATOR'), async (req, res) => {
  try {
    const parsed = createPatientSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { firstName, lastName, email, password, dateOfBirth, mrn, cancerType, planName, chemoStartDate, chemoEndDate, providerId, navigatorId } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password || 'TempPass123!', 10);

    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, role: 'PATIENT' },
    });

    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        mrn,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        cancerType,
        planName,
        chemoStartDate: chemoStartDate ? new Date(chemoStartDate) : undefined,
        chemoEndDate: chemoEndDate ? new Date(chemoEndDate) : undefined,
      },
    });

    // Assign provider/navigator if specified
    if (providerId) {
      await prisma.patientProvider.create({ data: { patientId: patient.id, clinicianId: providerId } });
    }
    if (navigatorId && navigatorId !== providerId) {
      await prisma.patientProvider.create({ data: { patientId: patient.id, clinicianId: navigatorId } });
    }

    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/patients/:id — update patient profile
patientsRouter.patch('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    const allowed = await canAccessPatient(req.user!.userId, req.user!.role, id);
    if (!allowed) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const parsed = updatePatientSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const data: any = { ...parsed.data };
    if (data.chemoStartDate) data.chemoStartDate = new Date(data.chemoStartDate);
    if (data.chemoEndDate) data.chemoEndDate = new Date(data.chemoEndDate);

    const patient = await prisma.patient.update({ where: { id }, data });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patients/:id/conversations — list conversations
patientsRouter.get('/:id/conversations', async (req, res) => {
  try {
    const id = req.params.id as string;
    const allowed = await canAccessPatient(req.user!.userId, req.user!.role, id);
    if (!allowed) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { startDate, endDate } = req.query;
    const where: any = { patientId: id };
    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) where.startedAt.gte = new Date(String(startDate));
      if (endDate) where.startedAt.lte = new Date(String(endDate));
    }

    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      include: { sessionSummary: true },
    });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patients/:id/summaries — list session summaries
patientsRouter.get('/:id/summaries', async (req, res) => {
  try {
    const id = req.params.id as string;
    const allowed = await canAccessPatient(req.user!.userId, req.user!.role, id);
    if (!allowed) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const summaries = await prisma.sessionSummary.findMany({
      where: { patientId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/patients/:id/check-ins — list daily check-ins
patientsRouter.get('/:id/check-ins', async (req, res) => {
  try {
    const id = req.params.id as string;
    const allowed = await canAccessPatient(req.user!.userId, req.user!.role, id);
    if (!allowed) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { startDate, endDate, symptom } = req.query;
    const where: any = { patientId: id };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(String(startDate));
      if (endDate) where.date.lte = new Date(String(endDate));
    }

    const checkIns = await prisma.dailyCheckIn.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    res.json(checkIns);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/patients/:id/check-ins — create daily check-in (patient only)
patientsRouter.post('/:id/check-ins', async (req, res) => {
  try {
    const id = req.params.id as string;

    // Only the patient themselves can create check-ins
    if (req.user!.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { id } });
      if (!patient || patient.userId !== req.user!.userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    } else {
      res.status(403).json({ error: 'Only patients can create check-ins' });
      return;
    }

    const parsed = createCheckInSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { severity, summaryText, symptoms, patientQuote, medicationsTried } = parsed.data;

    const checkIn = await prisma.dailyCheckIn.create({
      data: {
        patientId: id,
        date: new Date(),
        severity: severity as any,
        summaryText,
        symptoms,
        patientQuote,
        medicationsTried,
      },
    });

    res.status(201).json(checkIn);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET /api/patients/:id/diary — list diary entries
patientsRouter.get('/:id/diary', async (req, res) => {
  try {
    const id = req.params.id as string;
    const allowed = await canAccessPatient(req.user!.userId, req.user!.role, id);
    if (!allowed) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const where: any = { patientId: id };

    // Clinicians can only see forDoctor=true entries
    if (req.user!.role !== 'PATIENT') {
      where.forDoctor = true;
    }

    const entries = await prisma.diaryEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/patients/:id/diary — create diary entry
patientsRouter.post('/:id/diary', async (req, res) => {
  try {
    const id = req.params.id as string;

    // Only the patient themselves can create diary entries
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient || patient.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const parsed = createDiaryEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const entry = await prisma.diaryEntry.create({
      data: {
        patientId: id,
        content: parsed.data.content,
        forDoctor: parsed.data.forDoctor,
      },
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/patients/:id/diary/:entryId — update diary entry
patientsRouter.patch('/:id/diary/:entryId', async (req, res) => {
  try {
    const id = req.params.id as string;
    const entryId = req.params.entryId as string;

    // Only the patient themselves can update diary entries
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient || patient.userId !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const entry = await prisma.diaryEntry.findUnique({ where: { id: entryId } });
    if (!entry || entry.patientId !== id) {
      res.status(404).json({ error: 'Diary entry not found' });
      return;
    }

    const parsed = updateDiaryEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const updated = await prisma.diaryEntry.update({
      where: { id: entryId },
      data: parsed.data,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
