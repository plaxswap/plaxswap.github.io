import { gql } from 'graphql-request'
import { useEffect, useState } from 'react'
import { getDeltaTimestamps } from 'utils/getDeltaTimestamps'
import {
  checkIsStableSwap,
  getMultiChainQueryEndPointWithStableSwap,
  MultiChainName,
  multiChainTokenBlackList,
} from '../../constant'
import { useGetChainName } from '../../hooks'

interface TopPoolsResponse {
  pairDayDatas: {
    id: string
  }[]
}

interface TopPairsResponse {
  pairs: {
    id: string
  }[]
}

interface TopSwapsResponse {
  swaps: {
    pair: {
      id: string
    }
  }[]
}

const isAddress = (value: string) => /^0x[a-f0-9]{40}$/i.test(value)

/**
 * Initial pools to display on the home page
 */
const fetchTopPools = async (chainName: MultiChainName, timestamp24hAgo: number): Promise<string[]> => {
  const isStableSwap = checkIsStableSwap()
  const firstCount = isStableSwap ? 100 : 30
  let whereCondition =
    chainName === 'BSC'
      ? `where: { dailyTxns_gt: 300, token0_not_in: $blacklist, token1_not_in: $blacklist, date_gt: ${timestamp24hAgo} }`
      : `where: { date_gt: ${timestamp24hAgo}, token0_not_in: $blacklist, token1_not_in: $blacklist, dailyVolumeUSD_gt: 2000 }`
  if (isStableSwap) whereCondition = `where: { date_gt: ${timestamp24hAgo}}`
  try {
    const query = gql`
      query topPools($blacklist: [String!]) {
        pairDayDatas(
          first: ${firstCount}
          ${whereCondition}
          orderBy: dailyVolumeUSD
          orderDirection: desc
        ) {
          id
        }
      }
    `
    const data = await getMultiChainQueryEndPointWithStableSwap(chainName).request<TopPoolsResponse>(query, {
      blacklist: multiChainTokenBlackList[chainName],
    })
    // pairDayDatas id has compound id "0xPOOLADDRESS-NUMBERS", extracting pool address with .split('-')
    const pairDayAddresses = data.pairDayDatas
      .map((p) => p.id.split('-')[0].toLowerCase())
      .filter(isAddress)

    if (pairDayAddresses.length > 0 || !isStableSwap) {
      return pairDayAddresses
    }

    try {
      const fallbackQuery = gql`
        query topStablePools {
          pairs(first: ${firstCount}, orderBy: reserveUSD, orderDirection: desc) {
            id
          }
        }
      `
      const fallbackData = await getMultiChainQueryEndPointWithStableSwap(chainName).request<TopPairsResponse>(
        fallbackQuery,
      )

      if (fallbackData.pairs.length > 0) {
        const pairAddresses = fallbackData.pairs.map((p) => p.id.toLowerCase()).filter(isAddress)

        if (pairAddresses.length > 0) {
          return pairAddresses
        }
      }
    } catch (fallbackError) {
      console.info('Failed to fetch stable pools from pairs, trying swaps fallback', fallbackError)
    }

    const swapsFallbackQuery = gql`
      query topStablePoolsFromSwaps {
        swaps(first: 1000, orderBy: timestamp, orderDirection: desc) {
          pair {
            id
          }
        }
      }
    `
    const swapsFallbackData = await getMultiChainQueryEndPointWithStableSwap(chainName).request<TopSwapsResponse>(
      swapsFallbackQuery,
    )

    return Array.from(new Set(swapsFallbackData.swaps.map((swap) => swap.pair.id.toLowerCase()).filter(isAddress))).slice(
      0,
      firstCount,
    )
  } catch (error) {
    console.error('Failed to fetch top pools', error)
    return []
  }
}

/**
 * Fetch top addresses by volume
 */
const useTopPoolAddresses = (): string[] => {
  const [topPoolAddresses, setTopPoolAddresses] = useState([])
  const [timestamp24hAgo] = getDeltaTimestamps()
  const chainName = useGetChainName()

  useEffect(() => {
    const fetch = async () => {
      const addresses = await fetchTopPools(chainName, timestamp24hAgo)
      setTopPoolAddresses(addresses)
    }
    if (topPoolAddresses.length === 0) {
      fetch()
    }
  }, [topPoolAddresses, timestamp24hAgo, chainName])

  return topPoolAddresses
}

export const fetchTopPoolAddresses = async (chainName: MultiChainName) => {
  const [timestamp24hAgo] = getDeltaTimestamps()

  const addresses = await fetchTopPools(chainName, timestamp24hAgo)
  return addresses
}

export default useTopPoolAddresses
