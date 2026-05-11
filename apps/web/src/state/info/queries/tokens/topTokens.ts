import { gql } from 'graphql-request'
import { useCallback, useState, useEffect } from 'react'
import { getDeltaTimestamps } from 'utils/getDeltaTimestamps'
import union from 'lodash/union'
import { useGetChainName } from '../../hooks'
import {
  MultiChainName,
  getMultiChainQueryEndPointWithStableSwap,
  checkIsStableSwap,
  multiChainTokenBlackList,
  multiChainTokenWhiteList,
} from '../../constant'

interface TopTokensResponse {
  tokenDayDatas: {
    id: string
  }[]
}

interface TokensResponse {
  tokens: {
    id: string
  }[]
}

interface StableSwapTopTokensResponse {
  tokens: {
    id: string
  }[]
}

/**
 * Tokens to display on Home page
 * The actual data is later requested in tokenData.ts
 * Note: dailyTxns_gt: 300 is there to prevent fetching incorrectly priced tokens with high dailyVolumeUSD
 */
const fetchTopTokens = async (chainName: MultiChainName, timestamp24hAgo: number): Promise<string[]> => {
  const whereCondition =
    chainName === 'ETH'
      ? `where: { date_gt: ${timestamp24hAgo}, token_not_in: $blacklist, dailyVolumeUSD_gt:2000 }`
      : checkIsStableSwap()
      ? ''
      : `where: { dailyTxns_gt: 300, id_not_in: $blacklist, date_gt: ${timestamp24hAgo}}`
  const fallbackWhereCondition = chainName === 'ETH' ? `where: { token_not_in: $blacklist }` : `where: { id_not_in: $blacklist }`
  const firstCount = 50
  try {
    const tokenDayDatasQuery = (where: string) => gql`
      query topTokens($blacklist: [ID!]) {
        tokenDayDatas(
          first: ${firstCount}
          ${where}
          orderBy: dailyVolumeUSD
          orderDirection: desc
        ) {
          id
        }
      }
    `

    const tokensQuery = gql`
      query topTokens($blacklist: [ID!]) {
        tokens(
          first: ${firstCount}
          ${fallbackWhereCondition}
          orderBy: tradeVolumeUSD
          orderDirection: desc
        ) {
          id
        }
      }
    `

    const stableSwapQuery = gql`
      query topTokens {
        tokens(
          first: ${firstCount}
          ${whereCondition}
          orderBy: totalLiquidity
          orderDirection: desc
        ) {
          id
        }
      }
    `

    if (checkIsStableSwap()) {
      const data = await getMultiChainQueryEndPointWithStableSwap(chainName).request<StableSwapTopTokensResponse>(
        stableSwapQuery,
      )
      console.info('[HotTokenList debug] stableSwap top token addresses', {
        chainName,
        count: data.tokens.length,
        sample: data.tokens.slice(0, 10).map((t) => t.id),
      })
      return union(
        data.tokens.map((t) => t.id),
        multiChainTokenWhiteList[chainName],
      )
    }
    let data = await getMultiChainQueryEndPointWithStableSwap(chainName).request<TopTokensResponse>(tokenDayDatasQuery(whereCondition), {
      blacklist: multiChainTokenBlackList[chainName],
    })
    console.info('[HotTokenList debug] top tokenDayDatas strict', {
      chainName,
      timestamp24hAgo,
      count: data.tokenDayDatas.length,
      sample: data.tokenDayDatas.slice(0, 10).map((t) => t.id),
    })

    if (!data.tokenDayDatas.length) {
      data = await getMultiChainQueryEndPointWithStableSwap(chainName).request<TopTokensResponse>(
        tokenDayDatasQuery(fallbackWhereCondition),
        {
          blacklist: multiChainTokenBlackList[chainName],
        },
      )
      console.info('[HotTokenList debug] top tokenDayDatas fallback', {
        chainName,
        count: data.tokenDayDatas.length,
        sample: data.tokenDayDatas.slice(0, 10).map((t) => t.id),
      })
    }

    // tokenDayDatas id has compound id "0xTOKENADDRESS-NUMBERS", extracting token address with .split('-')
    const tokenDayDataAddresses = data.tokenDayDatas.map((t) => t.id.split('-')[0])
    if (tokenDayDataAddresses.length > 0) {
      return union(tokenDayDataAddresses, multiChainTokenWhiteList[chainName])
    }

    const tokensData = await getMultiChainQueryEndPointWithStableSwap(chainName).request<TokensResponse>(tokensQuery, {
      blacklist: multiChainTokenBlackList[chainName],
    })
    console.info('[HotTokenList debug] top tokens fallback', {
      chainName,
      count: tokensData.tokens.length,
      sample: tokensData.tokens.slice(0, 10).map((t) => t.id),
    })

    return union(
      tokensData.tokens.map((t) => t.id),
      multiChainTokenWhiteList[chainName],
    )
  } catch (error) {
    console.warn('fetchTopTokens', { chainName, timestamp24hAgo })
    console.error('Failed to fetch top tokens', error)
    return []
  }
}

/**
 * Fetch top addresses by volume
 */
const useTopTokenAddresses = (): string[] => {
  const [topTokenAddresses, setTopTokenAddresses] = useState([])
  const [timestamp24hAgo] = getDeltaTimestamps()
  const chainName = useGetChainName()

  const fetch = useCallback(async () => {
    const addresses = await fetchTopTokens(chainName, timestamp24hAgo)
    if (addresses.length > 0) setTopTokenAddresses(addresses)
  }, [timestamp24hAgo, chainName])

  useEffect(() => {
    fetch()
  }, [chainName, fetch])

  return topTokenAddresses
}

export const fetchTokenAddresses = async (chainName: MultiChainName) => {
  const [timestamp24hAgo] = getDeltaTimestamps()

  const addresses = await fetchTopTokens(chainName, timestamp24hAgo)

  return addresses
}

export default useTopTokenAddresses
