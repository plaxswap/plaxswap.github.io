import { getUnixTime, startOfHour, sub } from 'date-fns'
import { ONE_DAY_UNIX, ONE_HOUR_SECONDS } from 'config/constants/info'
import requestWithTimeout from 'utils/requestWithTimeout'
import { infoClient } from 'utils/graphql'
import { PairCandlesNormalized, PairDataTimeWindowEnum } from '../types'
import pairSwapDatas from '../queries/pairSwapDatas'

const PAGE_SIZE = 1000
const MAX_PAGES = 5

type SwapData = {
  id: string
  timestamp: string
  amount0In: string
  amount1In: string
  amount0Out: string
  amount1Out: string
  pair: {
    token0: {
      id: string
    }
    token1: {
      id: string
    }
  }
}

type PairSwapDatasResponse = {
  swaps: SwapData[]
}

const getInterval = (timeWindow: PairDataTimeWindowEnum) => {
  switch (timeWindow) {
    case PairDataTimeWindowEnum.DAY:
      return ONE_HOUR_SECONDS
    case PairDataTimeWindowEnum.WEEK:
      return ONE_HOUR_SECONDS * 4
    case PairDataTimeWindowEnum.MONTH:
      return ONE_DAY_UNIX
    case PairDataTimeWindowEnum.YEAR:
      return ONE_DAY_UNIX * 15
    default:
      return ONE_HOUR_SECONDS * 4
  }
}

const getSkipDaysToStart = (timeWindow: PairDataTimeWindowEnum) => {
  switch (timeWindow) {
    case PairDataTimeWindowEnum.DAY:
      return 1
    case PairDataTimeWindowEnum.WEEK:
      return 7
    case PairDataTimeWindowEnum.MONTH:
      return 30
    case PairDataTimeWindowEnum.YEAR:
      return 365
    default:
      return 7
  }
}

const getSwapPrice = (swap: SwapData, activeToken: string) => {
  const token0Amount = Number(swap.amount0In) > 0 ? Number(swap.amount0In) : Number(swap.amount0Out)
  const token1Amount = Number(swap.amount1In) > 0 ? Number(swap.amount1In) : Number(swap.amount1Out)

  if (!token0Amount || !token1Amount) {
    return null
  }

  return activeToken === swap.pair.token0.id.toLowerCase() ? token1Amount / token0Amount : token0Amount / token1Amount
}

const normalizeSwapsToCandles = (
  swaps: SwapData[],
  activeToken: string,
  interval: number,
): PairCandlesNormalized => {
  const buckets = new Map<number, { open: number; high: number; low: number; close: number }>()

  swaps.forEach((swap) => {
    const timestamp = Number(swap.timestamp)
    const price = getSwapPrice(swap, activeToken)

    if (!timestamp || !price || price === Infinity || Number.isNaN(price)) {
      return
    }

    const bucketTime = Math.floor(timestamp / interval) * interval
    const candle = buckets.get(bucketTime)

    if (!candle) {
      buckets.set(bucketTime, {
        open: price,
        high: price,
        low: price,
        close: price,
      })
      return
    }

    candle.high = Math.max(candle.high, price)
    candle.low = Math.min(candle.low, price)
    candle.close = price
  })

  return Array.from(buckets.entries()).map(([time, candle]) => ({
    time,
    ...candle,
  }))
}

const fetchPairCandleData = async (
  pairId: string,
  activeToken: string,
  timeWindow: PairDataTimeWindowEnum,
): Promise<PairCandlesNormalized> => {
  const activeTokenAddress = activeToken.toLowerCase()
  const interval = getInterval(timeWindow)
  const endTimestamp = getUnixTime(new Date())
  const startTimestamp = getUnixTime(startOfHour(sub(endTimestamp * 1000, { days: getSkipDaysToStart(timeWindow) })))
  const swaps: SwapData[] = []

  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      // eslint-disable-next-line no-await-in-loop
      const response = await requestWithTimeout<PairSwapDatasResponse>(infoClient, pairSwapDatas, {
        pairId,
        timestampGte: startTimestamp,
        first: PAGE_SIZE,
        skip: page * PAGE_SIZE,
      })

      if (!response?.swaps?.length) {
        break
      }

      swaps.push(...response.swaps)

      if (response.swaps.length < PAGE_SIZE) {
        break
      }
    }

    return normalizeSwapsToCandles(swaps, activeTokenAddress, interval)
  } catch (error) {
    console.error('Failed to fetch candle price data for chart', error)
    return []
  }
}

export default fetchPairCandleData
