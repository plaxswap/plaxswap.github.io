import { Contract } from '@ethersproject/contracts'
import BigNumber from 'bignumber.js'
import { DEFAULT_TOKEN_DECIMAL, DEFAULT_GAS_LIMIT } from 'config'
import { getNonBscVaultContractFee, MessageTypes } from 'views/Farms/hooks/getNonBscVaultFee'

interface FarmContract {
  deposit(pid: number, value: string, options?: { gasLimit?: number; gasPrice?: string }): Promise<any>
  withdraw(pid: number, value: string, options?: { gasLimit?: number; gasPrice?: string }): Promise<any>
}

export const stakeFarm = async (masterChefContract: FarmContract, pid, amount, gasPrice, gasLimit?: number) => {
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()

  return masterChefContract.deposit(pid, value, {
    gasLimit: gasLimit || DEFAULT_GAS_LIMIT,
    gasPrice,
  })
}

export const unstakeFarm = async (masterChefContract: FarmContract, pid, amount, gasPrice, gasLimit?: number) => {
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()

  return masterChefContract.withdraw(pid, value, {
    gasLimit: gasLimit || DEFAULT_GAS_LIMIT,
    gasPrice,
  })
}

export const harvestFarm = async (masterChefContract: FarmContract, pid, gasPrice, gasLimit?: number) => {
  return masterChefContract.deposit(pid, '0', {
    gasLimit: gasLimit || DEFAULT_GAS_LIMIT,
    gasPrice,
  })
}

export const nonBscStakeFarm = async (contract, pid, amount, gasPrice, account, oraclePrice, chainId) => {
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
  const totalFee = await getNonBscVaultContractFee({
    pid,
    chainId,
    gasPrice,
    oraclePrice,
    amount: value,
    userAddress: account,
    messageType: MessageTypes.Deposit,
  })
  console.info(totalFee, 'stake totalFee')
  return contract.deposit(pid, value, { value: totalFee })
}

export const nonBscUnstakeFarm = async (contract, pid, amount, gasPrice, account, oraclePrice, chainId) => {
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
  const totalFee = await getNonBscVaultContractFee({
    pid,
    chainId,
    gasPrice,
    oraclePrice,
    amount: value,
    userAddress: account,
    messageType: MessageTypes.Withdraw,
  })
  console.info(totalFee, 'unstake totalFee')
  return contract.withdraw(pid, value, { value: totalFee })
}
