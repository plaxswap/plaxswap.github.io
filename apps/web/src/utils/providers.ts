import { StaticJsonRpcProvider } from '@ethersproject/providers'

// export const BSC_PROD_NODE = process.env.NEXT_PUBLIC_NODE_PRODUCTION || 'https://1rpc.io/37W31VzwTtHTisDEK/matic'

export const BSC_PROD_NODE = process.env.NEXT_PUBLIC_NODE_PRODUCTION || 'https://lb.drpc.org/polygon/AksFlvO-tUQvsJxhLBbmJvCRID1tl_YR8LtMwg8TMB_n'

export const bscRpcProvider = new StaticJsonRpcProvider(BSC_PROD_NODE)

export default null
