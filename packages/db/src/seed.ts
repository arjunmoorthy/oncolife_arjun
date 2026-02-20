import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const patientHash = await bcrypt.hash('Test1234!', 10);
  const adminHash = await bcrypt.hash('Admin1234!', 10);

  // ── Admin user ───────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { passwordHash: adminHash },
    create: {
      email: 'admin@test.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Admin',
      phone: '555-0000',
    },
  });

  const adminClinician = await prisma.clinician.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      clinic: 'City Oncology Center',
      address: '123 Medical Dr, Suite 200',
    },
  });

  // ── Provider (Dr. Sarah Chen) ────────────────────────────────────
  const providerUser = await prisma.user.upsert({
    where: { email: 'dr.chen@test.com' },
    update: { passwordHash: adminHash },
    create: {
      email: 'dr.chen@test.com',
      passwordHash: adminHash,
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

  // ── Navigator (Maria Lopez) ──────────────────────────────────────
  const navUser = await prisma.user.upsert({
    where: { email: 'maria.lopez@test.com' },
    update: { passwordHash: adminHash },
    create: {
      email: 'maria.lopez@test.com',
      passwordHash: adminHash,
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

  await prisma.staffAssignment.upsert({
    where: {
      clinicianId_providerClinicianId: {
        clinicianId: navigator.id,
        providerClinicianId: provider.id,
      },
    },
    update: {},
    create: { clinicianId: navigator.id, providerClinicianId: provider.id },
  });

  // ── PRD-aligned patients ─────────────────────────────────────────
  const patientsData = [
    { email: 'patient@test.com', first: 'Bobby', last: 'Johnson', mrn: 'MRN-P001', cancer: 'Breast Cancer', plan: 'AC-T Regimen', dob: '1958-03-15', chemoStart: '2026-01-10', phone: '555-1001' },
    { email: 'sarah.j@test.com', first: 'Sarah', last: 'Johnson', mrn: 'MRN-P002', cancer: 'Colon Cancer', plan: 'FOLFOX', dob: '1972-07-22', chemoStart: '2026-01-20', phone: '555-1002' },
    { email: 'michael.c@test.com', first: 'Michael', last: 'Chen', mrn: 'MRN-P003', cancer: 'Lung Cancer', plan: 'Carboplatin/Pemetrexed', dob: '1965-11-08', chemoStart: '2026-02-01', phone: '555-1003' },
    { email: 'elena.r@test.com', first: 'Elena', last: 'Rodriguez', mrn: 'MRN-P004', cancer: 'Lymphoma', plan: 'R-CHOP', dob: '1980-04-12', chemoStart: '2026-01-25', phone: '555-1004' },
    { email: 'james.w@test.com', first: 'James', last: 'Wilson', mrn: 'MRN-P005', cancer: 'Prostate Cancer', plan: 'Docetaxel', dob: '1955-09-30', chemoStart: '2026-02-05', phone: '555-1005' },
  ];

  const createdPatients: { id: string; first: string }[] = [];

  for (const p of patientsData) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: { passwordHash: patientHash },
      create: {
        email: p.email,
        passwordHash: patientHash,
        role: 'PATIENT',
        firstName: p.first,
        lastName: p.last,
        phone: p.phone,
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
        dateOfBirth: new Date(p.dob),
        chemoStartDate: new Date(p.chemoStart),
        disclaimerAccepted: true,
        privacyAccepted: true,
      },
    });

    createdPatients.push({ id: patient.id, first: p.first });

    // Assign to provider
    await prisma.patientProvider.upsert({
      where: { patientId_clinicianId: { patientId: patient.id, clinicianId: provider.id } },
      update: {},
      create: { patientId: patient.id, clinicianId: provider.id },
    });
  }

  // ── Daily check-ins for each patient ─────────────────────────────
  const severities: ('MILD' | 'MODERATE' | 'SEVERE')[] = ['MILD', 'MODERATE', 'MILD', 'SEVERE', 'MILD'];
  const symptomSets = [
    ['Nausea', 'Fatigue'],
    ['Pain', 'Constipation'],
    ['Cough', 'Fatigue'],
    ['Vomiting', 'Pain', 'Fever'],
    ['Fatigue'],
  ];

  for (let i = 0; i < createdPatients.length; i++) {
    const p = createdPatients[i];
    // Create 3 check-ins per patient over the last 3 days
    for (let d = 0; d < 3; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      await prisma.dailyCheckIn.create({
        data: {
          patientId: p.id,
          date,
          severity: d === 0 ? severities[i] : 'MILD',
          summaryText: `${p.first} reported ${d === 0 ? severities[i].toLowerCase() : 'mild'} symptoms.`,
          symptoms: symptomSets[i],
          patientQuote: d === 0 ? 'Not feeling great today.' : 'Doing a bit better.',
        },
      });
    }
  }

  // ── Sample completed conversations (first patient) ───────────────
  const bobbyId = createdPatients[0].id;
  const conv = await prisma.conversation.create({
    data: {
      patientId: bobbyId,
      phase: 'COMPLETED',
      startedAt: new Date(Date.now() - 86400000),
      completedAt: new Date(Date.now() - 85000000),
      triageLevel: 'NOTIFY_CARE_TEAM',
    },
  });

  await prisma.conversationMessage.createMany({
    data: [
      { conversationId: conv.id, role: 'BOT', content: 'Hi Bobby! How are you feeling today?', messageType: 'TEXT' },
      { conversationId: conv.id, role: 'PATIENT', content: 'I have been feeling nauseous since my last treatment.', messageType: 'TEXT' },
      { conversationId: conv.id, role: 'BOT', content: 'I\'m sorry to hear that. On a scale from mild to severe, how would you rate your nausea?', messageType: 'TEXT' },
      { conversationId: conv.id, role: 'PATIENT', content: 'Moderate', messageType: 'TEXT' },
      { conversationId: conv.id, role: 'BOT', content: 'Thank you. Have you tried any medications for the nausea?', messageType: 'TEXT' },
      { conversationId: conv.id, role: 'PATIENT', content: 'I took some ondansetron but it didn\'t help much.', messageType: 'TEXT' },
      { conversationId: conv.id, role: 'BOT', content: 'I\'ll include that in your summary. Your care team will be notified.', messageType: 'TEXT' },
    ],
  });

  await prisma.sessionSummary.create({
    data: {
      conversationId: conv.id,
      patientId: bobbyId,
      summaryText: 'Bobby reported moderate nausea persisting after last chemo cycle. Ondansetron tried without relief. Care team notified.',
      recommendations: ['Consider switching anti-emetic', 'Follow up in 24 hours'],
    },
  });

  // ── Alerts ───────────────────────────────────────────────────────
  // Urgent alert for Elena (severe symptoms)
  await prisma.alert.create({
    data: {
      patientId: createdPatients[3].id,
      triageLevel: 'URGENT',
      symptomId: 'VOM-201',
      message: 'Elena reported severe vomiting and pain with fever. Requires urgent assessment.',
      acknowledged: false,
    },
  });

  // Notify care team alert for Bobby
  await prisma.alert.create({
    data: {
      patientId: bobbyId,
      conversationId: conv.id,
      triageLevel: 'NOTIFY_CARE_TEAM',
      symptomId: 'NAU-203',
      message: 'Bobby reported moderate nausea unresponsive to ondansetron.',
      acknowledged: false,
    },
  });

  // ── Education Resources ──────────────────────────────────────────
  const resources = [
    { title: 'Managing Nausea During Chemotherapy', description: 'Tips and strategies to manage nausea and vomiting.', content: 'Nausea is one of the most common side effects of chemotherapy. Here are strategies to manage it:\n\n1. Take anti-nausea medications as prescribed\n2. Eat small, frequent meals\n3. Avoid strong odors\n4. Stay hydrated\n5. Try ginger tea or peppermint', category: 'Side Effects', readTimeMinutes: 5, priority: 1, symptoms: ['Nausea', 'Vomiting'] },
    { title: 'Understanding Your Blood Counts', description: 'What your blood test results mean during treatment.', content: 'During chemotherapy, your blood counts may drop. Understanding what different counts mean helps you stay informed about your health.\n\nWhite blood cells fight infection. Red blood cells carry oxygen. Platelets help with clotting.', category: 'Treatment', readTimeMinutes: 8, priority: 2, symptoms: ['Fatigue'] },
    { title: 'Nutrition During Cancer Treatment', description: 'Eating well to support your body during treatment.', content: 'Good nutrition is essential during cancer treatment. Focus on high-protein foods, stay hydrated, and eat what appeals to you.\n\nConsider working with a dietitian for personalized advice.', category: 'Wellness', readTimeMinutes: 6, priority: 3, symptoms: [] },
    { title: 'Pain Management Strategies', description: 'Non-pharmacological and pharmacological approaches to pain.', content: 'Pain management is a key part of cancer care. Options include:\n\n1. Over-the-counter pain relievers\n2. Prescription medications\n3. Physical therapy\n4. Relaxation techniques\n5. Acupuncture', category: 'Side Effects', readTimeMinutes: 7, priority: 1, symptoms: ['Pain'] },
    { title: 'When to Call Your Care Team', description: 'Know when symptoms need immediate attention.', content: 'Call your care team immediately if you experience:\n\n- Fever above 100.4°F\n- Uncontrolled bleeding\n- Severe difficulty breathing\n- Signs of infection\n- Persistent vomiting for more than 24 hours', category: 'Emergency', readTimeMinutes: 3, priority: 1, symptoms: [] },
    { title: 'Exercise During Treatment', description: 'Safe ways to stay active during chemotherapy.', content: 'Light exercise can help manage fatigue and improve mood during treatment. Always consult your care team before starting an exercise program.\n\nWalking, gentle yoga, and stretching are good options.', category: 'Wellness', readTimeMinutes: 5, priority: 4, symptoms: ['Fatigue'] },
  ];

  for (const r of resources) {
    await prisma.educationResource.create({ data: r });
  }

  // ── Diary entries for Bobby ──────────────────────────────────────
  await prisma.diaryEntry.create({
    data: {
      patientId: bobbyId,
      content: 'Feeling a bit better today. The nausea was rough yesterday but I managed to eat some soup.',
      forDoctor: true,
    },
  });

  await prisma.diaryEntry.create({
    data: {
      patientId: bobbyId,
      content: 'Personal note: Need to remember to take meds on time.',
      forDoctor: false,
    },
  });

  console.log('✅ Seed complete');
  console.log('  📧 Patient login: patient@test.com / Test1234!');
  console.log('  📧 Admin login: admin@test.com / Admin1234!');
  console.log('  📧 Provider login: dr.chen@test.com / Admin1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

