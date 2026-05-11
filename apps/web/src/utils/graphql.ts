import {
  BIT_QUERY,
  INFO_CLIENT,
  INFO_CLIENT_FALLBACKS,
  STABLESWAP_SUBGRAPH_CLIENT,
  INFO_CLIENT_ETH,
} from 'config/constants/endpoints'
import { GraphQLClient } from 'graphql-request'
import { INFO_CLIENT_WITH_CHAIN } from '../config/constants/endpoints'

const REQUEST_CACHE_TTL = 15000
const RATE_LIMIT_COOLDOWN = 30000

const requestCache = new Map<string, { timestamp: number; promise: Promise<unknown> }>()
const rateLimitedUntil = new Map<string, number>()

const getRequestCacheKey = (endpoint: string, document: unknown, variables?: unknown) =>
  `${endpoint}:${String(document)}:${JSON.stringify(variables ?? {})}`

export const isGraphQLRateLimitedError = (error: unknown) => {
  const status = (error as any)?.response?.status
  const message = error instanceof Error ? error.message : String(error)
  return status === 429 || message.includes('429') || message.toLowerCase().includes('too many requests')
}

const getGraphQLClientEndpoint = (client: GraphQLClient) => (client as any).url ?? ''

const shouldFallbackGraphQLError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  return isGraphQLRateLimitedError(error) || message.toLowerCase().includes('failed to fetch')
}

const getEndpointCandidates = (endpoint: string) => {
  if (endpoint === INFO_CLIENT || endpoint === STABLESWAP_SUBGRAPH_CLIENT) {
    return INFO_CLIENT_FALLBACKS
  }
  return [endpoint]
}

const requestEndpoint = (
  endpoint: string,
  options: ConstructorParameters<typeof GraphQLClient>[1] | undefined,
  document: unknown,
  variables?: unknown,
  requestHeaders?: unknown,
) => {
  const now = Date.now()
  const rateLimitExpiry = rateLimitedUntil.get(endpoint)

  if (rateLimitExpiry && now < rateLimitExpiry) {
    return Promise.reject(new Error(`GraphQL endpoint is rate limited until ${new Date(rateLimitExpiry).toISOString()}`))
  }

  const cacheKey = getRequestCacheKey(endpoint, document, variables)
  const cached = requestCache.get(cacheKey)

  if (cached && now - cached.timestamp < REQUEST_CACHE_TTL) {
    return cached.promise
  }

  const client = new GraphQLClient(endpoint, options)
  const promise = client.request(document as any, variables as any, requestHeaders as any)
  requestCache.set(cacheKey, { timestamp: now, promise })

  promise.catch((error) => {
    requestCache.delete(cacheKey)
    if (isGraphQLRateLimitedError(error)) {
      rateLimitedUntil.set(endpoint, Date.now() + RATE_LIMIT_COOLDOWN)
    }
  })

  return promise
}

const requestWithFallbacks = async (
  endpoint: string,
  options: ConstructorParameters<typeof GraphQLClient>[1] | undefined,
  document: unknown,
  variables?: unknown,
  requestHeaders?: unknown,
) => {
  const endpoints = getEndpointCandidates(endpoint)
  let lastError: unknown

  for (const candidate of endpoints) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await requestEndpoint(candidate, options, document, variables, requestHeaders)
    } catch (error) {
      lastError = error
      if (!shouldFallbackGraphQLError(error)) {
        throw error
      }
      console.warn('GraphQL request failed, trying fallback endpoint', { endpoint: candidate, error })
    }
  }

  throw lastError
}

const createCachedGraphQLClient = (endpoint: string, options?: ConstructorParameters<typeof GraphQLClient>[1]) => {
  const client = new GraphQLClient(endpoint, options)

  ;(client as any).request = (document: unknown, variables?: unknown, requestHeaders?: unknown) => {
    return requestWithFallbacks(endpoint, options, document, variables, requestHeaders)
  }

  return client
}

// Extra headers
// Mostly for dev environment
// No production env check since production preview might also need them
export const getGQLHeaders = () => {
  
  return undefined
}

export const getCachedGraphQLClient = (endpoint: string, options?: ConstructorParameters<typeof GraphQLClient>[1]) =>
  createCachedGraphQLClient(endpoint, options)

export const getCachedGraphQLClientEndpoint = getGraphQLClientEndpoint

export const gqlRequest = <T = any>(endpoint: string, document: string, variables?: any) =>
  getCachedGraphQLClient(endpoint).request<T>(document, variables)

export const infoClient = getCachedGraphQLClient(INFO_CLIENT)

export const infoClientWithChain = (chainId: number) => {
  return getCachedGraphQLClient(INFO_CLIENT_WITH_CHAIN[chainId])
}

export const infoClientETH = getCachedGraphQLClient(INFO_CLIENT_ETH)

export const infoStableSwapClient = getCachedGraphQLClient(STABLESWAP_SUBGRAPH_CLIENT)

export const infoServerClient = getCachedGraphQLClient(INFO_CLIENT, {
  timeout: 5000,
  headers: {
    origin: 'https://plaxswap.io',
  },
})

export const stableSwapClient = getCachedGraphQLClient(STABLESWAP_SUBGRAPH_CLIENT)

export const bitQueryServerClient = getCachedGraphQLClient(BIT_QUERY, {
  headers: {
    // only server, no `NEXT_PUBLIC` not going to expose in client
    'X-API-KEY': process.env.BIT_QUERY_HEADER,
  },
  timeout: 5000,
})
