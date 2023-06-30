import { getFarmsPriceHelperLpFiles } from '@pancakeswap/farms/constants/priceHelperLps/getFarmsPriceHelperLpFiles'
import { ChainId } from '@pancakeswap/sdk'
// import PoolsEthereumPriceHelper from './pools/1'
// import PoolsGoerliPriceHelper from './pools/5'
import PoolsBscPriceHelper from './pools/137'
import PoolsBscTestnetPriceHelper from './pools/80001'

export { getFarmsPriceHelperLpFiles }

export const getPoolsPriceHelperLpFiles = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.BSC:
      return PoolsBscPriceHelper
    case ChainId.BSC_TESTNET:
      return PoolsBscTestnetPriceHelper
    default:
      return []
  }
}
