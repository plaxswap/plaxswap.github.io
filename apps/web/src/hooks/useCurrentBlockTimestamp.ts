import { BigNumber } from '@ethersproject/bignumber'
import { useSingleCallResult } from '../state/multicall/hooks'
import { useMulticallContract } from './useContract'
import { Contract } from '@ethersproject/contracts'

// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): BigNumber | undefined {
  const multicall = useMulticallContract()
  return useSingleCallResult(multicall as unknown as Contract, 'getCurrentBlockTimestamp')?.result?.[0]
}
