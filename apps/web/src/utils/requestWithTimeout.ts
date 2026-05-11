import { GraphQLClient } from 'graphql-request'

const requestCache = new Map<string, { timestamp: number; promise: Promise<unknown> }>()
const CACHE_TTL = 15000

const getRequestCacheKey = (graphQLClient: GraphQLClient, request: string, variables?: any) =>
  `${(graphQLClient as any).url ?? ''}:${request}:${JSON.stringify(variables ?? {})}`

const requestWithTimeout = <T>(
  graphQLClient: GraphQLClient,
  request: string,
  variables?: any,
  timeout = 30000,
): Promise<T> => {
  const cacheKey = getRequestCacheKey(graphQLClient, request, variables)
  const cached = requestCache.get(cacheKey)
  const now = Date.now()

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.promise as Promise<T>
  }

  const promise = Promise.race([
    variables ? graphQLClient.request<T>(request, variables) : graphQLClient.request<T>(request),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timed out after ${timeout} milliseconds`))
      }, timeout)
    }),
  ]) as Promise<T>

  requestCache.set(cacheKey, { timestamp: now, promise })

  promise.catch(() => {
    requestCache.delete(cacheKey)
  })

  return promise
}

export default requestWithTimeout
