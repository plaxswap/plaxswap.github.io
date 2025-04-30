import { StaticJsonRpcProvider } from '@ethersproject/providers'

export const bscProvider = new StaticJsonRpcProvider(
  {
    url: 'https://1rpc.io/37W31VzwTtHTisDEK/matic',
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
