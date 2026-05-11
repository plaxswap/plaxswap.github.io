/* eslint-disable no-param-reassign */
import { gql } from 'graphql-request'
import { useEffect, useState } from 'react'
import { TokenData, Block } from 'state/info/types'
import { getDeltaTimestamps } from 'utils/getDeltaTimestamps'
import { getChangeForPeriod } from 'utils/getChangeForPeriod'
import { useBlocksFromTimestamps } from 'views/Info/hooks/useBlocksFromTimestamps'
import { getAmountChange, getPercentChange } from 'views/Info/utils/infoDataHelpers'
import { getMultiChainQueryEndPointWithStableSwap, MultiChainName } from '../../constant'
import { fetchTokenAddresses } from './topTokens'

interface TokenFields {
  id: string
  symbol: string
  name: string
  decimals: string
  derivedUSD: string // Price in USD per token
  tradeVolumeUSD: string
  totalTransactions: string
  totalLiquidity: string
}

interface FormattedTokenFields
  extends Omit<
    TokenFields,
    'derivedUSD' | 'tradeVolumeUSD' | 'totalTransactions' | 'totalLiquidity' | 'decimals'
  > {
  derivedUSD: number
  tradeVolumeUSD: number
  totalTransactions: number
  totalLiquidity: number
  decimals: number
}

interface TokenQueryResponse {
  now: TokenFields[]
  oneDayAgo: TokenFields[]
  twoDaysAgo: TokenFields[]
  oneWeekAgo: TokenFields[]
  twoWeeksAgo: TokenFields[]
}

interface TokenChartData {
  priceUSD: number
  priceUSDChange: number
  volumeUSD: number
  volumeUSDChange: number
}

interface PairMarketFields {
  id: string
  reserve0: string
  reserve1: string
  reserveUSD: string
  volumeUSD: string
  token0Price: string
  token1Price: string
  token0: {
    id: string
  }
  token1: {
    id: string
  }
}

interface PairMarketQueryResponse {
  nowToken0QuotePairs: PairMarketFields[]
  nowToken1QuotePairs: PairMarketFields[]
  oneDayAgoToken0QuotePairs: PairMarketFields[]
  oneDayAgoToken1QuotePairs: PairMarketFields[]
  twoDaysAgoToken0QuotePairs: PairMarketFields[]
  twoDaysAgoToken1QuotePairs: PairMarketFields[]
}

interface PairDayDataFields {
  id: string
  date: number
  dailyVolumeUSD: string
}

interface PairDayDataQueryResponse {
  pairDayDatas: PairDayDataFields[]
}

interface PairSwapFields {
  id: string
  timestamp: string
  amountUSD: string
  pair: {
    id: string
  }
}

interface PairSwapQueryResponse {
  swaps: PairSwapFields[]
}

interface TokenDayVolumeFields {
  id: string
  date: number
  dailyVolumeUSD: string
  dailyVolumeToken: string
}

interface TokenDayVolumeQueryResponse {
  tokenDayDatas: TokenDayVolumeFields[]
}

const USD_QUOTE_TOKEN_ADDRESSES = [
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC.e
  '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', // native USDC
  '0x9c9e5fd8bbc25984b178fdce6117defa39d2db39', // BUSD
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // DAI
]

const USD_QUOTE_TOKEN_SET = new Set(USD_QUOTE_TOKEN_ADDRESSES)

/**
 * Main token data to display on Token page
 */
const TOKEN_AT_BLOCK = (block: number | undefined, tokens: string[]) => {
  const addressesString = `["${tokens.join('","')}"]`
  const blockString = block ? `block: {number: ${block}}` : ``
  return `tokens(
      where: {id_in: ${addressesString}}
      ${blockString}
      orderBy: tradeVolumeUSD
      orderDirection: desc
    ) {
      id
      symbol
      name
      decimals
      derivedUSD
      tradeVolumeUSD
      totalTransactions
      totalLiquidity
    }
  `
}

