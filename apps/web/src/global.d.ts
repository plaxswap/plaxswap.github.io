import type { Ethereum } from '@wagmi/core'

export interface ExtendEthereum extends Ethereum {
  request?: (args: { method: string; params?: any }) => Promise<any>
  isSafePal?: true
  isCoin98?: true
  isBlocto?: true
  isMathWallet?: true
  isTrust?: true
  isTrustWallet?: true
  isCoinbaseWallet?: true
  isTokenPocket?: true
  isMetaMask?: true
  isOpera?: true
  isBraveWallet?: true
  providers?: ExtendEthereum[]
}

declare global {
  interface Window {
    bn: {
      connect?: () => void
      disconnect?: () => void
      onMessage?: (event: { data: { id: string; payload?: any; on?: string } }) => void
      miniProgram: {
        postMessage: (message: { action: string; id: string; payload?: any }) => void
      }
    }
    coin98?: true
    ethereum?: ExtendEthereum
    BinanceChain?: {
      bnbSign?: (address: string, message: string) => Promise<{ publicKey: string; signature: string }>
      switchNetwork?: (networkId: string) => Promise<string>
    } & Ethereum
  }
}

export {}
