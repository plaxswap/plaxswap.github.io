import type { NextApiRequest, NextApiResponse } from 'next'

const CMC_INFO_ENDPOINT = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/info'
const CMC_CURRENCY_URL = 'https://coinmarketcap.com/currencies'

type CmcInfo = {
  id?: number
  slug?: string
}

type CmcInfoResponse = {
  data?: Record<string, CmcInfo | CmcInfo[]>
  status?: {
    error_code?: number
    error_message?: string
  }
}

const getCmcInfo = (data?: Record<string, CmcInfo | CmcInfo[]>): CmcInfo | undefined => {
  if (!data) {
    return undefined
  }

  return Object.values(data).flat().find((token) => token?.slug)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ url?: string; error?: string }>) {
  const address = Array.isArray(req.query.address) ? req.query.address[0] : req.query.address
  const apiKey = process.env.CMC_PRO_API_KEY

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    res.status(400).json({ error: 'Invalid token address' })
    return
  }

  if (!apiKey) {
    res.status(500).json({ error: 'Missing CMC_PRO_API_KEY env variable' })
    return
  }

  const params = new URLSearchParams({
    address: address.toLowerCase(),
    skip_invalid: 'true',
  })

  try {
    const response = await fetch(`${CMC_INFO_ENDPOINT}?${params.toString()}`, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        Accept: 'application/json',
      },
    })
    const body = (await response.json()) as CmcInfoResponse
    const token = getCmcInfo(body.data)

    if (!response.ok || !token?.slug) {
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
      res.status(200).json({})
      return
    }

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800')
    res.status(200).json({ url: `${CMC_CURRENCY_URL}/${token.slug}/` })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CoinMarketCap data' })
  }
}