const fetchTokenData = async (
  chainName: MultiChainName,
  block24h: number,
  block48h: number,
  block7d: number,
  block14d: number,
  tokenAddresses: string[],
) => {
  try {
    const query = gql`
      query tokens {
        now: ${TOKEN_AT_BLOCK(null, tokenAddresses)}
        oneDayAgo: ${TOKEN_AT_BLOCK(block24h, tokenAddresses)}
        twoDaysAgo: ${TOKEN_AT_BLOCK(block48h, tokenAddresses)}
        oneWeekAgo: ${TOKEN_AT_BLOCK(block7d, tokenAddresses)}
        twoWeeksAgo: ${TOKEN_AT_BLOCK(block14d, tokenAddresses)}
      }
    `
    const data = await getMultiChainQueryEndPointWithStableSwap(chainName).request<TokenQueryResponse>(query)
    console.info('[HotTokenList debug] token data query result', {
      chainName,
      requestedAddresses: tokenAddresses.length,
      now: data?.now?.length ?? 0,
      oneDayAgo: data?.oneDayAgo?.length ?? 0,
      twoDaysAgo: data?.twoDaysAgo?.length ?? 0,
      sampleRequestedAddresses: tokenAddresses.slice(0, 10),
      sampleNow: data?.now?.slice(0, 5),
    })
    return { data, error: false }
  } catch (error) {
    console.error('Failed to fetch token data', error)
    return { error: true }
  }
}

const getPairsForTokenMarket = (aliasPrefix: string, block: number | undefined, tokenAddresses: string[]) => {
  const tokens = Array.from(new Set(tokenAddresses.map((address) => address.toLowerCase())))
  const addressesString = `["${tokens.join('","')}"]`
  const quoteAddressesString = `["${USD_QUOTE_TOKEN_ADDRESSES.join('","')}"]`
  const blockString = block ? `block: {number: ${block}}` : ``

  return `
    ${aliasPrefix}Token0QuotePairs: pairs(
      first: 1000
      where: { token0_in: ${addressesString}, token1_in: ${quoteAddressesString} }
      ${blockString}
      orderBy: reserveUSD
      orderDirection: desc
    ) {
      id
      reserve0
      reserve1
      reserveUSD
      volumeUSD
      token0Price
      token1Price
      token0 { id }
      token1 { id }
    }
    ${aliasPrefix}Token1QuotePairs: pairs(
      first: 1000
      where: { token1_in: ${addressesString}, token0_in: ${quoteAddressesString} }
      ${blockString}
      orderBy: reserveUSD
      orderDirection: desc
    ) {
      id
      reserve0
      reserve1
      reserveUSD
      volumeUSD
      token0Price
      token1Price
      token0 { id }
      token1 { id }
    }
  `
}

const parsePairPriceForToken = (pair: PairMarketFields, tokenAddress: string) => {
  const token0 = pair.token0.id.toLowerCase()
  const token1 = pair.token1.id.toLowerCase()
  const reserve0 = parseFloat(pair.reserve0)
  const reserve1 = parseFloat(pair.reserve1)

  if (tokenAddress === token0 && USD_QUOTE_TOKEN_SET.has(token1)) {
    const token0Price = parseFloat(pair.token0Price)
    return token0Price || (reserve0 > 0 ? reserve1 / reserve0 : 0)
  }

  if (tokenAddress === token1 && USD_QUOTE_TOKEN_SET.has(token0)) {
    const token1Price = parseFloat(pair.token1Price)
    return token1Price || (reserve1 > 0 ? reserve0 / reserve1 : 0)
  }

  return 0
}

const pickBestPairByToken = (pairs: PairMarketFields[], tokenAddresses: string[]) => {
  const tokenSet = new Set(tokenAddresses.map((address) => address.toLowerCase()))

  return pairs.reduce((accum: Record<string, PairMarketFields>, pair) => {
    const token0 = pair.token0.id.toLowerCase()
    const token1 = pair.token1.id.toLowerCase()
    const tokenAddress = tokenSet.has(token0) && USD_QUOTE_TOKEN_SET.has(token1) ? token0 : token1
    const previousPair = accum[tokenAddress]

    if (!previousPair || parseFloat(pair.reserveUSD) > parseFloat(previousPair.reserveUSD)) {
      accum[tokenAddress] = pair
    }

    return accum
  }, {})
}

