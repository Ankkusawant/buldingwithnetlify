import crypto from 'crypto'
import { RewardProvider, ProviderOffer } from './index'

export const cpxResearchProvider: RewardProvider = {
  id: 'cpx-research',
  integrationType: 'iframe',

  async getIframeUrl(
    userId: string,
    user: { email: string; name?: string | null }
  ) {
    const appId = process.env.CPX_APP_ID
    const secret = process.env.CPX_SECURE_HASH

    if (!appId || !secret) {
      throw new Error('CPX Research credentials not configured')
    }

    // Iframe hash: MD5(user_id + "-" + secure_hash)
    const secureHash = crypto
      .createHash('md5')
      .update(`${userId}-${secret}`)
      .digest('hex')

    const params = new URLSearchParams({
      app_id: appId,
      ext_user_id: userId,
      username: user.name || user.email.split('@')[0],
      email: user.email,
      secure_hash: secureHash,
    })

    return `https://offers.cpx-research.com/index.php?${params.toString()}`
  },

  async handleWebhook(payload: any) {
    const user_id = payload.user_id
    const trans_id = payload.trans_id
    const amount_local = payload.amount_local
    const status = payload.status
    const receivedHash = payload.hash || payload.secure_hash
    const offer_id = payload.offer_id
    const ip_click = payload.ip_click

    const secret = process.env.CPX_SECURE_HASH

    console.log('[cpx] received:', {
      user_id,
      trans_id,
      amount_local,
      status,
      receivedHash,
      offer_id,
      ip_click,
    })

    if (!user_id || !trans_id) {
      throw new Error('CPX missing required fields: user_id or trans_id')
    }

    // Verify signature if we have a secret configured
    if (secret && receivedHash) {
      // CPX postback hash formula: MD5(trans_id + "-" + secure_hash)
      const expectedA = crypto
        .createHash('md5')
        .update(`${trans_id}-${secret}`)
        .digest('hex')

      // Alternative formula (some CPX accounts use this):
      const expectedB = crypto
        .createHash('md5')
        .update(`${trans_id}-${user_id}-${secret}`)
        .digest('hex')

      const matches = receivedHash === expectedA || receivedHash === expectedB

      if (!matches) {
        console.error('[cpx] hash mismatch', {
          received: receivedHash,
          expectedA,
          expectedB,
        })
        throw new Error('Invalid CPX signature')
      }

      console.log('[cpx] signature verified')
    } else if (secret && !receivedHash) {
      // Postback arrived without hash — log warning but continue
      console.warn('[cpx] postback received without hash, skipping verification')
    }

    // Status handling:
    //   1 = success (credit points)
    //   2 = chargeback / reversal (deduct points)
    if (status === '1') {
      const points = Math.round(parseFloat(String(amount_local || '0')) * 100)
      return {
        eventId: trans_id,
        userId: user_id,
        points,
        type: 'SURVEY_REWARD',
        providerRef: trans_id,
        description: `CPX survey ${trans_id} (offer ${offer_id || 'n/a'})`,
      }
    }

    if (status === '2') {
      const points = Math.round(parseFloat(String(amount_local || '0')) * 100)
      return {
        eventId: `chargeback-${trans_id}`,
        userId: user_id,
        points: -points,
        type: 'SURVEY_CHARGEBACK',
        providerRef: `chargeback-${trans_id}`,
        description: `CPX chargeback ${trans_id}`,
      }
    }

    throw new Error(`Unhandled CPX status: ${status}`)
  },
}