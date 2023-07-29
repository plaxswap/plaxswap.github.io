import { SerializedFarmConfig } from '@pancakeswap/farms'
import { bscTokens } from '@pancakeswap/tokens'

const priceHelperLps: SerializedFarmConfig[] = [
    {
        pid: 5,
        lpSymbol: 'USDT-MATIC LP',
        lpAddress: '0x32f7392d7CF0Be17229006D371f02508D3B33866',
        token: bscTokens.usdt,
        quoteToken: bscTokens.wbnb,
      },
    ].map((p) => ({ ...p, token: p.token.serialize, quoteToken: p.quoteToken.serialize }))

export default priceHelperLps