const fetchPairDayVolumeData = async (
  chainName: MultiChainName,
  timestamp48hAgo: number,
  pairAddresses: string[],
) => {
  if (!pairAddresses.length) {
    return {}
  }

  try {
    const query = gql`
      query pairDayVolumes($pairIds: [Bytes!], $timestamp48hAgo: Int!) {
        pairDayDatas(
          first: 1000
          where: { pairAddress_in: $pairIds, date_gt: $timestamp48hAgo }
          orderBy: date
          orderDirection: desc
        ) {
          id
          date
          dailyVolumeUSD
          dailyVolumeToken
        }
      }
    `
    const { pairDayDatas } = await getMultiChainQueryEndPointWithStableSwap(
      chainName,
    ).request<PairDayDataQueryResponse>(query, {
      pairIds: Array.from(new Set(pairAddresses.map((address) => address.toLowerCase()))),
      timestamp48hAgo,
    })

    const groupedByPair = pairDayDatas.reduce((accum: Record<string, PairDayDataFields[]>, dayData) => {
      const pairAddress = dayData.id.split('-')[0].toLowerCase()
      if (!accum[pairAddress]) {
        accum[pairAddress] = []
      }
      accum[pairAddress].push(dayData)
      return accum
    }, {})

    return Object.keys(groupedByPair).reduce((accum: Record<string, { volumeUSD: number; volumeUSDChange: number }>, pairAddress) => {
      const [latest, previous] = groupedByPair[pairAddress].sort((a, b) => b.date - a.date)
      const volumeUSD = latest?.dailyVolumeUSD ? parseFloat(latest.dailyVolumeUSD) : 0
      const previousVolumeUSD = previous?.dailyVolumeUSD ? parseFloat(previous.dailyVolumeUSD) : 0

      accum[pairAddress] = {
        volumeUSD,
        volumeUSDChange: getPercentChange(volumeUSD, previousVolumeUSD),
      }

      return accum
    }, {})
  } catch (error) {
    console.info('Failed to fetch token pair day volume data', error)
    return {}
  }
}

const fetchPairSwapVolumeData = async (
  chainName: MultiChainName,
  timestamp24hAgo: number,
  timestamp48hAgo: number,
  pairAddresses: string[],
) => {
  if (!pairAddresses.length) {
    return {}
  }

  const pairIds = Array.from(new Set(pairAddresses.map((address) => address.toLowerCase())))
  const query = gql`
    query pairSwapVolumes($pairIds: [String!], $timestamp48hAgo: Int!, $first: Int!, $skip: Int!) {
      swaps(
        first: $first
        skip: $skip
        where: { pair_in: $pairIds, timestamp_gte: $timestamp48hAgo }
        orderBy: timestamp
        orderDirection: asc
      ) {
        id
        timestamp
        amountUSD
        pair {
          id
        }
      }
    }
  `
  const swaps: PairSwapFields[] = []
  const pageSize = 1000
  const maxPages = 5

  try {
    for (let page = 0; page < maxPages; page += 1) {
      // eslint-disable-next-line no-await-in-loop
      const response = await getMultiChainQueryEndPointWithStableSwap(chainName).request<PairSwapQueryResponse>(query, {
        pairIds,
        timestamp48hAgo,
        first: pageSize,
        skip: page * pageSize,
      })

      if (!response?.swaps?.length) {
        break
      }

      swaps.push(...response.swaps)

      if (response.swaps.length < pageSize) {
        break
      }
    }

    return swaps.reduce((accum: Record<string, { volumeUSD: number; volumeUSDChange: number }>, swap) => {
      const pairAddress = swap.pair.id.toLowerCase()
      const timestamp = parseInt(swap.timestamp)
      const amountUSD = parseFloat(swap.amountUSD)

      if (!accum[pairAddress]) {
        accum[pairAddress] = {
          volumeUSD: 0,
          volumeUSDChange: 0,
        }
      }

      if (!amountUSD || !timestamp) {
        return accum
      }

      if (timestamp >= timestamp24hAgo) {
        accum[pairAddress].volumeUSD += amountUSD
      } else {
        accum[pairAddress].volumeUSDChange += amountUSD
      }

      return accum
    }, {})
  } catch (error) {
    console.info('Failed to fetch token pair swap volume data', error)
    return {}
  }
}

