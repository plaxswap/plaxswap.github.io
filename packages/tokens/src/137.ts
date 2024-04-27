import { ChainId, WBNB, ERC20Token } from '@pancakeswap/sdk'
import { BUSD_BSC, CAKE_MAINNET, USDC_BSC, USDT_BSC } from './common'

export const bscTokens = {
  wbnb: WBNB[ChainId.BSC],
  // bnb here points to the wbnb contract. Wherever the currency BNB is required, conditional checks for the symbol 'BNB' can be used
  bnb: new ERC20Token(
    ChainId.BSC,
    '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    18,
    'MATIC',
    'MATIC',
    'https://polygon.technology/',
  ),
  cake: CAKE_MAINNET,
  busd: BUSD_BSC,
  dai: new ERC20Token(
    ChainId.BSC,
    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    18,
    'DAI',
    'Dai Stablecoin',
    'https://www.makerdao.com/',
  ),
  usdt: USDT_BSC,
  btcb: new ERC20Token(
    ChainId.BSC,
    '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    18,
    'BTCB',
    'Binance BTC',
    'https://bitcoin.org/',
  ),
  sfund: new ERC20Token(
    ChainId.BSC,
    '0x477bC8d23c634C154061869478bce96BE6045D12',
    18,
    'SFUND',
    'Seedify Fund Token',
    'https://seedify.fund/',
  ),
  snfts: new ERC20Token(
    ChainId.BSC,
    '0x6f51A1674BEFDD77f7ab1246b83AdB9f13613762',
    18,
    'SNFTS',
    'Seedify NFT Space',
    'https://snfts.seedify.fund/',
  ),
  sd: new ERC20Token(
    ChainId.BSC,
    '0x1d734A02eF1e1f5886e66b0673b71Af5B53ffA94',
    18,
    'SD',
    'Stader (PoS)',
    'https://www.staderlabs.com/',
  ),
  usdc: USDC_BSC,
  syrup: new ERC20Token(
    ChainId.BSC,
    '0x7cbbC91c05c64c5E5b12Da6F090F8f11480deA64',
    18,
    'PLAXBAR',
    'PlasaBar Token',
    'https://pancakeswap.finance/',
  ),
  axlusdc: new ERC20Token(
    ChainId.BSC,
    '0x750e4C4984a9e0f12978eA6742Bc1c5D248f40ed',
    6,
    'axlUSDC',
    'Axelar Wrapped USDC',
    'https://axelarscan.io/assets/',
  ),
  lazio: new ERC20Token(
    ChainId.BSC,
    '0x77d547256A2cD95F32F67aE0313E450Ac200648d',
    8,
    'LAZIO',
    'FC Lazio Fan Token',
    'https://launchpad.binance.com/en/subscription/LAZIO_BNB',
  ),
  porto: new ERC20Token(
    ChainId.BSC,
    '0x49f2145d6366099e13B10FbF80646C0F377eE7f6',
    8,
    'PORTO',
    'FC Porto Fan Token',
    'https://launchpad.binance.com/en/subscription/PORTO_BNB',
  ),
  santos: new ERC20Token(
    ChainId.BSC,
    '0xA64455a4553C9034236734FadDAddbb64aCE4Cc7',
    8,
    'SANTOS',
    'FC Santos Fan Token',
    'https://launchpad.binance.com/en/launchpool/SANTOS_BNB',
  ),
  mbox: new ERC20Token(
    ChainId.BSC,
    '0x3203c9E46cA618C8C1cE5dC67e7e9D75f5da2377',
    18,
    'MBOX',
    'Mobox Token',
    'https://www.mobox.io/#/',
  ),
  dar: new ERC20Token(
    ChainId.BSC,
    '0x23CE9e926048273eF83be0A3A8Ba9Cb6D45cd978',
    6,
    'DAR',
    'Mines of Dalarnia',
    'https://www.minesofdalarnia.com/',
  ),
  pay: new ERC20Token(
    ChainId.BSC,
    '0x7Ab2b041E120DcA2a40d8F9524B618A854d3A617',
    8,
    'PAY',
    'PLAXPAY',
    'https://www.plaxpay.app/',
  ),
  sme: new ERC20Token(
    ChainId.BSC,
    '0xcD9c386c9CE5987A8336C4Db5c6A17750ea0e339',
    8,
    'SME',
    'WESMEUP',
    'https://www.wesmeup.net/',
  ),
  idrt: new ERC20Token(
    ChainId.BSC,
    '0x554cd6bdD03214b10AafA3e0D4D42De0C5D2937b',
    6,
    'IDRT',
    'RUPIAH TOKEN',
    'https://rupiahtoken.com',
  ),
  idrx: new ERC20Token(
    ChainId.BSC,
    '0x649a2DA7B28E0D54c13D5eFf95d3A660652742cC',
    0,
    'IDRX',
    'IDRX',
    'https://idrx.co',
  ),
  xidr: new ERC20Token(
    ChainId.BSC,
    '0x2c826035c1C36986117A0e949bD6ad4baB54afE2',
    6,
    'XIDR',
    'XIDR',
    'https://www.straitsx.com/id/xidr',
  ),
  quick: new ERC20Token(
    ChainId.BSC,
    '0xB5C064F955D8e7F38fE0460C556a72987494eE17',
    18,
    'QUICK',
    'QUICKSWAP',
    'https://quickswap.exchange',
  ),
  aave: new ERC20Token(
    ChainId.BSC,
    '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
    18,
    'AAVE',
    'AAVE',
    'https://aave.com',
  ),
  df: new ERC20Token(
    ChainId.BSC,
    '0x08C15FA26E519A78a666D19CE5C646D55047e0a3',
    18,
    'DF',
    'DFORCE',
    'https://dforce.network/',
  ),
  usx: new ERC20Token(
    ChainId.BSC,
    '0xCf66EB3D546F0415b368d98A95EAF56DeD7aA752',
    18,
    'USX',
    'DFORCE USD',
    'https://dforce.network/',
  ),
  uni: new ERC20Token(
    ChainId.BSC,
    '0xb33EaAd8d922B1083446DC23f610c2567fB5180f',
    18,
    'UNI',
    'UNISWAP',
    'https://uniswap.org/',
  ),
  knc: new ERC20Token(
    ChainId.BSC,
    '0x1C954E8fe737F99f68Fa1CCda3e51ebDB291948C',
    18,
    'KNC',
    'KYBER NETWORK CRYSTAL',
    'https://kyber.network',
  ),
  crv: new ERC20Token(
    ChainId.BSC,
    '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
    18,
    'CRV',
    'CURVE DAO',
    'https://www.curve.fi/',
  ),
  rr: new ERC20Token(
    ChainId.BSC,
    '0x91Faa9fA243EaF35981f5563ec67e9bF0d8DFAEE',
    18,
    'RR',
    'RFIDR',
    'https://www.rfidr.net/',
  ),
  fif: new ERC20Token(
    ChainId.BSC,
    '0xbaEF7137D3cEC6282a83dd954eA6376d464f7780',
    18,
    'FIF',
    'FREEDOM INITIAL FUND',
    'https://www.freedomcommunity.network',
  ),
  burn: new ERC20Token(
    ChainId.BSC,
    '0xF84F0C7D675728D7fadD0D9dd97AbE26EB14642c',
    18,
    'BURN',
    'BULLDOG REBORN',
    'https://www.bullreborn.co/',
  ),
  wbtc: new ERC20Token(
    ChainId.BSC,
    '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    8,
    'WBTC',
    'Wrapped BTC',
    'https://www.wbtc.network/',
  ),
  weth: new ERC20Token(
    ChainId.BSC,
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    18,
    'wETH',
    'Wrapped Ether',
    'https://ethereum.org/',
  ),
  aro: new ERC20Token(
    ChainId.BSC,
    '0xa7D3aA3206425EeC18D9C8bC7A8b7ee922666bdF',
    18,
    'ARO',
    'AroLiex',
    'https://aroliex.co/',
  ),
  pps: new ERC20Token(
    ChainId.BSC,
    '0x5e4d5A1C3470d38b030af2AeA2ADA046Fc34cac6',
    18,
    'PPS',
    'Private Pool Share',
    'https://polygonscan.com/token/0x5e4d5a1c3470d38b030af2aea2ada046fc34cac6#code',
  ),
  bcatt: new ERC20Token(
    ChainId.BSC,
    '0x4A780Bb9D55173426f77D494aA8645273653924E',
    18,
    'BCATT',
    'Boss Cat',
    'https://www.bcatt.fun/',
  ),

}
