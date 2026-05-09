import { Web3Provider } from '@ethersproject/providers'
import React from 'react'
import useSWRImmutable from 'swr/immutable'
import { useAccount, useChainId } from 'wagmi'

const Web3LibraryContext = React.createContext<Web3Provider | undefined>(undefined)

export const useWeb3LibraryContext = () => {
  return React.useContext(Web3LibraryContext)
}

export const Web3LibraryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { connector } = useAccount()
  const chainId = useChainId()
  const { data: library } = useSWRImmutable(connector && ['web3-library', connector.uid, chainId], async () => {
    const provider = await connector?.getProvider()
    return new Web3Provider(provider)
  })

  return <Web3LibraryContext.Provider value={library}>{children}</Web3LibraryContext.Provider>
}

export function useWeb3React() {
  const chainId = useChainId()
  const { address, connector, isConnected, isConnecting } = useAccount()

  return {
    chainId,
    account: isConnected ? address : null,
    isConnected,
    isConnecting,
    chain: undefined,
    connector,
  }
}
