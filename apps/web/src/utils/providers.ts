import { StaticJsonRpcProvider } from '@ethersproject/providers'

export const BSC_PROD_NODE = process.env.NEXT_PUBLIC_NODE_PRODUCTION || 'https://polygon-mainnet.nodereal.io/v1/cfa24e72f5924d7c9fd51bfc092a9323'

export const bscRpcProvider = new StaticJsonRpcProvider(BSC_PROD_NODE)

export default null