const normalizeSwapVolumeChange = (pairSwapVolume: { volumeUSD: number; volumeUSDChange: number } | undefined) => {
  if (!pairSwapVolume) {
    return undefined
  }

  return {
    volumeUSD: pairSwapVolume.volumeUSD,
    volumeUSDChange: getPercentChange(pairSwapVolume.volumeUSD, pairSwapVolume.volumeUSDChange),
  }
}

const normalizeTokenDayVolume = (
  tokenDayVolume:
    | { volumeUSD: number; volumeUSDChange: number; volumeToken: number; previousVolumeToken: number }
    | undefined,
  priceUSD: number,
  priceUSDOneDay?: number,
) => {
  if (!tokenDayVolume) {
    return undefined
  }

  const convertedVolumeUSD = tokenDayVolume.volumeToken && priceUSD ? tokenDayVolume.volumeToken * priceUSD : 0
  const convertedPreviousVolumeUSD =
    tokenDayVolume.previousVolumeToken && (priceUSDOneDay || priceUSD)
      ? tokenDayVolume.previousVolumeToken * (priceUSDOneDay || priceUSD)
      : 0
  const volumeUSD = tokenDayVolume.volumeUSD || convertedVolumeUSD

  return {
    volumeUSD,
    volumeUSDChange:
      tokenDayVolume.volumeUSDChange || getPercentChange(volumeUSD, convertedPreviousVolumeUSD || undefined),
  }
}

const fetchTokenDayVolumeData = async (chainName: MultiChainName, tokenAddresses: string[]) => {
  if (!tokenAddresses.length) {
    return {}
  }

  try {
    const query = gql`
      query tokenDayVolumes($tokens: [String!]) {
        tokenDayDatas(
          first: 1000
          where: { token_in: $tokens }
          orderBy: date
          orderDirection: desc
        ) {
          id
          date
          dailyVolumeUSD
        }
      }
    `
    const { tokenDayDatas } = await getMultiChainQueryEndPointWithStableSwap(
      chainName,
    ).request<TokenDayVolumeQueryResponse>(query, {
      tokens: Array.from(new Set(tokenAddresses.map((address) => address.toLowerCase()))),
    })

    const groupedByToken = tokenDayDatas.reduce((accum: Record<string, TokenDayVolumeFields[]>, dayData) => {
      const tokenAddress = dayData.id.split('-')[0].toLowerCase()
      if (!accum[tokenAddress]) {
        accum[tokenAddress] = []
      }
      accum[tokenAddress].push(dayData)
      return accum
    }, {})

    return Object.keys(groupedByToken).reduce(
      (
        accum: Record<
          string,
          { volumeUSD: number; volumeUSDChange: number; volumeToken: number; previousVolumeToken: number }
        >,
        tokenAddress,
      ) => {
        const [latest, previous] = groupedByToken[tokenAddress].sort((a, b) => b.date - a.date)
        const volumeUSD = latest?.dailyVolumeUSD ? parseFloat(latest.dailyVolumeUSD) : 0
        const previousVolumeUSD = previous?.dailyVolumeUSD ? parseFloat(previous.dailyVolumeUSD) : 0
        const volumeToken = latest?.dailyVolumeToken ? parseFloat(latest.dailyVolumeToken) : 0
        const previousVolumeToken = previous?.dailyVolumeToken ? parseFloat(previous.dailyVolumeToken) : 0

        accum[tokenAddress] = {
          volumeUSD,
          volumeUSDChange: getPercentChange(volumeUSD, previousVolumeUSD),
          volumeToken,
          previousVolumeToken,
        }

        return accum
      },
      {},
    )
  } catch (error) {
    console.info('Failed to fetch token day volume data', error)
    return {}
  }
}

