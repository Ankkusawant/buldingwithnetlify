export type IntegrationType = 'iframe' | 'offerwall' | 'direct' | 'postback'

export interface ProviderOffer {
  id: string
  title: string
  description: string
  rewardPoints: number
  estimatedMinutes?: number
  type: 'SURVEY' | 'TASK' | 'OFFER' | 'VIDEO'
  provider: string
  url?: string
  imageUrl?: string
}

export interface WebhookResult {
  eventId: string
  userId: string
  points: number
  type: string
  providerRef: string
  description?: string
}

export interface RewardProvider {
  id: string
  integrationType: IntegrationType

  getOffers?(userId: string): Promise<ProviderOffer[]>

  getIframeUrl?(
    userId: string,
    user: { email: string; name?: string | null }
  ): Promise<string>

  handleWebhook(payload: any, headers: any): Promise<WebhookResult>

  verifySignature?(payload: any, headers: any): boolean
}