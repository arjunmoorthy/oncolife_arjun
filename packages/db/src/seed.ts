import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@oncolife.dev' },
    update: {},
    create: {
      email: 'admin@oncolife.dev',
      passwordHash: '$2b$10$placeholder', // bcrypt hash placeholder
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Admin',
    },
  });

  // Create provider (Dr. Chen)
  const providerUser = await prisma.user.upsert({
    where: { email: 'dr.chen@oncolife.dev' },
    update: {},
    create: {
      email: 'dr.chen@oncolife.dev',
      passwordHash: '$2b$10$placeholder',
      role: 'PROVIDER',
      firstName: 'Sarah',
      lastName: 'Chen',
      phone: '555-0100',
    },
  });

  const provider = await prisma.clinician.upsert({
    where: { userId: providerUser.id },
    update: {},
    create: {
      userId: providerUser.id,
      clinic: 'City Oncology Center',
      address: '123 Medical Dr, Suite 200',
      faxNumber: '555-0101',
      assignedProviderIds: [],
    },
  });

  // Create navigator (Maria Lopez)
  const navUser = await prisma.user.upsert({
    where: { email: 'maria.lopez@oncolife.dev' },
    update: {},
    create: {
      email: 'maria.lopez@oncolife.dev',
      passwordHash: '$2b$10$placeholder',
      role: 'NAVIGATOR',
      firstName: 'Maria',
      lastName: 'Lopez',
      phone: '555-0200',
    },
  });

  const navigator = await prisma.clinician.upsert({
    where: { userId: navUser.id },
    update: {},
    create: {
      userId: navUser.id,
      clinic: 'City Oncology Center',
      assignedProviderIds: [provider.id],
    },
  });

  // Staff assignment: navigator → provider
  await prisma.staffAssignment.upsert({
    where: {
      clinicianId_providerClinicianId: {
        clinicianId: navigator.id,
        providerClinicianId: provider.id,
      },
    },
    update: {},
    create: {
      clinicianId: navigator.id,
      providerClinicianId: provider.id,
    },
  });

  // Create 5 sample patients
  const patients = [
    { email: 'james.w@example.com', first: 'James', last: 'Wilson', mrn: 'MRN-001', cancer: 'Breast Cancer', plan: 'AC-T Regimen' },
    { email: 'linda.m@example.com', first: 'Linda', last: 'Martinez', mrn: 'MRN-002', cancer: 'Colon Cancer', plan: 'FOLFOX' },
    { email: 'robert.k@example.com', first: 'Robert', last: 'Kim', mrn: 'MRN-003', cancer: 'Lung Cancer', plan: 'Carboplatin/Pemetrexed' },
    { email: 'susan.t@example.com', first: 'Susan', last: 'Thompson', mrn: 'MRN-004', cancer: 'Lymphoma', plan: 'R-CHOP' },
    { email: 'david.p@example.com', first: 'David', last: 'Patel', mrn: 'MRN-005', cancer: 'Prostate Cancer', plan: 'Docetaxel' },
  ];

  for (const p of patients) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        passwordHash: '$2b$10$placeholder',
        role: 'PATIENT',
        firstName: p.first,
        lastName: p.last,
      },
    });

    const patient = await prisma.patient.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        mrn: p.mrn,
        cancerType: p.cancer,
        planName: p.plan,
        chemoStartDate: new Date('2026-01-15'),
        disclaimerAccepted: true,
        privacyAccepted: true,
      },
    });

    // Assign to provider
    await prisma.patientProvider.upsert({
      where: {
        patientId_clinicianId: {
          patientId: patient.id,
          clinicianId: provider.id,
        },
      },
      update: {},
      create: {
        patientId: patient.id,
        clinicianId: provider.id,
      },
    });

    // Create a sample daily check-in for each patient
    await prisma.dailyCheckIn.create({
      data: {
        patientId: patient.id,
        date: new Date(),
        severity: 'MILD',
        summaryText: `${p.first} reported mild symptoms during routine check-in.`,
        symptoms: JSON.parse('["NAU-203", "FAT-206"]'),
        patientQuote: 'Feeling okay today, just a bit tired.',
      },
    });
  }

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

