import { useMemo } from 'react'
import { provider } from 'utils/wagmi'
import { useChainId } from 'wagmi'

export const useEthersProvider = ({ chainId }: { chainId?: number } = {}) => {
  const connectedChainId = useChainId()

  return useMemo(() => provider({ chainId: chainId ?? connectedChainId }), [chainId, connectedChainId])
}
