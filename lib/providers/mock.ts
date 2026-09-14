import { RewardProvider, ProviderOffer } from './index'

export const mockProvider: RewardProvider = {
  id: 'mock',
  integrationType: 'offerwall',

  async getOffers(userId: string): Promise<ProviderOffer[]> {
    return [
      {
        id: 'mock-survey-1',
        title: 'Complete a quick survey',
        description: 'Answer 5 questions about your shopping habits.',
        rewardPoints: 500,
        estimatedMinutes: 5,
        type: 'SURVEY',
        provider: 'mock',
      },
      {
        id: 'mock-video-1',
        title: 'Watch a sponsored video',
        description: 'Watch a 30-second video to earn points.',
        rewardPoints: 100,
        estimatedMinutes: 1,
        type: 'VIDEO',
        provider: 'mock',
      },
    ]
  },

  async handleWebhook(payload: any) {
    return {
      eventId: payload.eventId,
      userId: payload.userId,
      points: payload.points,
      type: payload.type || 'OFFER_REWARD',
      providerRef: payload.providerRef,
      description: payload.description,
    }
  },
}