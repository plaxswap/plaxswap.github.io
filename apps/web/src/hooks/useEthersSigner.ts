import { useEffect, useState } from 'react'
import { JsonRpcSigner } from '@ethersproject/providers'
import { getEthersSigner } from 'utils/wagmi'
import { useAccount, useChainId } from 'wagmi'

export const useEthersSigner = ({ chainId }: { chainId?: number } = {}) => {
  const connectedChainId = useChainId()
  const { address } = useAccount()
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>()

  useEffect(() => {
    let cancelled = false

    if (!address) {
      setSigner(undefined)
      return undefined
    }

    getEthersSigner({ chainId: chainId ?? connectedChainId })
      .then((nextSigner) => {
        if (!cancelled) {
          setSigner(nextSigner)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSigner(undefined)
        }
      })

    return () => {
      cancelled = true
    }
  }, [address, chainId, connectedChainId])

  return { data: signer }
}
