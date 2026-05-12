/* eslint-disable no-param-reassign */
import { gql } from 'graphql-request'
import { useEffect, useState } from 'react'
import { Block, PoolData } from 'state/info/types'
import { getChangeForPeriod } from 'utils/getChangeForPeriod'
import { getDeltaTimestamps } from 'utils/getDeltaTimestamps'
import { getLpFeesAndApr } from 'utils/getLpFeesAndApr'
import { useBlocksFromTimestamps } from 'views/Info/hooks/useBlocksFromTimestamps'
import { getPercentChange, getAmountChange } from 'views/Info/utils/infoDataHelpers'

import {
  getMultiChainQueryEndPointWithStableSwap,
  MultiChainName,
  checkIsStableSwap,
} from '../../constant'
import { useGetChainName } from '../../hooks'
import { fetchTopPoolAddresses } from './topPools'

interface PoolFields {
  id: string
  reserve0: string
  reserve1: string
  reserveUSD: string
  volumeUSD: string
  volumeOutUSD?: string
  token0Price: string
  token1Price: string
  token0?: {
    id: string
    symbol: string
    name: string
  }
  token1?: {
    id: string
    symbol: string
    name: string
  }
}

export interface FormattedPoolFields
  extends Omit<
    PoolFields,
    'volumeUSD' | 'reserveUSD' | 'reserve0' | 'reserve1' | 'token0Price' | 'token1Price' | 'volumeOutUSD'
  > {
  volumeUSD: number
  reserveUSD: number
  reserve0: number
  reserve1: number
  token0Price: number
  token1Price: number
  volumeOutUSD?: number
}

interface PoolsQueryResponse {
  now: PoolFields[]
  oneDayAgo: PoolFields[]
  twoDaysAgo: PoolFields[]
  oneWeekAgo: PoolFields[]
  twoWeeksAgo: PoolFields[]
}

interface PoolSwapFields {
  timestamp: string
  amount0In: string
  amount0Out: string
  amount1In: string
  amount1Out: string
  pair: {
    id: string
    token0: {
      id: string
    }
    token1: {
      id: string
    }
  }
}

interface PoolSwapQueryResponse {
  swaps: PoolSwapFields[]
}

const USD_QUOTE_TOKEN_ADDRESSES = new Set([
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC.e
  '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', // native USDC
  '0x9c9e5fd8bbc25984b178fdce6117defa39d2db39', // BUSD
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // DAI
])

/**
 * Data for displaying pool tables (on multiple pages, used throughout the site)
 * Note: Don't try to refactor it to use variables, server throws error if blocks passed as undefined variable
 * only works if its hard-coded into query string
 */
const POOL_AT_BLOCK = (block: number | null, pools: string[]) => {
  const blockString = block ? `block: {number: ${block}}` : ``
  const addressesString = `["${pools.join('","')}"]`
  const volumeOutUSDString = checkIsStableSwap() ? 'volumeOutUSD' : ''

  return `pairs(
    where: { id_in: ${addressesString} }
    ${blockString}
    orderBy: reserveUSD
    orderDirection: desc
  ) {
    id
    reserve0
    reserve1
    reserveUSD
    volumeUSD
    ${volumeOutUSDString}
    token0Price
    token1Price
    token0 {
      id
      symbol
      name
    }
    token1 {
      id
      symbol
      name
    }
  }`
}

export const fetchPoolData = async (
  block24h: number,
  block48h: number,
  block7d: number,
  block14d: number,
  poolAddresses: string[],
  chainName: 'ETH' | 'BSC' = 'BSC',
) => {
  try {
    const query = gql`
      query pools {
        now: ${POOL_AT_BLOCK(null, poolAddresses)}
        oneDayAgo: ${POOL_AT_BLOCK(block24h, poolAddresses)}
        twoDaysAgo: ${POOL_AT_BLOCK(block48h, poolAddresses)}
        oneWeekAgo: ${POOL_AT_BLOCK(block7d, poolAddresses)}
        twoWeeksAgo: ${POOL_AT_BLOCK(block14d, poolAddresses)}
      }
    `
    const data = await getMultiChainQueryEndPointWithStableSwap(chainName).request<PoolsQueryResponse>(query)
    return { data, error: false }
  } catch (error) {
    console.error('Failed to fetch pool data', error)
    return { error: true }
  }
}

