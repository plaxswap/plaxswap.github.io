import { SerializedFarmConfig } from '@pancakeswap/farms'
import { bscTokens } from '@pancakeswap/tokens'
import { CAKE_BNB_LP_MAINNET } from './common'

const farms: SerializedFarmConfig[] = [
  /**
   * These 3 farms (PID 0, 2, 3) should always be at the top of the file.
   */
  {
    pid: 0,
    v1pid: 0,
    lpSymbol: 'PLASA',
    lpAddress: '0x7972De0F17Ae5dC02385A863595CC74168F6D550',
    token: bscTokens.syrup,
    quoteToken: bscTokens.wbnb,
  },
  // {
  //   pid: 1,
  //   // v1pid: 1,
  //   lpSymbol: 'DLOTTO LP',
  //   lpAddress: '0x7972De0F17Ae5dC02385A863595CC74168F6D550',
  //   token: bscTokens.cake,
  //   quoteToken: bscTokens.wbnb,
  //   // boosted: true,
  // },
  {
    pid: 2,
    v1pid: 1,
    lpSymbol: 'PLASA-MATIC LP',
    lpAddress: CAKE_BNB_LP_MAINNET,
    token: bscTokens.cake,
    quoteToken: bscTokens.wbnb,
    boosted: true,
  },
  {
    pid: 3,
    v1pid: 2,
    lpSymbol: 'PLASA-USDT LP',
    lpAddress: '0x5D7FD43A2cf8Db74E2604825dB4bC70571798b41',
    boosted: true,
    token: bscTokens.cake,
    quoteToken: bscTokens.usdt,
  },
  {
    pid: 4,
    v1pid: 3,
    lpSymbol: 'PLASA-USDC LP',
    lpAddress: '0xE10ea4E991F19BF3d61bfc2Ea72EC75b4c02Eca4',
    token: bscTokens.cake,
    quoteToken: bscTokens.usdc,
    // boosted: true,
  },
  {
    pid: 5,
    v1pid: 4,
    lpSymbol: 'USDT-MATIC LP',
    lpAddress: '0x32f7392d7CF0Be17229006D371f02508D3B33866',
    token: bscTokens.usdt,
    quoteToken: bscTokens.wbnb,
  },
  {
    pid: 6,
    lpSymbol: 'USDC-MATIC LP',
    lpAddress: '0xD4bdB68aD7490149587c1117f9AA20D862105D14',
    token: bscTokens.usdc,
    quoteToken: bscTokens.wbnb,
  },
  {
    pid: 7,
    lpSymbol: 'BUSD-MATIC LP',
    lpAddress: '0x3D51830AcCfB5598D2542750eCef2f959B08F8B1',
    token: bscTokens.busd,
    quoteToken: bscTokens.wbnb,
  },
  //    * V3 by order of release (some may be out of PID order due to multiplier boost)
].map((p) => ({ ...p, token: p.token.serialize, quoteToken: p.quoteToken.serialize }))

export default farms
