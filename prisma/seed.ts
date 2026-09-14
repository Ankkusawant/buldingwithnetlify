import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // --- Settings ---
  const settings = [
    { key: 'points_conversion', value: '100' },
    { key: 'min_withdrawal_points', value: '10000' },
    { key: 'referral_reward_points', value: '500' },
    { key: 'watch_earn_enabled', value: 'true' },
  ]

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    })
  }
  console.log('✓ Settings seeded')

  // --- Demo tasks ---
  const demoTasks = [
    {
      title: 'Watch a 30-second sponsored video',
      description: 'Watch a short video from our sponsor to earn points.',
      rewardPoints: 100,
      estimatedMinutes: 1,
      type: 'VIDEO',
      provider: 'ADMIN',
      status: 'ACTIVE',
    },
    {
      title: 'Complete a quick shopping survey',
      description: 'Answer 5 questions about your shopping habits.',
      rewardPoints: 500,
      estimatedMinutes: 5,
      type: 'SURVEY',
      provider: 'ADMIN',
      status: 'ACTIVE',
    },
    {
      title: 'Install a partner app',
      description: 'Download and open the app once to earn points.',
      rewardPoints: 1000,
      estimatedMinutes: 3,
      type: 'OFFER',
      provider: 'ADMIN',
      status: 'ACTIVE',
    },
    {
      title: 'Daily check-in bonus',
      description: 'Log in and tap this task once per day.',
      rewardPoints: 50,
      estimatedMinutes: 1,
      type: 'TASK',
      provider: 'ADMIN',
      status: 'ACTIVE',
    },
  ]

  for (const t of demoTasks) {
    const existing = await prisma.task.findFirst({ where: { title: t.title } })
    if (!existing) {
      await prisma.task.create({ data: t })
      console.log(`✓ Created task: ${t.title}`)
    } else {
      console.log(`= Task already exists: ${t.title}`)
    }
  }

  // --- Providers ---
  await prisma.provider.upsert({
    where: { id: 'mock' },
    update: {},
    create: {
      id: 'mock',
      name: 'Mock Provider',
      type: 'SURVEY',
      integrationType: 'offerwall',
      enabled: true,
      status: 'ACTIVE',
      revenueShare: 0.6,
    },
  })
  console.log('✓ Mock provider registered')

  await prisma.provider.upsert({
    where: { id: 'cpx-research' },
    update: {},
    create: {
      id: 'cpx-research',
      name: 'CPX Research',
      type: 'SURVEY',
      integrationType: 'iframe',
      enabled: false,
      status: 'PENDING_KYC',
      revenueShare: 0.6,
      kycRequired: true,
    },
  })
  console.log('✓ CPX Research registered (disabled)')

  console.log('✓ Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())