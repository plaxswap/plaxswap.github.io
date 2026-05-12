import { gql } from 'graphql-request'
import { mapBurns, mapMints, mapSwaps } from 'state/info/queries/helpers'
import { BurnResponse, MintResponse, SwapResponse } from 'state/info/queries/types'
import { Transaction } from 'state/info/types'
import { getMultiChainQueryEndPointWithStableSwap, MultiChainName } from '../../constant'

interface TokenUsdPairFields {
  reserve0: string
  reserve1: string
  reserveUSD: string
  token0: {
    id: string
  }
  token1: {
    id: string
  }
}

interface TokenUsdPriceResponse {
  token0QuotePairs: TokenUsdPairFields[]
  token1QuotePairs: TokenUsdPairFields[]
}

const USD_QUOTE_TOKEN_ADDRESSES = new Set([
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', // USDC.e
  '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', // native USDC
  '0x9c9e5fd8bbc25984b178fdce6117defa39d2db39', // BUSD
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // DAI
])

const USD_QUOTE_TOKEN_LIST = Array.from(USD_QUOTE_TOKEN_ADDRESSES)

/**
 * Transactions for Transaction table on the Home page
 */
const GLOBAL_TRANSACTIONS = gql`
  query overviewTransactions {
    mints: mints(first: 33, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      to
      amount0
      amount1
      amountUSD
    }
    swaps: swaps(first: 33, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      from
      amount0In
      amount1In
      amount0Out
      amount1Out
      amountUSD
    }
    burns: burns(first: 33, orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      amount0
      amount1
      amountUSD
    }
  }
`

interface TransactionResults {
  mints: MintResponse[]
  swaps: SwapResponse[]
  burns: BurnResponse[]
}

const collectTokenAddresses = (transactions: Array<MintResponse | BurnResponse | SwapResponse>) => {
  return Array.from(
    new Set(
      transactions
        .flatMap((transaction) => [transaction.pair?.token0?.id, transaction.pair?.token1?.id])
        .filter(Boolean)
        .map((tokenAddress) => tokenAddress.toLowerCase()),
    ),
  )
}

const fetchTokenUsdPrices = async (chainName: MultiChainName, tokenAddresses: string[]) => {
  const tokens = Array.from(new Set(tokenAddresses.map((tokenAddress) => tokenAddress.toLowerCase()))).filter(
    (tokenAddress) => !USD_QUOTE_TOKEN_ADDRESSES.has(tokenAddress),
  )
  const prices = USD_QUOTE_TOKEN_LIST.reduce(
    (accum: Record<string, number>, tokenAddress) => ({
      ...accum,
      [tokenAddress]: 1,
    }),
    {},
  )

  if (!tokens.length) {
    return prices
  }

  const tokenAddressesString = `["${tokens.join('","')}"]`
  const quoteAddressesString = `["${USD_QUOTE_TOKEN_LIST.join('","')}"]`

  try {
    const query = gql`
      query transactionUsdPrices {
        token0QuotePairs: pairs(
          first: 1000
          where: { token0_in: ${tokenAddressesString}, token1_in: ${quoteAddressesString} }
          orderBy: reserveUSD
          orderDirection: desc
        ) {
          reserve0
          reserve1
          reserveUSD
          token0 { id }
          token1 { id }
        }
        token1QuotePairs: pairs(
          first: 1000
          where: { token1_in: ${tokenAddressesString}, token0_in: ${quoteAddressesString} }
          orderBy: reserveUSD
          orderDirection: desc
        ) {
          reserve0
          reserve1
          reserveUSD
          token0 { id }
          token1 { id }
        }
      }
    `
    const data = await getMultiChainQueryEndPointWithStableSwap(chainName).request<TokenUsdPriceResponse>(query)
    const bestReserveByToken: Record<string, number> = {}

    ;[...(data.token0QuotePairs ?? []), ...(data.token1QuotePairs ?? [])].forEach((pair) => {
      const token0 = pair.token0.id.toLowerCase()
      const token1 = pair.token1.id.toLowerCase()
      const reserve0 = parseFloat(pair.reserve0)
      const reserve1 = parseFloat(pair.reserve1)
      const reserveUSD = parseFloat(pair.reserveUSD)
      const tokenAddress = USD_QUOTE_TOKEN_ADDRESSES.has(token0) ? token1 : token0
      const priceUSD = USD_QUOTE_TOKEN_ADDRESSES.has(token0)
        ? reserve1 > 0
          ? reserve0 / reserve1
          : 0
        : reserve0 > 0
        ? reserve1 / reserve0
        : 0

      if (priceUSD && (!prices[tokenAddress] || reserveUSD > (bestReserveByToken[tokenAddress] ?? 0))) {
        prices[tokenAddress] = priceUSD
        bestReserveByToken[tokenAddress] = reserveUSD
      }
    })

    return prices
  } catch (error) {
    console.info('Failed to fetch overview transaction USD prices', error)
    return prices
  }
}

