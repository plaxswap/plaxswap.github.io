import { useTranslation } from '@pancakeswap/localization'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { WalletConnectorNotFoundError, WalletSwitchChainError } from '@pancakeswap/ui-wallets'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { ConnectorNames } from 'config/wallet'
import { useCallback } from 'react'
import { useAppDispatch } from 'state'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { clearUserStates } from '../utils/clearUserStates'
import { useActiveChainId } from './useActiveChainId'
import { useSessionChainId } from './useSessionChainId'

const useAuth = () => {
  const dispatch = useAppDispatch()
  const { connectAsync, connectors } = useConnect()
  const { chainId: connectedChainId } = useAccount()
  const { disconnectAsync } = useDisconnect()
  const { chainId } = useActiveChainId()
  const [, setSessionChainId] = useSessionChainId()
  const { t } = useTranslation()

  const login = useCallback(
    async (connectorID: ConnectorNames) => {
      const findConnector = connectors.find((c) => c.id === connectorID)
      try {
        const connected = await connectAsync({ connector: findConnector, chainId })
        if (connected.chainId && connected.chainId !== chainId) {
          replaceBrowserHistory('chain', CHAIN_QUERY_NAME[connected.chainId])
          setSessionChainId(connected.chainId)
        }
        return connected
      } catch (error) {
        if (!findConnector) {
          throw new WalletConnectorNotFoundError()
        }
        if (error) {
          throw new WalletSwitchChainError(t('Unable to switch network. Please try it on your wallet'))
        }
      }
      return undefined
    },
    [connectors, connectAsync, chainId, setSessionChainId, t],
  )

  const logout = useCallback(async () => {
    try {
      await disconnectAsync()
    } catch (error) {
      console.error(error)
    } finally {
      clearUserStates(dispatch, { chainId: connectedChainId })
    }
  }, [disconnectAsync, dispatch, connectedChainId])

  return { login, logout }
}

export default useAuth
