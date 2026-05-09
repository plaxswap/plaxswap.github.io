import { useMemo } from 'react'
import { ChainId } from '@pancakeswap/sdk'
import { useAccount } from 'wagmi'
import { useActiveChainId } from './useActiveChainId'
import { useEthersProvider } from './useEthersProvider'
import { useEthersSigner } from './useEthersSigner'

export const useProviderOrSigner = (withSignerIfPossible = true, forceBSC?: boolean) => {
  const { chainId } = useActiveChainId()
  const provider = useEthersProvider({ chainId: forceBSC ? ChainId.BSC : chainId })
  const { address, isConnected } = useAccount()
  const { data: signer } = useEthersSigner({ chainId: forceBSC ? ChainId.BSC : chainId })

  return useMemo(
    () => (withSignerIfPossible && address && isConnected && signer ? signer : provider),
    [address, isConnected, provider, signer, withSignerIfPossible],
  )
}
