import { ChainId } from '@pancakeswap/sdk'
import FarmsBscPriceHelper from './137'
import FarmsBscTestnetPriceHelper from './80001'


export const getFarmsPriceHelperLpFiles = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.BSC:
      return FarmsBscPriceHelper
    case ChainId.BSC_TESTNET:
      return FarmsBscTestnetPriceHelper
    default:
      return []
  }
}
