import crypto from 'crypto'
import { RewardProvider } from './index'

export const cpxResearchProvider: RewardProvider = {
  id: 'cpx-research',
  integrationType: 'iframe',

  async getIframeUrl(
    userId: string,
    user: { email: string; name?: string | null }
  ): Promise<string> {
    const appId = process.env.CPX_APP_ID
    const secret = process.env.CPX_SECURE_HASH

    if (!appId || !secret) {
      throw new Error('CPX Research credentials not configured')
    }

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

  async handleWebhook(payload: any, headers: any) {
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

    if (secret && receivedHash) {
      const expectedA = crypto
        .createHash('md5')
        .update(`${trans_id}-${secret}`)
        .digest('hex')

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
      console.warn('[cpx] postback received without hash, skipping verification')
    }

    const localAmt = parseFloat(String(amount_local || '0'))
    const usdAmt = parseFloat(String(payload.amount_usd || '0'))
    const points =
      localAmt > 0 ? Math.round(localAmt) : Math.round(usdAmt * 4980)

    if (status === '1') {
      return {
        eventId: trans_id,
        userId: user_id,
        points: points,
        type: 'SURVEY_REWARD',
        providerRef: trans_id,
        description: `CPX survey ${trans_id}`,
      }
    }

    if (status === '2') {
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