const getTokenPrice = (tokenAddress: string | undefined, tokenUsdPrices: Record<string, number>) => {
  if (!tokenAddress) {
    return 0
  }

  return tokenUsdPrices[tokenAddress.toLowerCase()] || 0
}

const getMintOrBurnUsdAmount = (transaction: MintResponse | BurnResponse, tokenUsdPrices: Record<string, number>) => {
  const amountUSD = parseFloat(transaction.amountUSD)

  if (amountUSD) {
    return amountUSD
  }

  const token0USD = parseFloat(transaction.amount0) * getTokenPrice(transaction.pair?.token0?.id, tokenUsdPrices)
  const token1USD = parseFloat(transaction.amount1) * getTokenPrice(transaction.pair?.token1?.id, tokenUsdPrices)

  return token0USD + token1USD || token0USD * 2 || token1USD * 2 || 0
}

const getSwapUsdAmount = (swap: SwapResponse, tokenUsdPrices: Record<string, number>) => {
  const amountUSD = parseFloat(swap.amountUSD)

  if (amountUSD) {
    return amountUSD
  }

  const amount0 = Math.abs(parseFloat(swap.amount0In) - parseFloat(swap.amount0Out))
  const amount1 = Math.abs(parseFloat(swap.amount1In) - parseFloat(swap.amount1Out))
  const token0USD = amount0 * getTokenPrice(swap.pair?.token0?.id, tokenUsdPrices)
  const token1USD = amount1 * getTokenPrice(swap.pair?.token1?.id, tokenUsdPrices)

  return token0USD || token1USD || 0
}

const fetchTopTransactions = async (chainName: MultiChainName): Promise<Transaction[] | undefined> => {
  try {
    const data = await getMultiChainQueryEndPointWithStableSwap(chainName).request<TransactionResults>(
      GLOBAL_TRANSACTIONS,
    )
    if (!data) {
      return undefined
    }

    const tokenUsdPrices = await fetchTokenUsdPrices(chainName, collectTokenAddresses([...data.mints, ...data.burns, ...data.swaps]))
    const mints = data.mints.map((mint) => ({
      ...mapMints(mint),
      amountUSD: getMintOrBurnUsdAmount(mint, tokenUsdPrices),
    }))
    const burns = data.burns.map((burn) => ({
      ...mapBurns(burn),
      amountUSD: getMintOrBurnUsdAmount(burn, tokenUsdPrices),
    }))
    const swaps = data.swaps.map((swap) => ({
      ...mapSwaps(swap),
      amountUSD: getSwapUsdAmount(swap, tokenUsdPrices),
    }))

    return [...mints, ...burns, ...swaps].sort((a, b) => {
      return parseInt(b.timestamp, 10) - parseInt(a.timestamp, 10)
    })
  } catch {
    return undefined
  }
}

export default fetchTopTransactions