const fetchTokenMarketDataByAddresses = async (
  chainName: MultiChainName,
  block24h: number,
  block48h: number,
  timestamp24hAgo: number,
  timestamp48hAgo: number,
  tokenAddresses: string[],
) => {
  if (!tokenAddresses.length) {
    return {}
  }

  try {
    const query = gql`
      query tokenMarketPairs {
        ${getPairsForTokenMarket('now', null, tokenAddresses)}
        ${getPairsForTokenMarket('oneDayAgo', block24h, tokenAddresses)}
        ${getPairsForTokenMarket('twoDaysAgo', block48h, tokenAddresses)}
      }
    `

    const data = await getMultiChainQueryEndPointWithStableSwap(chainName).request<PairMarketQueryResponse>(query)

    const currentPairs = [...(data.nowToken0QuotePairs ?? []), ...(data.nowToken1QuotePairs ?? [])]
    const oneDayPairs = [...(data.oneDayAgoToken0QuotePairs ?? []), ...(data.oneDayAgoToken1QuotePairs ?? [])]
    const twoDayPairs = [...(data.twoDaysAgoToken0QuotePairs ?? []), ...(data.twoDaysAgoToken1QuotePairs ?? [])]
    const bestPairsByToken = pickBestPairByToken(currentPairs, tokenAddresses)
    const oneDayPairsById = oneDayPairs.reduce((accum: Record<string, PairMarketFields>, pair) => {
      accum[pair.id.toLowerCase()] = pair
      return accum
    }, {})
    const twoDayPairsById = twoDayPairs.reduce((accum: Record<string, PairMarketFields>, pair) => {
      accum[pair.id.toLowerCase()] = pair
      return accum
    }, {})
    const bestPairAddresses = Object.values(bestPairsByToken).map((pair) => pair.id)
    const pairDayVolumeByPair = await fetchPairDayVolumeData(chainName, timestamp48hAgo, bestPairAddresses)
    const pairSwapVolumeByPair = await fetchPairSwapVolumeData(
      chainName,
      timestamp24hAgo,
      timestamp48hAgo,
      bestPairAddresses,
    )
    const tokenDayVolumeByToken = await fetchTokenDayVolumeData(chainName, tokenAddresses)

    const marketDataByAddress = tokenAddresses.reduce((accum: Record<string, TokenChartData>, address) => {
      const normalizedAddress = address.toLowerCase()

      if (USD_QUOTE_TOKEN_SET.has(normalizedAddress)) {
        const tokenDayVolume = normalizeTokenDayVolume(tokenDayVolumeByToken[normalizedAddress], 1, 1)
        accum[normalizedAddress] = {
          priceUSD: 1,
          priceUSDChange: 0,
          volumeUSD: tokenDayVolume?.volumeUSD || 0,
          volumeUSDChange: tokenDayVolume?.volumeUSDChange || 0,
        }
        return accum
      }

      const currentPair = bestPairsByToken[normalizedAddress]
      if (!currentPair) {
        const tokenDayVolume = normalizeTokenDayVolume(tokenDayVolumeByToken[normalizedAddress], 0)
        if (tokenDayVolume) {
          accum[normalizedAddress] = {
            priceUSD: 0,
            priceUSDChange: 0,
            volumeUSD: tokenDayVolume.volumeUSD,
            volumeUSDChange: tokenDayVolume.volumeUSDChange,
          }
        }
        return accum
      }

      const pairId = currentPair.id.toLowerCase()
      const oneDayPair = oneDayPairsById[pairId]
      const twoDayPair = twoDayPairsById[pairId]
      const priceUSD = parsePairPriceForToken(currentPair, normalizedAddress)
      const priceUSDOneDay = oneDayPair ? parsePairPriceForToken(oneDayPair, normalizedAddress) : 0
      const [volumeUSD, volumeUSDChange] = getChangeForPeriod(
        parseFloat(currentPair.volumeUSD),
        oneDayPair ? parseFloat(oneDayPair.volumeUSD) : undefined,
        twoDayPair ? parseFloat(twoDayPair.volumeUSD) : undefined,
      )
      const pairDayVolume = pairDayVolumeByPair[pairId]
      const pairSwapVolume = normalizeSwapVolumeChange(pairSwapVolumeByPair[pairId])
      const tokenDayVolume = normalizeTokenDayVolume(tokenDayVolumeByToken[normalizedAddress], priceUSD, priceUSDOneDay)

      accum[normalizedAddress] = {
        priceUSD,
        priceUSDChange: getPercentChange(priceUSD, priceUSDOneDay),
        volumeUSD: pairSwapVolume?.volumeUSD || pairDayVolume?.volumeUSD || tokenDayVolume?.volumeUSD || volumeUSD,
        volumeUSDChange:
          pairSwapVolume?.volumeUSDChange ||
          pairDayVolume?.volumeUSDChange ||
          tokenDayVolume?.volumeUSDChange ||
          volumeUSDChange,
      }

      return accum
    }, {})

    console.info('[HotTokenList debug] pair market fallback result', {
      chainName,
      requestedAddresses: tokenAddresses.length,
      currentPairs: currentPairs.length,
      pairDayVolumes: Object.keys(pairDayVolumeByPair).length,
      pairSwapVolumes: Object.keys(pairSwapVolumeByPair).length,
      tokenDayVolumes: Object.keys(tokenDayVolumeByToken).length,
      tokenDayTokenVolumes: Object.values(tokenDayVolumeByToken).filter((volumeData) => volumeData.volumeToken > 0).length,
      tokensWithMarketData: Object.keys(marketDataByAddress).length,
      tokensWithVolumeData: Object.values(marketDataByAddress).filter((marketData) => marketData.volumeUSD > 0).length,
      samplePairs: currentPairs.slice(0, 5).map((pair) => ({
        id: pair.id,
        token0: pair.token0.id,
        token1: pair.token1.id,
        reserveUSD: pair.reserveUSD,
        token0Price: pair.token0Price,
        token1Price: pair.token1Price,
      })),
      sampleMarketData: Object.entries(marketDataByAddress).slice(0, 5),
    })

    return marketDataByAddress
  } catch (error) {
    console.info('Failed to fetch token pair market data', error)
    return {}
  }
}

