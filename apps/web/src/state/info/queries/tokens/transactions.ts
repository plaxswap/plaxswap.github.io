import { gql } from 'graphql-request'
import { mapBurns, mapMints, mapSwaps } from 'state/info/queries/helpers'
import { BurnResponse, MintResponse, SwapResponse } from 'state/info/queries/types'
import { Transaction } from 'state/info/types'
import { MultiChainName, getMultiChainQueryEndPointWithStableSwap, checkIsStableSwap } from '../../constant'

interface TokenUsdFields {
  id: string
  derivedUSD: string
}

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
  tokens: TokenUsdFields[]
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
 * Data to display transaction table on Token page
 */
const TOKEN_TRANSACTIONS = () => {
  const isStableSwap = checkIsStableSwap()
  const whereToken0 = isStableSwap ? 'pair_: {token0: $address}' : 'token0: $address'
  const whereToken1 = isStableSwap ? 'pair_: {token1: $address}' : 'token1: $address'
  return gql`
    query tokenTransactions($address: String!) {
      mintsAs0: mints(first: 10, orderBy: timestamp, orderDirection: desc, where: { ${whereToken0} }) {
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
      mintsAs1: mints(first: 10, orderBy: timestamp, orderDirection: desc, where: { ${whereToken1} }) {
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
      swapsAs0: swaps(first: 10, orderBy: timestamp, orderDirection: desc, where: { ${whereToken0} }) {
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
      swapsAs1: swaps(first: 10, orderBy: timestamp, orderDirection: desc, where: { ${whereToken1} }) {
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
      burnsAs0: burns(first: 10, orderBy: timestamp, orderDirection: desc, where: { ${whereToken0} }) {
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
      burnsAs1: burns(first: 10, orderBy: timestamp, orderDirection: desc, where: { ${whereToken1} }) {
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
}

interface TransactionResults {
  mintsAs0: MintResponse[]
  mintsAs1: MintResponse[]
  swapsAs0: SwapResponse[]
  swapsAs1: SwapResponse[]
  burnsAs0: BurnResponse[]
  burnsAs1: BurnResponse[]
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
  const tokens = Array.from(new Set(tokenAddresses.map((tokenAddress) => tokenAddress.toLowerCase())))

  if (!tokens.length) {
    return {}
  }

  const tokenAddressesString = `["${tokens.join('","')}"]`
  const quoteAddressesString = `["${USD_QUOTE_TOKEN_LIST.join('","')}"]`

  try {
    const query = gql`
      query tokenTransactionUsdPrices {
        tokens(where: { id_in: ${tokenAddressesString} }) {
          id
          derivedUSD
        }
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
    const prices = USD_QUOTE_TOKEN_LIST.reduce(
      (accum: Record<string, number>, tokenAddress) => ({
        ...accum,
        [tokenAddress]: 1,
      }),
      {},
    )
    const bestReserveByToken: Record<string, number> = {}

    ;(data.tokens ?? []).forEach((token) => {
      const price = parseFloat(token.derivedUSD)

      if (price) {
        prices[token.id.toLowerCase()] = price
      }
    })

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
    console.info('Failed to fetch token transaction USD prices', error)
    return USD_QUOTE_TOKEN_LIST.reduce(
      (accum: Record<string, number>, tokenAddress) => ({
        ...accum,
        [tokenAddress]: 1,
      }),
      {},
    )
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

  const token0Price = getTokenPrice(transaction.pair?.token0?.id, tokenUsdPrices)
  const token1Price = getTokenPrice(transaction.pair?.token1?.id, tokenUsdPrices)

  return parseFloat(transaction.amount0) * token0Price + parseFloat(transaction.amount1) * token1Price
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

const fetchTokenTransactions = async (
  chainName: MultiChainName,
  address: string,
): Promise<{ data?: Transaction[]; error: boolean }> => {
  try {
    const data = await getMultiChainQueryEndPointWithStableSwap(chainName).request<TransactionResults>(
      TOKEN_TRANSACTIONS(),
      {
        address,
      },
    )
    const allTransactions = [
      ...data.mintsAs0,
      ...data.mintsAs1,
      ...data.burnsAs0,
      ...data.burnsAs1,
      ...data.swapsAs0,
      ...data.swapsAs1,
    ]
    const tokenUsdPrices = await fetchTokenUsdPrices(chainName, collectTokenAddresses(allTransactions))
    const mapMintWithUsd = (mint: MintResponse) => ({
      ...mapMints(mint),
      amountUSD: getMintOrBurnUsdAmount(mint, tokenUsdPrices),
    })
    const mapBurnWithUsd = (burn: BurnResponse) => ({
      ...mapBurns(burn),
      amountUSD: getMintOrBurnUsdAmount(burn, tokenUsdPrices),
    })
    const mapSwapWithUsd = (swap: SwapResponse) => ({
      ...mapSwaps(swap),
      amountUSD: getSwapUsdAmount(swap, tokenUsdPrices),
    })

    const mints0 = data.mintsAs0.map(mapMintWithUsd)
    const mints1 = data.mintsAs1.map(mapMintWithUsd)

    const burns0 = data.burnsAs0.map(mapBurnWithUsd)
    const burns1 = data.burnsAs1.map(mapBurnWithUsd)

    const swaps0 = data.swapsAs0.map(mapSwapWithUsd)
    const swaps1 = data.swapsAs1.map(mapSwapWithUsd)

    return { data: [...mints0, ...mints1, ...burns0, ...burns1, ...swaps0, ...swaps1], error: false }
  } catch (error) {
    console.error(`Failed to fetch transactions for token ${address}`, error)
    return {
      error: true,
    }
  }
}

export default fetchTokenTransactions
