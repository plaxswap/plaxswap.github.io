import { ChainId } from '@pancakeswap/sdk'
import { ACCESS_RISK_API } from 'config/constants/endpoints'
import { z } from 'zod'

const zBand = z.enum(['5/5', '4/5', '3/5', '2/5', '1/5'])

export const zRiskTokenData = z.object({
  trust_level: z.string(),
  band: zBand,
  scanned_ts: z.string(),
})

export const TOKEN_RISK = {
  VERY_LOW: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  VERY_HIGH: 4,
} as const

export const TOKEN_RISK_MAPPING = {
  '5/5': TOKEN_RISK.VERY_LOW,
  '4/5': TOKEN_RISK.LOW,
  '3/5': TOKEN_RISK.MEDIUM,
  '2/5': TOKEN_RISK.HIGH,
  '1/5': TOKEN_RISK.VERY_HIGH,
} as const

export interface RiskTokenInfo {
  address: string
  chainId: ChainId
  riskLevel: (typeof TOKEN_RISK)[keyof typeof TOKEN_RISK]
  scannedTs: number
}

/**
 * ADDRESS WHITELIST
 * otomatis VERY_LOW tanpa fetch API
 */
const WHITELIST_RISK = [
  '0x328801b0b580eadd83ea841638865ea41dc6fb25',
  '0x1234567890123456789012345678901234567890',
].map((a) => a.toLowerCase())

const fetchRiskApi = async (address: string, chainId: number) => {
  const response = await fetch(`${ACCESS_RISK_API}/${chainId}/${address}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Risk API Error: ${response.status}`)
  }

  return response.json()
}

export const fetchRiskToken = async (
  address: string,
  chainId: ChainId,
): Promise<RiskTokenInfo> => {
  const lowerAddress = address.toLowerCase()

  /**
   * WHITELIST BYPASS
   */
  if (WHITELIST_RISK.includes(lowerAddress)) {
    return {
      address,
      chainId,
      riskLevel: TOKEN_RISK.VERY_LOW,
      scannedTs: Date.now(),
    }
  }

  try {
    const riskApi = await fetchRiskApi(address, chainId)

    const parsed = zRiskTokenData.safeParse(riskApi.data)

    if (!parsed.success) {
      throw new Error('Invalid risk response')
    }
    // eslint-disable-next-line camelcase
    const { band, scanned_ts } = parsed.data

    return {
      address,
      chainId,
      riskLevel: TOKEN_RISK_MAPPING[band],
      scannedTs: Number(scanned_ts),
    }
  } catch (error) {
    console.error('Risk API failed:', error)

    /**
     * FALLBACK DEFAULT
     */
    return {
      address,
      chainId,
      riskLevel: TOKEN_RISK.MEDIUM,
      scannedTs: Date.now(),
    }
  }
}