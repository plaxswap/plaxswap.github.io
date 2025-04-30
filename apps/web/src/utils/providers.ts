import { StaticJsonRpcProvider } from '@ethersproject/providers'

export const BSC_PROD_NODE = process.env.NEXT_PUBLIC_NODE_PRODUCTION || 'https://rpc.ankr.com/polygon/8a211590835087845ff22ee4159e7dc636f0cce7cfb1ecc483fc0fb1cbb99599'

export const bscRpcProvider = new StaticJsonRpcProvider(BSC_PROD_NODE)

export default null
