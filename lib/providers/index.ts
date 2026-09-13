export interface ProviderOffer {
  id: string
  title: string
  description: string
  rewardPoints: number
  estimatedMinutes?: number
  type: 'SURVEY' | 'TASK' | 'OFFER' | 'VIDEO'
  provider: string
  url?: string
}

export interface RewardProvider {
  id: string
  getOffers(userId: string): Promise<ProviderOffer[]>
  handleWebhook(payload: any, headers: any): Promise<{
    eventId: string
    userId: string
    points: number
    type: string
    providerRef: string
    description?: string
  }>
}