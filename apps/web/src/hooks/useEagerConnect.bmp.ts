/* eslint-disable no-console */
import { useCallback } from 'react'
import { useToast } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import getWeb3Provider from 'utils/mpBridge'

export const getAccount = async () => {
  const provider = await getWeb3Provider()
  const accounts = await provider?.request?.({ method: 'eth_accounts' })
  return accounts?.[0]
}

const useActive = () => {
  return useCallback(async () => {
    const provider = await getWeb3Provider()
    await provider?.request?.({ method: 'eth_requestAccounts' })
  }, [])
}

export const useEagerConnect = () => {
  // noop
}

export const useActiveHandle = () => {
  const handleActive = useActive()
  const { toastSuccess } = useToast()
  const { t } = useTranslation()

  const main = async () => {
    console.log('~ before getAccount')
    const address = await getAccount()
    console.log('~ after getAccount', address)
    return new Promise((resolve) => {
      handleActive().then(resolve)
    })
  }

  return async (showToast = true) => {
    await main()
    const address = await getAccount()
    if (address && showToast) {
      toastSuccess(t('Success'), 'Wallet connected')
    }
  }
}

export default useEagerConnect