// Transforms tokens into "0xADDRESS: { ...TokenFields }" format and cast strings to numbers
const parseTokenData = (tokens?: TokenFields[]) => {
  if (!tokens) {
    return {}
  }
  return tokens.reduce((accum: { [address: string]: FormattedTokenFields }, tokenData) => {
    const { derivedUSD, tradeVolumeUSD, totalTransactions, totalLiquidity, decimals } = tokenData
    accum[tokenData.id.toLowerCase()] = {
      ...tokenData,
      derivedUSD: parseFloat(derivedUSD),
      tradeVolumeUSD: parseFloat(tradeVolumeUSD),
      totalTransactions: parseFloat(totalTransactions),
      totalLiquidity: parseFloat(totalLiquidity),
      decimals: parseInt(decimals),
    }
    return accum
  }, {})
}

interface TokenDatas {
  error: boolean
  data?: {
    [address: string]: TokenData
  }
}

/**
 * Fetch top addresses by volume
 */
const useFetchedTokenDatas = (chainName: MultiChainName, tokenAddresses: string[]): TokenDatas => {
  const [fetchState, setFetchState] = useState<TokenDatas>({ error: false })
  const [t24h, t48h, t7d, t14d] = getDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24h, t48h, t7d, t14d])
  const [block24h, block48h, block7d, block14d] = blocks ?? []

  useEffect(() => {
    const fetch = async () => {
      const { error, data } = await fetchTokenData(
        chainName,
        block24h.number,
        block48h.number,
        block7d.number,
        block14d.number,
        tokenAddresses,
      )

      if (error) {
        setFetchState({ error: true })
      } else {
        const parsed = parseTokenData(data?.now)
        const parsed24 = parseTokenData(data?.oneDayAgo)
        const parsed48 = parseTokenData(data?.twoDaysAgo)
        const parsed7d = parseTokenData(data?.oneWeekAgo)
        const parsed14d = parseTokenData(data?.twoWeeksAgo)
        const marketDataByAddress = await fetchTokenMarketDataByAddresses(
          chainName,
          block24h.number,
          block48h.number,
          t24h,
          t48h,
          tokenAddresses,
        )

        // Calculate data and format
        const formatted = tokenAddresses.reduce((accum: { [address: string]: TokenData }, address) => {
          const normalizedAddress = address.toLowerCase()
          const current: FormattedTokenFields | undefined = parsed[normalizedAddress]
          const oneDay: FormattedTokenFields | undefined = parsed24[normalizedAddress]
          const twoDays: FormattedTokenFields | undefined = parsed48[normalizedAddress]
          const week: FormattedTokenFields | undefined = parsed7d[normalizedAddress]
          const twoWeeks: FormattedTokenFields | undefined = parsed14d[normalizedAddress]
          const marketData = marketDataByAddress[normalizedAddress]

          const [volumeUSDRaw, volumeUSDChange] = getChangeForPeriod(
            current?.tradeVolumeUSD,
            oneDay?.tradeVolumeUSD,
            twoDays?.tradeVolumeUSD,
          )
          const volumeUSD = marketData?.volumeUSD || volumeUSDRaw || current?.tradeVolumeUSD || 0
          const marketVolumeUSDChange = marketData?.volumeUSDChange || 0
          const [volumeUSDWeek] = getChangeForPeriod(
            current?.tradeVolumeUSD,
            week?.tradeVolumeUSD,
            twoWeeks?.tradeVolumeUSD,
          )
          const liquidityUSD = current ? current.totalLiquidity * current.derivedUSD : 0
          const liquidityUSDOneDayAgo = oneDay ? oneDay.totalLiquidity * oneDay.derivedUSD : 0
          const liquidityUSDChange = getPercentChange(liquidityUSD, liquidityUSDOneDayAgo)
          const liquidityToken = current ? current.totalLiquidity : 0
          // Prices of tokens for now, 24h ago and 7d ago
          const priceUSD = marketData?.priceUSD || (current ? current.derivedUSD : 0)
          const priceUSDOneDay = oneDay ? oneDay.derivedUSD : 0
          const priceUSDWeek = week ? week.derivedUSD : 0
          const priceUSDChange = marketData?.priceUSDChange || getPercentChange(priceUSD, priceUSDOneDay)
          const priceUSDChangeWeek = getPercentChange(priceUSD, priceUSDWeek)
          const txCount = getAmountChange(current?.totalTransactions, oneDay?.totalTransactions)

          accum[normalizedAddress] = {
            exists: !!current,
            address: normalizedAddress,
            name: current ? current.name : '',
            symbol: current ? current.symbol : '',
            volumeUSD,
            volumeUSDChange: marketVolumeUSDChange || volumeUSDChange,
            volumeUSDWeek,
            txCount,
            liquidityUSD,
            liquidityUSDChange,
            liquidityToken,
            priceUSD,
            priceUSDChange,
            priceUSDChangeWeek,
            decimals: current ? current.decimals : 18,
          }

          return accum
        }, {})
        setFetchState({ data: formatted, error: false })
      }
    }
    const allBlocksAvailable = block24h?.number && block48h?.number && block7d?.number && block14d?.number
    if (tokenAddresses.length > 0 && allBlocksAvailable && !blockError) {
      fetch()
    }
  }, [tokenAddresses, block24h, block48h, block7d, block14d, blockError, chainName, t24h, t48h])

  return fetchState
}

