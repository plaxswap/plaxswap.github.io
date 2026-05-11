import requestWithTimeout from 'utils/requestWithTimeout'
import { infoClient, stableSwapClient } from 'utils/graphql'
import lastPairDayId from '../queries/lastPairDayId'
import pairHourDatas, { stableSwapPairHourDatas } from '../queries/pairHourDatas'
import pairDayDatasByIdsQuery, { stableSwapPairDayDatasByIdsQuery } from '../queries/pairDayDatasByIdsQuery'
import { PairDataTimeWindowEnum } from '../types'
import { timeWindowIdsCountMapping } from './constants'
import {
  fetchPairDataParams,
  LastPairDayIdResponse,
  LastPairHourIdResponse,
  PairDayDatasResponse,
  PairHoursDatasResponse,
} from './types'
import { getIdsByTimeWindow, getPairSequentialId } from './utils'
import pairDayDatas, { stableSwapPairDayDatas } from '../queries/pairDayDatas'
import pairHourDatasByIds, { stableSwapPairHourDatasByIds } from '../queries/pairHourDatasByIds'
import lastPairHourId from '../queries/lastPairHourId'

const isRateLimitedError = (error: unknown) => {
  const status = (error as any)?.response?.status
  const message = error instanceof Error ? error.message : String(error)
  return status === 429 || message.includes('429') || message.toLowerCase().includes('too many requests')
}

const fetchPairPriceData = async ({ pairId, timeWindow, isStableSwap }: fetchPairDataParams) => {
  const client = isStableSwap ? stableSwapClient : infoClient

  try {
    switch (timeWindow) {
      case PairDataTimeWindowEnum.DAY: {
        const data = await requestWithTimeout<PairHoursDatasResponse>(
          client,
          isStableSwap ? stableSwapPairHourDatas : pairHourDatas,
          {
            pairId,
            first: timeWindowIdsCountMapping[timeWindow],
          },
        )
        return { data, error: false }
      }
      case PairDataTimeWindowEnum.WEEK: {
        const lastPairHourIdData = await requestWithTimeout<LastPairHourIdResponse>(client, lastPairHourId, { pairId })
        const lastId = lastPairHourIdData?.pairHourDatas ? lastPairHourIdData.pairHourDatas[0]?.id : null
        if (!lastId) {
          return { data: { pairHourDatas: [] }, error: false }
        }
        const pairHourId = getPairSequentialId({ id: lastId, pairId })
        const pairHourIds = getIdsByTimeWindow({
          pairAddress: pairId,
          pairLastId: pairHourId,
          timeWindow,
          idsCount: timeWindowIdsCountMapping[timeWindow],
        })

        const pairHoursData = await requestWithTimeout<PairHoursDatasResponse>(
          client,
          isStableSwap ? stableSwapPairHourDatasByIds : pairHourDatasByIds,
          {
            pairIds: pairHourIds,
          },
        )
        return { data: pairHoursData, error: false }
      }
      case PairDataTimeWindowEnum.MONTH: {
        const data = await requestWithTimeout<PairHoursDatasResponse>(
          client,
          isStableSwap ? stableSwapPairDayDatas : pairDayDatas,
          {
            pairId,
            first: timeWindowIdsCountMapping[timeWindow],
          },
        )
        return { data, error: false }
      }
      case PairDataTimeWindowEnum.YEAR: {
        const lastPairDayIdData = await requestWithTimeout<LastPairDayIdResponse>(client, lastPairDayId, { pairId })
        const lastId = lastPairDayIdData?.pairDayDatas ? lastPairDayIdData.pairDayDatas[0]?.id : null
        if (!lastId) {
          return { data: { pairDayDatas: [] }, error: false }
        }
        const pairLastId = getPairSequentialId({ id: lastId, pairId })
        const pairDayIds = getIdsByTimeWindow({
          pairAddress: pairId,
          pairLastId,
          timeWindow,
          idsCount: timeWindowIdsCountMapping[timeWindow],
        })
        const pairDayData = await requestWithTimeout<PairDayDatasResponse>(
          client,
          isStableSwap ? stableSwapPairDayDatasByIdsQuery : pairDayDatasByIdsQuery,
          {
            pairIds: pairDayIds,
          },
        )
        return { data: pairDayData, error: false }
      }
      default:
        return { data: null, error: false }
    }
  } catch (error) {
    if (isRateLimitedError(error)) {
      console.warn('Price chart data is rate limited by the subgraph', { pairId, timeWindow })
      return { error: true, rateLimited: true }
    }
    console.error('Failed to fetch price chart data', error)
    return { error: true }
  }
}

export default fetchPairPriceData
