import { prisma } from './prisma'

export async function getSetting(key: string, defaultValue: string) {
  const setting = await prisma.setting.findUnique({ where: { key } })
  return setting?.value ?? defaultValue
}

export async function setSetting(key: string, value: string) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
}