export const fetchAllTokenDataByAddresses = async (
  chainName: MultiChainName,
  blocks: Block[],
  tokenAddresses: string[],
) => {
  const [block24h, block48h, block7d, block14d] = blocks ?? []

  const { data } = await fetchTokenData(
    chainName,
    block24h.number,
    block48h.number,
    block7d.number,
    block14d.number,
    tokenAddresses,
  )

  const parsed = parseTokenData(data?.now)
  const parsed24 = parseTokenData(data?.oneDayAgo)
  const parsed48 = parseTokenData(data?.twoDaysAgo)
  const parsed7d = parseTokenData(data?.oneWeekAgo)
  const parsed14d = parseTokenData(data?.twoWeeksAgo)
  const marketDataByAddress = await fetchTokenMarketDataByAddresses(
    chainName,
    block24h.number,
    block48h.number,
    Number(block24h.timestamp),
    Number(block48h.timestamp),
    tokenAddresses,
  )

  // Calculate data and format
  const formatted = tokenAddresses.reduce((accum: { [address: string]: { data: TokenData } }, address) => {
    const normalizedAddress = address.toLowerCase()
    const current: FormattedTokenFields | undefined = parsed[normalizedAddress]
    const oneDay: FormattedTokenFields | undefined = parsed24[normalizedAddress]
    const twoDays: FormattedTokenFields | undefined = parsed48[normalizedAddress]
    const week: FormattedTokenFields | undefined = parsed7d[normalizedAddress]
    const twoWeeks: FormattedTokenFields | undefined = parsed14d[normalizedAddress]
    const marketData = marketDataByAddress[normalizedAddress]

    const [volumeUSDRaw, volumeUSDChange] = getChangeForPeriod(
      current?.tradeVolumeUSD,
      oneDay?.tradeVolumeUSD,
      twoDays?.tradeVolumeUSD,
    )
    const volumeUSD = marketData?.volumeUSD || volumeUSDRaw || current?.tradeVolumeUSD || 0
    const marketVolumeUSDChange = marketData?.volumeUSDChange || 0
    const [volumeUSDWeek] = getChangeForPeriod(current?.tradeVolumeUSD, week?.tradeVolumeUSD, twoWeeks?.tradeVolumeUSD)
    const liquidityUSD = current ? current.totalLiquidity * current.derivedUSD : 0
    const liquidityUSDOneDayAgo = oneDay ? oneDay.totalLiquidity * oneDay.derivedUSD : 0
    const liquidityUSDChange = getPercentChange(liquidityUSD, liquidityUSDOneDayAgo)
    const liquidityToken = current ? current.totalLiquidity : 0
    // Prices of tokens for now, 24h ago and 7d ago
    const priceUSD = marketData?.priceUSD || (current ? current.derivedUSD : 0)
    const decimals = current ? current.decimals : 0
    const priceUSDOneDay = oneDay ? oneDay.derivedUSD : 0
    const priceUSDWeek = week ? week.derivedUSD : 0
    const priceUSDChange = marketData?.priceUSDChange || getPercentChange(priceUSD, priceUSDOneDay)
    const priceUSDChangeWeek = getPercentChange(priceUSD, priceUSDWeek)
    const txCount = getAmountChange(current?.totalTransactions, oneDay?.totalTransactions)

    accum[normalizedAddress] = {
      data: {
        exists: !!current,
        address: normalizedAddress,
        name: current ? current.name : '',
        symbol: current ? current.symbol : '',
        volumeUSD,
        volumeUSDChange: marketVolumeUSDChange || volumeUSDChange,
        volumeUSDWeek,
        txCount,
        liquidityUSD,
        liquidityUSDChange,
        liquidityToken,
        priceUSD,
        priceUSDChange,
        priceUSDChangeWeek,
        decimals,
      },
    }
    return accum
  }, {})

  return formatted
}

export const fetchAllTokenData = async (chainName: MultiChainName, blocks: Block[]) => {
  const tokenAddresses = await fetchTokenAddresses(chainName)
  const data = await fetchAllTokenDataByAddresses(chainName, blocks, tokenAddresses)
  return data
}

export default useFetchedTokenDatas
