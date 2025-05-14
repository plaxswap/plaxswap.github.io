import { ChainId } from '@pancakeswap/sdk'
import { Contract } from '@ethersproject/contracts'
import { useChainlinkOracleContract } from 'hooks/useContract'
import { useSWRContract } from 'hooks/useSWRContract'
import { Zero } from '@ethersproject/constants'

const getOracleAddress = (chainId: number) => {
  switch (chainId) {
    case ChainId.ETHEREUM:
    case ChainId.GOERLI:
      return '0x63D407F32Aa72E63C7209ce1c2F5dA40b3AaE726' // ETH/BNB pair
    default:
      return ''
  }
}

export const useOraclePrice = (chainId: number) => {
  const tokenAddress = getOracleAddress(chainId)
  const chainlinkOracleContract = useChainlinkOracleContract(tokenAddress, false) as unknown as Contract
  // Can refactor to subscription later
  const { data: price } = useSWRContract([chainlinkOracleContract, 'latestAnswer'], {
    refreshWhenHidden: true,
    refreshWhenOffline: true,
    fallbackData: Zero,
  })

  return price.toString()
}
