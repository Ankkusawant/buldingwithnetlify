import { RewardProvider } from './index'
import { mockProvider } from './mock'
import { cpxResearchProvider } from './cpx-research'

const providers: Record<string, RewardProvider> = {
  mock: mockProvider,
  'cpx-research': cpxResearchProvider,
}

export function getProvider(id: string): RewardProvider {
  const provider = providers[id]
  if (!provider) throw new Error(`Provider ${id} not found`)
  return provider
}