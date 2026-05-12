/* eslint-disable no-await-in-loop */
import { gql } from 'graphql-request'
import { useEffect, useState } from 'react'
import { ChartEntry } from 'state/info/types'
import { fetchChartData, mapDayData } from '../helpers'
import { PancakeDayDatasResponse, PairDayDatasResponse } from '../types'
import {
  MultiChainName,
  checkIsStableSwap,
  getMultiChainQueryEndPointWithStableSwap,
  multiChainStartTime,
} from '../../constant'
import { useGetChainName } from '../../hooks'

/**
 * Data for displaying Liquidity and Volume charts on Overview page
 */
const PANCAKE_DAY_DATAS = gql`
  query overviewCharts($startTime: Int!, $skip: Int!) {
    pancakeDayDatas(first: 1000, skip: $skip, where: { date_gt: $startTime }, orderBy: date, orderDirection: asc) {
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`

const STABLE_PAIR_DAY_DATAS = gql`
  query stableOverviewCharts($startTime: Int!, $skip: Int!) {
    pairDayDatas(first: 1000, skip: $skip, where: { date_gt: $startTime }, orderBy: date, orderDirection: asc) {
      date
      dailyVolumeUSD
      reserveUSD
    }
  }
`

const getOverviewChartData = async (
  chainName: MultiChainName,
  skip: number,
): Promise<{ data?: ChartEntry[]; error: boolean }> => {
  try {
    if (checkIsStableSwap()) {
      const { pairDayDatas } = await getMultiChainQueryEndPointWithStableSwap(chainName).request<PairDayDatasResponse>(
        STABLE_PAIR_DAY_DATAS,
        {
          startTime: multiChainStartTime[chainName],
          skip,
        },
      )
      const dataByDate = pairDayDatas.reduce((accum: Record<number, ChartEntry>, dayData) => {
        const { date } = dayData
        const current = accum[date] ?? {
          date,
          volumeUSD: 0,
          liquidityUSD: 0,
        }

        return {
          ...accum,
          [date]: {
            date,
            volumeUSD: current.volumeUSD + parseFloat(dayData.dailyVolumeUSD),
            liquidityUSD: current.liquidityUSD + parseFloat(dayData.reserveUSD),
          },
        }
      }, {})

      return { data: Object.values(dataByDate), error: false }
    }

    const { pancakeDayDatas } = await getMultiChainQueryEndPointWithStableSwap(
      chainName,
    ).request<PancakeDayDatasResponse>(PANCAKE_DAY_DATAS, {
      startTime: multiChainStartTime[chainName],
      skip,
    })
    const data = pancakeDayDatas.map(mapDayData)
    return { data, error: false }
  } catch (error) {
    console.error('Failed to fetch overview chart data', error)
    return { error: true }
  }
}

/**
 * Fetch historic chart data
 */
const useFetchGlobalChartData = (): {
  error: boolean
  data: ChartEntry[] | undefined
} => {
  const [overviewChartData, setOverviewChartData] = useState<ChartEntry[] | undefined>()
  const [error, setError] = useState(false)
  const chainName = useGetChainName()

  useEffect(() => {
    const fetch = async () => {
      const { data } = await fetchChartData(chainName, getOverviewChartData)
      if (data) {
        setOverviewChartData(data)
      } else {
        setError(true)
      }
    }
    if (!overviewChartData && !error) {
      fetch()
    }
  }, [overviewChartData, error, chainName])

  return {
    error,
    data: overviewChartData,
  }
}

export const fetchGlobalChartData = async (chainName: MultiChainName) => {
  const { data } = await fetchChartData(chainName, getOverviewChartData)
  return data
}

export default useFetchGlobalChartData
