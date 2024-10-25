import { ChainId, WBNB, ERC20Token } from '@pancakeswap/sdk'
import { BUSD_BSC, CAKE_MAINNET, USDC_BSC, USDT_BSC } from './common'

export const bscTokens = {
  wbnb: WBNB[ChainId.BSC],
  // bnb here points to the wbnb contract. Wherever the currency BNB is required, conditional checks for the symbol 'BNB' can be used
  bnb: new ERC20Token(
    ChainId.BSC,
    '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    18,
    'POL',
    'Polygon Ecosystem Token',
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
    'https://sites.google.com/view/fif-report/lock-staking/fif-freebiz-class?authuser=0',
  ),
  bcore: new ERC20Token(
    ChainId.BSC,
    '0xA830a38CeAC7BFe3568D229945A45121730fbb91',
    18,
    'BCORE',
    'Bulldog Core',
    'https://www.bullreborn.site/',
  ),
  brc: new ERC20Token(
    ChainId.BSC,
    '0x580b956f9828225647C154E13569A2409e0AAd27',
    18,
    'BRC',
    'Bulldog Racing Club',
    'https://www.bullreborn.club/',
  ),
  burn: new ERC20Token(
    ChainId.BSC,
    '0xF84F0C7D675728D7fadD0D9dd97AbE26EB14642c',
    18,
    'BURN',
    'BULLDOG REBORN',
    'https://www.bullreborn.site/',
  ),
  ball: new ERC20Token(
    ChainId.BSC,
    '0xCC135a9d941d2a1f40d55a04eb6A90d9835dA7d7',
    18,
    'BALL',
    'BULLDOG ALLIANCE',
    'https://www.bullreborn.site/',
  ),
  brand: new ERC20Token(
    ChainId.BSC,
    '0xb0de690CA7C204608062765507e280d0163D452C',
    18,
    'BRAND',
    'BULLDOG BRAND',
    'https://www.bullreborn.site/',
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
  daz: new ERC20Token(
    ChainId.BSC,
    '0xB5f6ca3CDC4d42A57eF85f22Ca98AD4D222D7F4E',
    18,
    'DAZ',
    'BITZAURA',
    'https://www.bitzaura.org/',
  ),
  dax: new ERC20Token(
    ChainId.BSC,
    '0x78Dcb158C18cFF931D188Fe179128e5A8068aE8d',
    18,
    'DAX',
    'BITZAURA-X',
    'https://www.bitzaura.pro/',
  ),
  dass: new ERC20Token(
    ChainId.BSC,
    '0xda432286FEd68F40f5aF28F1E005b2378146B8Cc',
    18,
    'DASS',
    'BitZaura Association',
    'https://www.bitzaura.pro/',
  ),
  dgold: new ERC20Token(
    ChainId.BSC,
    '0x7aE71763B5Cc70BA3932D05352Da3Af591ed4fEa',
    18,
    'DGOLD',
    'BitZaura Gold',
    'https://www.bitzaura.pro/',
  ),
  paxg: new ERC20Token(
    ChainId.BSC,
    '0x553d3D295e0f695B9228246232eDF400ed3560B5',
    18,
    'PAXG',
    'PAX Gold',
    'https://paxos.com/paxgold/',
  ),
  cpoin: new ERC20Token(
    ChainId.BSC,
    '0x37aDC8f969b63B8bBD025D10D03900C5cd9DD367',
    0,
    'CPOIN',
    'CLABS REWARD',
    'https://www.cpoin.net/',
  ),
  btf: new ERC20Token(
    ChainId.BSC,
    '0x9b3d2aFc6fDfeF566a224E2786bAfC854fAf6800',
    18,
    'BTF',
    'Bitfind',
    'https://bitfind.co',
  ),
  ctf: new ERC20Token(
    ChainId.BSC,
    '0x2eB8556dB957a0C9394cedE2f5B11064824Dd060',
    0,
    'CTF',
    'CrowdTech Fund',
    'https://bitfind.vip',
  ),
  btfc: new ERC20Token(
    ChainId.BSC,
    '0x2721098562f5b3dc79917730C2646877F5F374F9',
    18,
    'BTFC',
    'Bitfind Camp',
    'https://bitfind.vip',
  ),
  dapps: new ERC20Token(
    ChainId.BSC,
    '0xC8C16304f6B722F910fb3A74bee55F7F4Dfd36dF',
    18,
    'DAPPS',
    'Defi Project',
    'https://bitfind.vip',
  ),
  rsi: new ERC20Token(
    ChainId.BSC,
    '0x467C3603BEE6F43e9497afA93720d55586213dFE',
    18,
    'RSI',
    'Real Project Finance',
    'https://bitfind.vip',
  ),
  btgs: new ERC20Token(
    ChainId.BSC,
    '0x230f5A4dC8A12698bC65373a47061A50C270D343',
    18,
    'BTGS',
    'BitGands',
    'https://bitfind.co',
  ),
  btps: new ERC20Token(
    ChainId.BSC,
    '0xCcdc94871f1945F8eE75369e14E7D7f7edD371A7',
    18,
    'BTPS',
    'BitParts',
    'https://bitfind.co',
  ),
  plaxusdt: new ERC20Token(
    ChainId.BSC,
    '0x8ae534F07f08422d00Ed00a2Be1335e411Fb9DA0',
    18,
    'PLAXusdt',
    'PLAX-USDT LP',
    'https://polygonscan.com/token/0x8ae534F07f08422d00Ed00a2Be1335e411Fb9DA0#code',
  ),
  payusdt: new ERC20Token(
    ChainId.BSC,
    '0x7Fa11bb242CbBa853f634BEF02Fc24A3A13f916d',
    18,
    'PAYusdt',
    'PAY-USDT LP',
    'https://polygonscan.com/token/0x7Fa11bb242CbBa853f634BEF02Fc24A3A13f916d#code',
  ),
  smeusdt: new ERC20Token(
    ChainId.BSC,
    '0xB4C4Cd512d60F0E589fBcC58353C1e6225f9a1BB',
    18,
    'SMEusdt',
    'SME-USDT LP',
    'https://polygonscan.com/token/0xB4C4Cd512d60F0E589fBcC58353C1e6225f9a1BB#code',
  ),
  doa: new ERC20Token(
    ChainId.BSC,
    '0x058E73a591FF67ed31D92679db27950eb2546ca1',
    18,
    'DOA',
    'ALIRI',
    'https://polygonscan.com/token/0x058E73a591FF67ed31D92679db27950eb2546ca1',
  ),
  alifi: new ERC20Token(
    ChainId.BSC,
    '0x38e009e25A3B6459345e9c07B93ea41E05AC0990',
    18,
    'ALIFI',
    'ALIRI FINANCE',
    'https://polygonscan.com/token/0x38e009e25A3B6459345e9c07B93ea41E05AC0990',
  ),
  alicia: new ERC20Token(
    ChainId.BSC,
    '0x1B6e0561f053830e34349111af458Dc130937928',
    18,
    'ALICIA',
    'ALIRI CREATIVE INDUSTRY',
    'https://polygonscan.com/token/0x1B6e0561f053830e34349111af458Dc130937928',
  ),
  farm: new ERC20Token(
    ChainId.BSC,
    '0x4490d8Dca8a1dbD10c084bFe8EA286c7fa62373A',
    18,
    'FARM',
    'FREEDOM AUTO REVSHARE',
    'https://sites.google.com/view/fif-report/lock-staking/farm-pamm?authuser=0',
  ),
  face: new ERC20Token(
    ChainId.BSC,
    '0xe9716d7D7248ad22Ac94Fb36DC28Bbbf45E11958',
    18,
    'FACE',
    'FREEDOM CROWDFUNDING EXPERT',
    'https://sites.google.com/view/fif-report/lock-staking/face-backer?authuser=0',
  ),
  fgold: new ERC20Token(
    ChainId.BSC,
    '0x38A33Cf60164EaC333400aB0ee7DeeBe92f968dB',
    18,
    'FGOLD',
    'FREEGOLD',
    'https://polygonscan.com/token/0x38A33Cf60164EaC333400aB0ee7DeeBe92f968dB',
  ),
  clk: new ERC20Token(
    ChainId.BSC,
    '0x1EdC86d411AD224f97b6Ad89C4446683C1b0BAaE',
    8,
    'CLK',
    'COINLUCK',
    'https://polygonscan.com/token/0x1EdC86d411AD224f97b6Ad89C4446683C1b0BAaE',
  ),
  tba: new ERC20Token(
    ChainId.BSC,
    '0x25481b64c8733475fD17C57e24082Ef938cc40D5',
    18,
    'TBA',
    'THUBA',
    'https://polygonscan.com/token/0x25481b64c8733475fD17C57e24082Ef938cc40D5',
  ),

  

}