// Transforms pools into "0xADDRESS: { ...PoolFields }" format and cast strings to numbers
export const parsePoolData = (pairs?: PoolFields[]) => {
  if (!pairs) {
    return {}
  }
  return pairs.reduce((accum: { [address: string]: FormattedPoolFields }, poolData) => {
    const { volumeUSD, reserveUSD, reserve0, reserve1, token0Price, token1Price, volumeOutUSD } = poolData
    accum[poolData.id.toLowerCase()] = {
      ...poolData,
      volumeUSD: parseFloat(volumeUSD),
      volumeOutUSD: volumeOutUSD && parseFloat(volumeOutUSD),
      reserveUSD: parseFloat(reserveUSD),
      reserve0: parseFloat(reserve0),
      reserve1: parseFloat(reserve1),
      token0Price: parseFloat(token0Price),
      token1Price: parseFloat(token1Price),
    }
    return accum
  }, {})
}

const getUsdReserve = (pool?: FormattedPoolFields) => {
  if (!pool?.token0?.id || !pool?.token1?.id) {
    return 0
  }

  if (USD_QUOTE_TOKEN_ADDRESSES.has(pool.token0.id.toLowerCase())) {
    return pool.reserve0
  }

  if (USD_QUOTE_TOKEN_ADDRESSES.has(pool.token1.id.toLowerCase())) {
    return pool.reserve1
  }

  return 0
}

const getPoolLiquidityUSD = (pool?: FormattedPoolFields) => {
  if (!pool) {
    return 0
  }

  return pool.reserveUSD || getUsdReserve(pool) * 2
}

const getSwapUsdAmount = (swap: PoolSwapFields) => {
  const token0 = swap.pair.token0.id.toLowerCase()
  const token1 = swap.pair.token1.id.toLowerCase()

  if (USD_QUOTE_TOKEN_ADDRESSES.has(token0)) {
    return Math.abs(parseFloat(swap.amount0In) - parseFloat(swap.amount0Out))
  }

  if (USD_QUOTE_TOKEN_ADDRESSES.has(token1)) {
    return Math.abs(parseFloat(swap.amount1In) - parseFloat(swap.amount1Out))
  }

  return 0
}

