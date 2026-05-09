import { JsonRpcProvider, FallbackProvider, Web3Provider } from '@ethersproject/providers'
import { getClient, getConnectorClient, injected } from '@wagmi/core'
import memoize from 'lodash/memoize'
import { createConfig, http } from 'wagmi'
import { polygon, polygonMumbai } from 'wagmi/chains'
import type { Transport } from 'viem'
import { metaMask } from '@wagmi/connectors/dist/esm/metaMask'
import { safe } from '@wagmi/connectors/dist/esm/safe'
import { walletConnect } from '@wagmi/connectors/dist/esm/walletConnect'

export const chains = [polygon, polygonMumbai]

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '9ba1c138ff7ad815f7026b920b652f0b'

const getRpcUrl = (chain: (typeof chains)[number]) => {
  if (!!process.env.NEXT_PUBLIC_NODE_PRODUCTION && chain.id === polygon.id) {
    return process.env.NEXT_PUBLIC_NODE_PRODUCTION
  }
  return chain.rpcUrls.default.http[0]
}

export const injectedConnector = injected({
  shimDisconnect: false,
})

export const coinbaseConnector = injectedConnector

export const walletConnectConnector = walletConnect({
  projectId: walletConnectProjectId,
  showQrModal: true,
  metadata: {
    name: 'Plaxswap',
    description: 'DEX on Polygon',
    url: 'https://plaxswap.io',
    icons: ['https://plaxswap.github.io/blockchain/logo.png'],
  },
})

export const walletConnectNoQrCodeConnector = walletConnect({
  projectId: walletConnectProjectId,
  showQrModal: false,
  metadata: {
    name: 'Plaxswap',
    description: 'DEX on Polygon',
    url: 'https://plaxswap.io',
    icons: ['https://plaxswap.github.io/blockchain/logo.png'],
  },
})

export const metaMaskConnector = metaMask({
  dappMetadata: {
    name: 'Plaxswap',
    url: 'https://plaxswap.io',
    iconUrl: 'https://plaxswap.github.io/blockchain/logo.png',
  },
})

export const bscConnector = injectedConnector
export const bloctoConnector = injectedConnector
export const ledgerConnector = injectedConnector
export const trustWalletConnector = injectedConnector

export const config = createConfig({
  chains: [polygon, polygonMumbai],
  transports: {
    [polygon.id]: http(getRpcUrl(polygon)),
    [polygonMumbai.id]: http(getRpcUrl(polygonMumbai)),
  },
  connectors: [
    safe(),
    metaMaskConnector,
    injectedConnector,
    coinbaseConnector,
    walletConnectConnector,
    trustWalletConnector,
  ],
})

export const client = config

const clientToProvider = (clientConfig: any) => {
  const { chain, transport } = clientConfig
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }

  if (transport.type === 'fallback') {
    return new FallbackProvider(
      (transport.transports as ReturnType<Transport>[]).map(
        ({ value }) => new JsonRpcProvider(value?.url, network),
      ),
    )
  }

  return new JsonRpcProvider((transport as any).url, network)
}

export const provider = ({ chainId }: { chainId?: number } = {}) => {
  const publicClient = getClient(config, { chainId: chainId as any })
  return publicClient ? clientToProvider(publicClient) : undefined
}

export const getEthersSigner = async ({ chainId }: { chainId?: number } = {}) => {
  const walletClient = await getConnectorClient(config, { chainId: chainId as any })
  const { account, chain, transport } = walletClient as any
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  return new Web3Provider(transport, network).getSigner(account.address)
}

export const CHAIN_IDS: number[] = chains.map((c) => c.id)

export const isChainSupported = memoize((chainId: number) => CHAIN_IDS.includes(chainId))
export const isChainTestnet = memoize((chainId: number) => chains.find((c) => c.id === chainId)?.testnet)
