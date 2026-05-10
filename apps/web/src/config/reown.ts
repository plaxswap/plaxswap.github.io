import { createAppKit } from '@reown/appkit/react'
import { polygon, polygonMumbai } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { http } from 'viem'

export const reownProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '9ba1c138ff7ad815f7026b920b652f0b'

export const reownNetworks = [polygon, polygonMumbai] as [typeof polygon, typeof polygonMumbai]

const POLYGON_RPC_URL =
  process.env.NEXT_PUBLIC_NODE_PRODUCTION || 'https://lb.drpc.live/polygon/AksFlvO-tUQvsJxhLBbmJvCRID1tl_YR8LtMwg8TMB_n'

const POLYGON_MUMBAI_RPC_URL = process.env.NEXT_PUBLIC_NODE_PRODUCTION_TESTNET || polygonMumbai.rpcUrls.default.http[0]

const metadata = {
  name: 'Plaxswap',
  description: 'DEX on Polygon',
  url: 'https://plaxswap.io',
  icons: ['https://plaxswap.github.io/blockchain/logo.png'],
}

const getRpcUrl = (chain: (typeof reownNetworks)[number]) => {
  if (chain.id === polygon.id) {
    return POLYGON_RPC_URL
  }
  if (chain.id === polygonMumbai.id) {
    return POLYGON_MUMBAI_RPC_URL
  }
  return POLYGON_RPC_URL
}

export const wagmiAdapter = new WagmiAdapter({
  networks: reownNetworks,
  projectId: reownProjectId,
  ssr: true,
  transports: {
    [polygon.id]: http(getRpcUrl(polygon)),
    [polygonMumbai.id]: http(getRpcUrl(polygonMumbai)),
  },
})

export const reownModal = createAppKit({
  adapters: [wagmiAdapter],
  networks: reownNetworks,
  defaultNetwork: polygon,
  projectId: reownProjectId,
  metadata,
  enableCoinbase: false,
  enableWalletGuide: false,
  features: {
    analytics: false,
    email: false,
    socials: false,
    swaps: false,
    onramp: false,
  },
  themeVariables: {
    '--w3m-accent': '#1FC7D4',
  },
})
