import { AppState } from 'state'
import { useSelector } from 'react-redux'
import { useCallback } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { Contract, CallOverrides } from '@ethersproject/contracts'
import { useGasPrice } from 'state/user/hooks'
import get from 'lodash/get'
import { addBreadcrumb } from '@sentry/nextjs'
import { GAS_PRICE_GWEI } from '../state/types'

const GAS_ESTIMATE_BUFFER_BPS = 13000

const cleanGasOverrides = (overrides: CallOverrides = {}): CallOverrides => {
  const nextOverrides = { ...overrides }
  const hasEip1559Fee = nextOverrides.maxFeePerGas || nextOverrides.maxPriorityFeePerGas

  if (hasEip1559Fee) {
    delete nextOverrides.gasPrice
    return nextOverrides
  }

  return nextOverrides
}

const withGasEstimateBuffer = (gasEstimate: BigNumber) => gasEstimate.mul(GAS_ESTIMATE_BUFFER_BPS).div(10000)

const withEstimatedGasLimit = async (
  contract: Contract,
  methodName: string,
  methodArgs: any[],
  overrides: CallOverrides,
): Promise<CallOverrides> => {
  const estimateGasMethod = get(contract.estimateGas, methodName)

  if (!estimateGasMethod) {
    return overrides
  }

  try {
    const { gasLimit, ...estimateOverrides } = overrides
    const gasEstimate = await estimateGasMethod(...methodArgs, estimateOverrides)
    const bufferedGasEstimate = withGasEstimateBuffer(gasEstimate)
    const configuredGasLimit = gasLimit ? BigNumber.from(gasLimit) : null

    if (configuredGasLimit && configuredGasLimit.gte(bufferedGasEstimate)) {
      return overrides
    }

    return {
      ...overrides,
      gasLimit: bufferedGasEstimate,
    }
  } catch (error) {
    console.error('[useCallWithGasPrice] Gas estimate failed, using configured overrides', {
      contractAddress: contract.address,
      methodName,
      methodArgs,
      overrides,
      error,
    })
    return overrides
  }
}

export function useCallWithGasPrice() {
  const gasPrice = useGasPrice()
  const userGasPrice = useSelector<AppState, AppState['user']['gasPrice']>((state) => state.user.gasPrice)

  /**
   * Perform a contract call with a gas price returned from useGasPrice
   * @param contract Used to perform the call
   * @param methodName The name of the method called
   * @param methodArgs An array of arguments to pass to the method
   * @param overrides An overrides object to pass to the method. gasPrice passed in here will take priority over the price returned by useGasPrice
   * @returns https://docs.ethers.io/v5/api/providers/types/#providers-TransactionReceipt
   */
  const callWithGasPrice = useCallback(
    async (
      contract: Contract,
      methodName: string,
      methodArgs: any[] = [],
      overrides: CallOverrides = null,
    ): Promise<TransactionResponse> => {
      addBreadcrumb({
        type: 'Transaction',
        message:
          userGasPrice === GAS_PRICE_GWEI.rpcDefault
            ? `Call with market gas price`
            : `Call with gas price: ${gasPrice}`,
        data: {
          contractAddress: contract.address,
          methodName,
          methodArgs,
          overrides,
        },
      })

      const contractMethod = get(contract, methodName)
      const cleanOverrides = cleanGasOverrides(overrides ?? {})
      const callOverrides = await withEstimatedGasLimit(contract, methodName, methodArgs, cleanOverrides)
      const tx = await contractMethod(...methodArgs, callOverrides)

      if (tx) {
        addBreadcrumb({
          type: 'Transaction',
          message: `Transaction sent: ${tx.hash}`,
          data: {
            hash: tx.hash,
            from: tx.from,
            gasLimit: tx.gasLimit?.toString(),
            nonce: tx.nonce,
          },
        })
      }

      return tx
    },
    [gasPrice, userGasPrice],
  )

  return { callWithGasPrice }
}
