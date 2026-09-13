import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
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

  console.log('Settings seeded')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())