const fetchPoolSwapVolumeData = async (
  chainName: MultiChainName,
  timestamp24hAgo: number,
  timestamp48hAgo: number,
  timestamp7dAgo: number,
  poolAddresses: string[],
) => {
  const pairIds = Array.from(new Set(poolAddresses.map((address) => address.toLowerCase())))

  if (!pairIds.length) {
    return {}
  }

  const query = gql`
    query poolSwapVolumes($pairIds: [String!], $timestamp7dAgo: Int!, $first: Int!, $skip: Int!) {
      swaps(
        first: $first
        skip: $skip
        where: { pair_in: $pairIds, timestamp_gte: $timestamp7dAgo }
        orderBy: timestamp
        orderDirection: asc
      ) {
        timestamp
        amount0In
        amount0Out
        amount1In
        amount1Out
        pair {
          id
          token0 {
            id
          }
          token1 {
            id
          }
        }
      }
    }
  `
  const swaps: PoolSwapFields[] = []
  const pageSize = 1000
  const maxPages = 5

  try {
    for (let page = 0; page < maxPages; page += 1) {
      // eslint-disable-next-line no-await-in-loop
      const response = await getMultiChainQueryEndPointWithStableSwap(chainName).request<PoolSwapQueryResponse>(query, {
        pairIds,
        timestamp7dAgo,
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

    return swaps.reduce(
      (
        accum: Record<string, { volumeUSD: number; previousVolumeUSD: number; volumeUSDWeek: number }>,
        swap,
      ) => {
        const pairAddress = swap.pair.id.toLowerCase()
        const timestamp = parseInt(swap.timestamp)
        const amountUSD = getSwapUsdAmount(swap)

        if (!accum[pairAddress]) {
          accum[pairAddress] = {
            volumeUSD: 0,
            previousVolumeUSD: 0,
            volumeUSDWeek: 0,
          }
        }

        if (!amountUSD || !timestamp) {
          return accum
        }

        accum[pairAddress].volumeUSDWeek += amountUSD

        if (timestamp >= timestamp24hAgo) {
          accum[pairAddress].volumeUSD += amountUSD
        } else if (timestamp >= timestamp48hAgo) {
          accum[pairAddress].previousVolumeUSD += amountUSD
        }

        return accum
      },
      {},
    )
  } catch (error) {
    console.info('Failed to fetch pool swap volume data', error)
    return {}
  }
}

interface PoolDatas {
  error: boolean
  data?: {
    [address: string]: PoolData
  }
}

/**
 * Fetch top pools by liquidity
 */
const usePoolDatas = (poolAddresses: string[]): PoolDatas => {
  const [fetchState, setFetchState] = useState<PoolDatas>({ error: false })
  const [t24h, t48h, t7d, t14d] = getDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24h, t48h, t7d, t14d])
  const [block24h, block48h, block7d, block14d] = blocks ?? []
  const chainName = useGetChainName()

  useEffect(() => {
    const fetch = async () => {
      const { error, data } = await fetchPoolData(
        block24h.number,
        block48h.number,
        block7d.number,
        block14d.number,
        poolAddresses,
        chainName,
      )
      if (error) {
        setFetchState({ error: true })
      } else {
        const formattedPoolData = parsePoolData(data?.now)
        const formattedPoolData24h = parsePoolData(data?.oneDayAgo)
        const formattedPoolData48h = parsePoolData(data?.twoDaysAgo)
        const formattedPoolData7d = parsePoolData(data?.oneWeekAgo)
        const formattedPoolData14d = parsePoolData(data?.twoWeeksAgo)
        const swapVolumeByPool = await fetchPoolSwapVolumeData(chainName, t24h, t48h, t7d, poolAddresses)

        // Calculate data and format
        const formatted = poolAddresses.reduce((accum: { [address: string]: PoolData }, address) => {
          // Undefined data is possible if pool is brand new and didn't exist one day ago or week ago.
          const current: FormattedPoolFields | undefined = formattedPoolData[address]
          const oneDay: FormattedPoolFields | undefined = formattedPoolData24h[address]
          const twoDays: FormattedPoolFields | undefined = formattedPoolData48h[address]
          const week: FormattedPoolFields | undefined = formattedPoolData7d[address]
          const twoWeeks: FormattedPoolFields | undefined = formattedPoolData14d[address]
          const swapVolume = swapVolumeByPool[address]

          const [volumeUSDRaw, volumeUSDChangeRaw] = getChangeForPeriod(
            current?.volumeUSD,
            oneDay?.volumeUSD,
            twoDays?.volumeUSD,
          )
          const [volumeUSDWeekRaw, volumeUSDChangeWeek] = getChangeForPeriod(
            current?.volumeUSD,
            week?.volumeUSD,
            twoWeeks?.volumeUSD,
          )
          const volumeUSD = volumeUSDRaw || swapVolume?.volumeUSD || 0
          const volumeUSDChange =
            volumeUSDChangeRaw || getPercentChange(swapVolume?.volumeUSD, swapVolume?.previousVolumeUSD)
          const volumeUSDWeek = volumeUSDWeekRaw || swapVolume?.volumeUSDWeek || 0

          const liquidityUSD = getPoolLiquidityUSD(current)

          const liquidityUSDChange = getPercentChange(liquidityUSD, getPoolLiquidityUSD(oneDay))

          const liquidityToken0 = current ? current.reserve0 : 0
          const liquidityToken1 = current ? current.reserve1 : 0

          const { totalFees24h, totalFees7d, lpFees24h, lpFees7d, lpApr7d } = getLpFeesAndApr(
            volumeUSD,
            volumeUSDWeek,
            liquidityUSD,
          )

          if (current) {
            accum[address] = {
              address,
              token0: {
                address: current.token0.id,
                name: current.token0.name,
                symbol: current.token0.symbol,
              },
              token1: {
                address: current.token1.id,
                name: current.token1.name,
                symbol: current.token1.symbol,
              },
              token0Price: current.token0Price,
              token1Price: current.token1Price,
              volumeUSD,
              volumeUSDChange,
              volumeUSDWeek,
              volumeUSDChangeWeek,
              totalFees24h,
              totalFees7d,
              lpFees24h,
              lpFees7d,
              lpApr7d,
              liquidityUSD,
              liquidityUSDChange,
              liquidityToken0,
              liquidityToken1,
            }
          }

          return accum
        }, {})
        setFetchState({ data: formatted, error: false })
      }
    }

    const allBlocksAvailable = block24h?.number && block48h?.number && block7d?.number && block14d?.number
    if (poolAddresses.length > 0 && allBlocksAvailable && !blockError) {
      fetch()
    }
  }, [poolAddresses, block24h, block48h, block7d, block14d, blockError, chainName, t24h, t48h, t7d])

  return fetchState
}

export const fetchAllPoolDataWithAddress = async (
  blocks: Block[],
  chainName: MultiChainName,
  poolAddresses: string[],
) => {
  const [block24h, block48h, block7d, block14d] = blocks ?? []

  const { data } = await fetchPoolData(
    block24h.number,
    block48h.number,
    block7d.number,
    block14d.number,
    poolAddresses,
    chainName,
  )

  const formattedPoolData = parsePoolData(data?.now)
  const formattedPoolData24h = parsePoolData(data?.oneDayAgo)
  const formattedPoolData48h = parsePoolData(data?.twoDaysAgo)
  const formattedPoolData7d = parsePoolData(data?.oneWeekAgo)
  const formattedPoolData14d = parsePoolData(data?.twoWeeksAgo)
  const swapVolumeByPool = await fetchPoolSwapVolumeData(
    chainName,
    Number(block24h.timestamp),
    Number(block48h.timestamp),
    Number(block7d.timestamp),
    poolAddresses,
  )

  // Calculate data and format
  const formatted = poolAddresses.reduce((accum: { [address: string]: { data: PoolData } }, address) => {
    // Undefined data is possible if pool is brand new and didn't exist one day ago or week ago.
    const current: FormattedPoolFields | undefined = formattedPoolData[address]
    const oneDay: FormattedPoolFields | undefined = formattedPoolData24h[address]
    const twoDays: FormattedPoolFields | undefined = formattedPoolData48h[address]
    const week: FormattedPoolFields | undefined = formattedPoolData7d[address]
    const twoWeeks: FormattedPoolFields | undefined = formattedPoolData14d[address]
    const swapVolume = swapVolumeByPool[address]

    const [volumeUSDRaw, volumeUSDChangeRaw] = getChangeForPeriod(
      current?.volumeUSD,
      oneDay?.volumeUSD,
      twoDays?.volumeUSD,
    )
    const volumeOutUSD = current?.volumeOutUSD && getAmountChange(current?.volumeOutUSD, oneDay?.volumeOutUSD)
    const volumeOutUSDWeek = current?.volumeOutUSD && getAmountChange(current?.volumeOutUSD, week?.volumeOutUSD)
    const [volumeUSDWeekRaw, volumeUSDChangeWeek] = getChangeForPeriod(
      current?.volumeUSD,
      week?.volumeUSD,
      twoWeeks?.volumeUSD,
    )
    const volumeUSD = volumeUSDRaw || swapVolume?.volumeUSD || 0
    const volumeUSDChange =
      volumeUSDChangeRaw || getPercentChange(swapVolume?.volumeUSD, swapVolume?.previousVolumeUSD)
    const volumeUSDWeek = volumeUSDWeekRaw || swapVolume?.volumeUSDWeek || 0

    const liquidityUSD = getPoolLiquidityUSD(current)

    const liquidityUSDChange = getPercentChange(liquidityUSD, getPoolLiquidityUSD(oneDay))

    const liquidityToken0 = current ? current.reserve0 : 0
    const liquidityToken1 = current ? current.reserve1 : 0

    const { totalFees24h, totalFees7d, lpFees24h, lpFees7d, lpApr7d } = getLpFeesAndApr(
      volumeUSD,
      volumeUSDWeek,
      liquidityUSD,
    )

    if (current) {
      accum[address] = {
        data: {
          address,
          token0: {
            address: current.token0.id,
            name: current.token0.name,
            symbol: current.token0.symbol,
          },
          token1: {
            address: current.token1.id,
            name: current.token1.name,
            symbol: current.token1.symbol,
          },
          token0Price: current.token0Price,
          token1Price: current.token1Price,
          volumeUSD,
          volumeUSDChange,
          volumeUSDWeek,
          volumeUSDChangeWeek,
          totalFees24h,
          totalFees7d,
          lpFees24h,
          lpFees7d,
          lpApr7d,
          liquidityUSD,
          liquidityUSDChange,
          liquidityToken0,
          liquidityToken1,
          volumeOutUSD,
          volumeOutUSDWeek,
        },
      }
    }

    return accum
  }, {})
  return formatted
}

export const fetchAllPoolData = async (blocks: Block[], chainName: MultiChainName) => {
  const poolAddresses = await fetchTopPoolAddresses(chainName)
  return fetchAllPoolDataWithAddress(blocks, chainName, poolAddresses)
}

export default usePoolDatas
