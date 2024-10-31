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
    lpSymbol: 'PLAX',
    lpAddress: '0x328801B0b580eAdd83eA841638865eA41Dc6fb25',
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
    pid: 5,
    v1pid: 4,
    lpSymbol: 'USDT-POL LP',
    lpAddress: '0x32f7392d7CF0Be17229006D371f02508D3B33866',
    token: bscTokens.usdt,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 22,
    lpSymbol: 'DAI-POL LP',
    lpAddress: '0x08D917A84e4c8f49B07d41CBB62Ed541b8e7Ca72',
    token: bscTokens.dai,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 6,
    lpSymbol: 'USDC-POL LP',
    lpAddress: '0xD4bdB68aD7490149587c1117f9AA20D862105D14',
    token: bscTokens.usdc,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 10,
    lpSymbol: 'USDC-USDT LP',
    lpAddress: '0x33919208EFB4530819e9769a51FE4Cf2524f56B1',
    token: bscTokens.usdc,
    quoteToken: bscTokens.usdt,
    boosted: true,
  },
  {
    pid: 20,
    lpSymbol: 'IDRT-POL LP',
    lpAddress: '0x5770F5f29A846fc4E26d4E0CC72cf48942eB4e93',
    token: bscTokens.idrt,
    quoteToken: bscTokens.wbnb,
    boosted: true,
  },
  {
    pid: 15,
    lpSymbol: 'IDRT-USDT LP',
    lpAddress: '0x1a96fB8699Bd9e5767aca72E840C17d69BBb7Db1',
    token: bscTokens.idrt,
    quoteToken: bscTokens.usdt,
    boosted: true,
  },
  {
    pid: 11,
    lpSymbol: 'IDRT-IDRX LP',
    lpAddress: '0x73e02e59F522109a52d86B7A791FB818c863B75c',
    token: bscTokens.idrt,
    quoteToken: bscTokens.idrx,
    boosted: true,
  },
  {
    pid: 12,
    lpSymbol: 'IDRX-USDT LP',
    lpAddress: '0xd556e9D67D182eb2E0F8d7486CB4814E6b21acB7',
    token: bscTokens.idrx,
    quoteToken: bscTokens.usdt,
    boosted: true,
  },
  {
    pid: 16,
    lpSymbol: 'IDRX-USDC LP',
    lpAddress: '0x5a8041FF395a5D1D4ea0aE2EAf8BeCf23b145b09',
    token: bscTokens.idrx,
    quoteToken: bscTokens.usdc,
    boosted: true,
  },
  {
    pid: 18,
    lpSymbol: 'XIDR-POL LP',
    lpAddress: '0x51DbF4DE80155A48C8a553AD986E88b47072125D',
    token: bscTokens.xidr,
    quoteToken: bscTokens.wbnb,
    boosted: true,
  },
  {
    pid: 21,
    lpSymbol: 'XIDR-IDRT LP',
    lpAddress: '0x8fD658D4caB11995cE783C6aEBc9c72B3e42e911',
    token: bscTokens.xidr,
    quoteToken: bscTokens.idrt,
    boosted: true,
  },
  {
    pid: 2,
    v1pid: 6,
    lpSymbol: 'PLAX-POL LP',
    lpAddress: CAKE_BNB_LP_MAINNET,
    token: bscTokens.cake,
    quoteToken: bscTokens.wbnb,
    boosted: true,
  },
  {
    pid: 3,
    // v1pid: 2,
    lpSymbol: 'PLAX-USDT LP',
    lpAddress: '0x8ae534F07f08422d00Ed00a2Be1335e411Fb9DA0',
    boosted: true,
    token: bscTokens.cake,
    quoteToken: bscTokens.usdt,
  },
  {
    pid: 4,
    // v1pid: 3,
    lpSymbol: 'PLAX-USDC LP',
    lpAddress: '0x3d65e2daeE8df8E36AbB3D25f3842265BD1c48c3',
    token: bscTokens.cake,
    quoteToken: bscTokens.usdc,
    boosted: true,
  },
  {
    pid: 25,
    lpSymbol: 'PLAXusdt-POL LP',
    lpAddress: '0x38Bfc5df1095c8980576dCd6c7a7aECc218A6026',
    token: bscTokens.plaxusdt,
    quoteToken: bscTokens.wbnb,
    boosted: true,
  },
  {
    pid: 14,
    lpSymbol: 'PAY-POL LP',
    lpAddress: '0xE4Dd13E722D74da9ED5DcFCF9Dc94D86BF2C3daF',
    token: bscTokens.pay,
    quoteToken: bscTokens.wbnb,
    boosted: true,
  },
  {
    pid: 13,
    lpSymbol: 'PAY-USDT LP',
    lpAddress: '0x7Fa11bb242CbBa853f634BEF02Fc24A3A13f916d',
    token: bscTokens.pay,
    quoteToken: bscTokens.usdt,
    boosted: true,
  },
  {
    pid: 9,
    lpSymbol: 'PAY-USDC LP',
    lpAddress: '0x28A2861188B196269366964CbDbA0473819C6467',
    token: bscTokens.pay,
    quoteToken: bscTokens.usdc,
    boosted: true,
  },
  {
    pid: 26,
    lpSymbol: 'PAYusdt-POL LP',
    lpAddress: '0x1ED334DbF6C9d4e5830f1c0F87dA5c16E2fbbdb1',
    token: bscTokens.payusdt,
    quoteToken: bscTokens.wbnb,
    boosted: true,
  },
  {
    pid: 8,
    lpSymbol: 'SME-USDT LP',
    lpAddress: '0xB4C4Cd512d60F0E589fBcC58353C1e6225f9a1BB',
    token: bscTokens.sme,
    quoteToken: bscTokens.usdt,
    boosted: true,
  },
  {
    pid: 27,
    lpSymbol: 'SMEusdt-POL LP',
    lpAddress: '0x3Ac5E936FC50652009Ec97Bc522CFf4e221F5201',
    token: bscTokens.smeusdt,
    quoteToken: bscTokens.wbnb,
    boosted: true,
  },
  {
    pid: 35,
    lpSymbol: 'PAXG-POL LP',
    lpAddress: '0x1dA2651759e81541ec1FC09aaDA24fE61cdD1114',
    token: bscTokens.paxg,
    quoteToken: bscTokens.wbnb,
    // boosted: true,  
  },
  {
    pid: 44,
    lpSymbol: 'BRC-POL LP',
    lpAddress: '0x6b7d774181c7f0ED78F86AbAb1C61b2Be54f35C0',
    token: bscTokens.brc,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 19,
    lpSymbol: 'BURN-POL LP',
    lpAddress: '0x4E9971C1a292D25342986CA95eC81752C0c56c96',
    token: bscTokens.burn,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 28,
    lpSymbol: 'FIF-POL LP',
    lpAddress: '0x9f4a6aE8cb1950135D500818Ce77123E354A5A95',
    token: bscTokens.fif,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 29,
    lpSymbol: 'FARM-POL LP',
    lpAddress: '0xD8B8F62DfD33b89fAe3e7bae2039F3241BA82B7c',
    token: bscTokens.farm,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 30,
    lpSymbol: 'FACE-POL LP',
    lpAddress: '0x8F850358b6373450234978333072820e0E46589B',
    token: bscTokens.face,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  // {
    // pid: 42,
    // lpSymbol: 'FGOLD-POL LP',
    // lpAddress: '0xF64A4AE174211ab4702e02650207b5ed3B085D27',
    // token: bscTokens.rsi,
    // quoteToken: bscTokens.wbnb,
    // boosted: true,
  // },
  {
    pid: 43,
    lpSymbol: 'FGOLD-POL LP',
    lpAddress: '0x880c951C8AF7C81a4edf0383CfD37fF61B1b6edF',
    token: bscTokens.fgold,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 36,
    lpSymbol: 'CTF-POL LP',
    lpAddress: '0x989827AECC2a9ae7466a5F154711966493a07f9c',
    token: bscTokens.ctf,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 37,
    lpSymbol: 'BTFC-POL LP',
    lpAddress: '0x6A44688946Da072FaCC46af32B8F493a7E726910',
    token: bscTokens.btfc,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 38,
    lpSymbol: 'DAPPS-POL LP',
    lpAddress: '0xcb9fc2F507991ED9F990493138AC718a46CFc681',
    token: bscTokens.dapps,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 41,
    lpSymbol: 'RSI-POL LP',
    lpAddress: '0xd8Cc550BA9258084D360AF612c2314368ba4EfC8',
    token: bscTokens.rsi,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 39,
    lpSymbol: 'BTGS-POL LP',
    lpAddress: '0x619C5e7a9c007266726847bA5Ad055a13d48D678',
    token: bscTokens.btgs,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 40,
    lpSymbol: 'BTPS-POL LP',
    lpAddress: '0x58011b9330476D21F5Ea06d5C22B53B24A7f5f3f',
    token: bscTokens.btps,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 23,
    lpSymbol: 'DAX-POL LP',
    lpAddress: '0x8f7497Ca2245c45a5d56cD7E1ED2F64e572844CA',
    token: bscTokens.dax,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 34,
    lpSymbol: 'DASS-POL LP',
    lpAddress: '0x8c648E300851d36aD66c5161177eE2967d25Ccc4',
    token: bscTokens.dass,
    quoteToken: bscTokens.wbnb,
    // boosted: true,  
  },
  {
    pid: 33,
    lpSymbol: 'DGOLD-POL LP',
    lpAddress: '0x84632B53Ddc308eee8385D8B165c92414896887D',
    token: bscTokens.dgold,
    quoteToken: bscTokens.wbnb,
    // boosted: true,  
  },
  {
    pid: 31,
    lpSymbol: 'ALIFI-POL LP',
    lpAddress: '0x02Bf2126B39c8F535FEcFf55254529E5CA250BB1',
    token: bscTokens.alifi,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 32,
    lpSymbol: 'ALICIA-POL LP',
    lpAddress: '0xB2034F530E2752B4FD95081382f56FF960044cB2',
    token: bscTokens.alicia,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 24,
    lpSymbol: 'CPOIN-POL LP',
    lpAddress: '0x1Aa7FB0be0e16D66430A57D1D17A2917608dfAa8',
    token: bscTokens.cpoin,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 17,
    lpSymbol: 'PPS-POL LP',
    lpAddress: '0xA458AaDE6ff5dD092340bF1Ed7d87a2Bb0235299',
    token: bscTokens.pps,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },
  {
    pid: 7,
    lpSymbol: 'BUSD-POL LP',
    lpAddress: '0x3D51830AcCfB5598D2542750eCef2f959B08F8B1',
    token: bscTokens.busd,
    quoteToken: bscTokens.wbnb,
    // boosted: true,
  },

  
  //    * V3 by order of release (some may be out of PID order due to multiplier boost)
].map((p) => ({ ...p, token: p.token.serialize, quoteToken: p.quoteToken.serialize }))

export default farms
