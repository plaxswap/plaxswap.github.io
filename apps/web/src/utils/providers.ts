import { StaticJsonRpcProvider } from '@ethersproject/providers'

export const BSC_PROD_NODE = process.env.NEXT_PUBLIC_NODE_PRODUCTION || 'https://polygon-mainnet.infura.io/v3/f2ef88e31ec94569a04c1dd3aeddafa5'

export const bscRpcProvider = new StaticJsonRpcProvider(BSC_PROD_NODE)

export default null
