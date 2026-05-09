/* eslint-disable consistent-return */
import { useTranslation } from '@pancakeswap/localization'
import { ChainId } from '@pancakeswap/sdk'
import { useToast } from '@pancakeswap/uikit'
import { useCallback, useMemo, useState } from 'react'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { ConnectorNames } from 'config/wallet'
import { useAccount, useSwitchChain } from 'wagmi'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { useSessionChainId } from './useSessionChainId'
import { useSwitchNetworkLoading } from './useSwitchNetworkLoading'

export function useSwitchNetworkLocal() {
  const [, setSessionChainId] = useSessionChainId()
  return useCallback(
    (chainId: number) => {
      setSessionChainId(chainId)
      replaceBrowserHistory('chain', chainId === ChainId.BSC ? null : CHAIN_QUERY_NAME[chainId])
    },
    [setSessionChainId],
  )
}

export function useSwitchNetwork() {
  const [loading, setLoading] = useSwitchNetworkLoading()
  const [pendingChainId, setPendingChainId] = useState<number>()
  const {
    switchChainAsync: _switchNetworkAsync,
    switchChain: _switchNetwork,
    isPending: _isLoading,
    ...switchNetworkArgs
  } = useSwitchChain()
  const { t } = useTranslation()
  const { toastError } = useToast()
  const { isConnected, connector } = useAccount()

  const switchNetworkLocal = useSwitchNetworkLocal()
  const isLoading = _isLoading || loading

  const switchNetworkAsync = useCallback(
    async (chainId: number) => {
      if (isConnected && typeof _switchNetworkAsync === 'function') {
        if (isLoading) return
        setPendingChainId(chainId)
        setLoading(true)
        return _switchNetworkAsync({ chainId })
          .then((c) => {
            // well token pocket
            if (window.ethereum?.isTokenPocket === true) {
              switchNetworkLocal(chainId)
              window.location.reload()
            }
            return c
          })
          .catch(() => {
            // TODO: review the error
            toastError(t('Error connecting, please retry and confirm in wallet!'))
          })
          .finally(() => {
            setPendingChainId(undefined)
            setLoading(false)
          })
      }
      setPendingChainId(chainId)
      return new Promise(() => {
        switchNetworkLocal(chainId)
        setPendingChainId(undefined)
      })
    },
    [isConnected, _switchNetworkAsync, isLoading, setLoading, toastError, t, switchNetworkLocal],
  )

  const switchNetwork = useCallback(
    (chainId: number) => {
      if (isConnected && typeof _switchNetwork === 'function') {
        setPendingChainId(chainId)
        return _switchNetwork({ chainId })
      }
      return switchNetworkLocal(chainId)
    },
    [_switchNetwork, isConnected, switchNetworkLocal],
  )

  const canSwitch = useMemo(
    () =>
      isConnected
        ? !!_switchNetworkAsync &&
          connector.id !== ConnectorNames.WalletConnect &&
          !(
            typeof window !== 'undefined' &&
            // @ts-ignore // TODO: add type later
            (window.ethereum?.isSafePal || window.ethereum?.isMathWallet)
          )
        : true,
    [_switchNetworkAsync, isConnected, connector],
  )

  return {
    ...switchNetworkArgs,
    switchNetwork,
    switchNetworkAsync,
    pendingChainId,
    isLoading,
    canSwitch,
  }
}
