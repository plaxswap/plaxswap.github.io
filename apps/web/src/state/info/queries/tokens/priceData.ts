import { getUnixTime } from 'date-fns'
import { gql } from 'graphql-request'
import orderBy from 'lodash/orderBy'

import { PriceChartEntry } from 'state/info/types'
import { getBlocksFromTimestamps } from 'utils/getBlocksFromTimestamps'
import { multiQuery } from 'views/Info/utils/infoQueryHelpers'
import {
  MultiChainName,
  checkIsStableSwap,
  getMultiChainQueryEndPointWithStableSwap,
} from '../../constant'

const getPriceSubqueries = (tokenAddress: string, blocks: any) =>
  blocks.map(
    (block: any) => `
      t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number} }) {
        derivedUSD
      }
    `,
  )

/**
 * Price data for token and bnb based on block number
 */
const priceQueryConstructor = (subqueries: string[]) => {
  return gql`
    query tokenPriceData {
      ${subqueries}
    }
  `
}

const fetchTokenPriceData = async (
  chainName: MultiChainName,
  address: string,
  interval: number,
  startTimestamp: number,
): Promise<{
  data?: PriceChartEntry[]
  error: boolean
}> => {
  // Construct timestamps to query against
  const endTimestamp = getUnixTime(new Date())
  const timestamps = []
  let time = startTimestamp
  while (time <= endTimestamp) {
    timestamps.push(time)
    time += interval
  }
  try {
    const blocks = await getBlocksFromTimestamps(timestamps, 'asc', 500, chainName)
    const blocksLength = blocks?.length ?? 0
    if (blocksLength > 0 && chainName === 'BSC' && !checkIsStableSwap()) {
      const data = blocks[blocksLength - 1]
      blocks[blocksLength - 1] = { timestamp: data.timestamp, number: data.number - 32 }
      // nodeReal will sync the the 32 block before latest
    }
    if (!blocks || blocksLength === 0) {
      console.error('Error fetching blocks for timestamps', timestamps)
      return {
        error: false,
      }
    }

    const prices: any | undefined = await multiQuery(
      priceQueryConstructor,
      getPriceSubqueries(address, blocks),
      getMultiChainQueryEndPointWithStableSwap(chainName),
      200,
    )

    console.warn('fetchTokenPriceData', { chainName, prices })

    if (!prices) {
      console.error('Price data failed to load')
      return {
        error: false,
      }
    }

    const tokenPrices: {
      timestamp: string
      priceUSD: number
    }[] = []

    Object.keys(prices).forEach((priceKey) => {
      const timestamp = priceKey.split('t')[1]
      if (timestamp) {
        tokenPrices.push({
          timestamp,
          priceUSD: prices[priceKey]?.derivedUSD ? parseFloat(prices[priceKey].derivedUSD) : 0,
        })
      }
    })

    console.warn('pricesPart1', tokenPrices)

    // graphql-request does not guarantee same ordering of batched requests subqueries, hence sorting by timestamp from oldest to newest
    const sortedTokenPrices = orderBy(tokenPrices, (tokenPrice) => parseInt(tokenPrice.timestamp, 10))

    const formattedHistory = []

    // for each timestamp, construct the open and close price
    for (let i = 0; i < sortedTokenPrices.length - 1; i++) {
      formattedHistory.push({
        time: parseFloat(sortedTokenPrices[i].timestamp),
        open: sortedTokenPrices[i].priceUSD,
        close: sortedTokenPrices[i + 1].priceUSD,
        high: sortedTokenPrices[i + 1].priceUSD,
        low: sortedTokenPrices[i].priceUSD,
      })
    }

    return { data: formattedHistory, error: false }
  } catch (error) {
    console.error(`Failed to fetch price data for token ${address}`, error)
    return {
      error: true,
    }
  }
}

export default fetchTokenPriceData
