import { RewardProvider } from './index'
import { mockProvider } from './mock'

const providers: Record<string, RewardProvider> = {
  mock: mockProvider,
}

export function getProvider(id: string): RewardProvider {
  const provider = providers[id]
  if (!provider) throw new Error(`Provider ${id} not found`)
  return provider
}