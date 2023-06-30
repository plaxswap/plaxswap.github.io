import { Obj } from 'itty-router'
import { error } from 'itty-router-extras'
import { createFarmFetcher } from '@pancakeswap/farms'
import { createMulticall } from '@pancakeswap/multicall'
import { bscProvider, bscTestnetProvider } from './provider'

export const getProvider = ({ chainId }: { chainId?: number }) => {
  switch (chainId) {
    case 137:
      return bscProvider
    case 80001:
      return bscTestnetProvider
    default:
      return null
  }
}

const multicall = createMulticall(getProvider)

export const farmFetcher = createFarmFetcher(multicall.multicallv2)

export function requireChainId(params: Obj | undefined) {
  if (!params) {
    return error(400, 'Invalid params')
  }
  const { chainId } = params
  if (!chainId || !farmFetcher.isChainSupported(+chainId)) {
    return error(400, 'Invalid chain id')
  }
  return null
}
