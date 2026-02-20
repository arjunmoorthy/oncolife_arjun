import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { createStaffSchema, updateStaffSchema, assignStaffSchema } from '../lib/validation';

export const staffRouter = Router();

// All staff routes require authentication
staffRouter.use(authenticate);

// GET /api/staff — list staff (admin only)
staffRouter.get('/', requireRole('ADMIN'), async (_req, res) => {
  try {
    const clinicians = await prisma.clinician.findMany({
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true } },
      },
    });

    res.json(clinicians);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/staff — add staff member (admin only)
staffRouter.post('/', requireRole('ADMIN'), async (req, res) => {
  try {
    const parsed = createStaffSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { email, password, firstName, lastName, role, phone, clinic, address, faxNumber } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, role: role as any, phone },
    });

    const clinician = await prisma.clinician.create({
      data: {
        userId: user.id,
        clinic,
        address,
        faxNumber,
      },
    });

    res.status(201).json({
      ...clinician,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/staff/:id — update staff (admin only)
staffRouter.patch('/:id', requireRole('ADMIN'), async (req, res) => {
  try {
    const id = req.params.id as string;

    const clinician = await prisma.clinician.findUnique({ where: { id }, include: { user: true } });
    if (!clinician) {
      res.status(404).json({ error: 'Staff member not found' });
      return;
    }

    const parsed = updateStaffSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { firstName, lastName, phone, clinic, address, faxNumber } = parsed.data;

    // Update user fields
    if (firstName || lastName || phone !== undefined) {
      await prisma.user.update({
        where: { id: clinician.userId },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone !== undefined && { phone }),
        },
      });
    }

    // Update clinician fields
    const updated = await prisma.clinician.update({
      where: { id: id as string },
      data: {
        ...(clinic !== undefined && { clinic }),
        ...(address !== undefined && { address }),
        ...(faxNumber !== undefined && { faxNumber }),
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/staff/:id/assign — assign navigator to provider(s) (admin only)
staffRouter.post('/:id/assign', requireRole('ADMIN'), async (req, res) => {
  try {
    const id = req.params.id as string;

    const clinician = await prisma.clinician.findUnique({ where: { id } });
    if (!clinician) {
      res.status(404).json({ error: 'Staff member not found' });
      return;
    }

    const parsed = assignStaffSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { providerIds } = parsed.data;

    // Remove existing assignments
    await prisma.staffAssignment.deleteMany({ where: { clinicianId: id } });

    // Create new assignments
    const assignments = await Promise.all(
      providerIds.map((providerId) =>
        prisma.staffAssignment.create({
          data: { clinicianId: id, providerClinicianId: providerId },
        })
      )
    );

    // Update the assignedProviderIds array on the clinician
    await prisma.clinician.update({
      where: { id },
      data: { assignedProviderIds: providerIds },
    });

    res.json({ message: 'Assignments updated', assignments });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

