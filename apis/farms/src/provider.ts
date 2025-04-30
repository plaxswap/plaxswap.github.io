import { StaticJsonRpcProvider } from '@ethersproject/providers'

export const bscProvider = new StaticJsonRpcProvider(
  {
    url: 'https://rpc.ankr.com/polygon/8a211590835087845ff22ee4159e7dc636f0cce7cfb1ecc483fc0fb1cbb99599',
    skipFetchSetup: true,
  },
  137,
)

export const bscTestnetProvider = new StaticJsonRpcProvider(
  {
    url: 'https://bsc-testnet.nodereal.io/v1/e9a36765eb8a40b9bd12e680a1fd2bc5',
    skipFetchSetup: true,
  },
  80001,
)
