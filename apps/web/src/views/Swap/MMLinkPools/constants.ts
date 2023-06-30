import { ChainId } from '@pancakeswap/sdk'
import contract from 'config/constants/contracts'
import { getAddress } from '@ethersproject/address'

export const NATIVE_CURRENCY_ADDRESS = getAddress('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')

export const MM_SUPPORT_CHAIN = {
  137: true,
}

export const MM_SWAP_CONTRACT_ADDRESS = contract.mmLinkedPool

export const MM_STABLE_TOKENS_WHITE_LIST: Record<number, Record<string, string>> = {
  [ChainId.BSC]: {
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': 'USDC',
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F': 'USDT',
    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063': 'DAI',
    '0x9C9e5fD8bbc25984B178FdCE6117Defa39d2db39': 'BUSD',
  },
}

export const MM_SIGNER = {
  [ChainId.BSC]: '0x3A660aF22cA065F084Db20B602cF05A5ceCc84bD',
}

export const SAFE_MM_QUOTE_EXPIRY_SEC = 25
export const IS_SUPPORT_NATIVE_TOKEN = true
