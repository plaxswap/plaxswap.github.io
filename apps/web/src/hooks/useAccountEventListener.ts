import { useEffect, useMemo } from 'react'
import { ExtendEthereum } from 'global'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { useAppDispatch } from '../state'
import { clearUserStates } from '../utils/clearUserStates'
import useActiveWeb3React from './useActiveWeb3React'
import { useSessionChainId } from './useSessionChainId'

export const useAccountEventListener = () => {
  const { account, chainId, connector } = useActiveWeb3React()
  const [, setSessionChainId] = useSessionChainId()
  const dispatch = useAppDispatch()

  const isBloctoMobileApp = useMemo(() => {
    return typeof window !== 'undefined' && Boolean((window.ethereum as ExtendEthereum)?.isBlocto)
  }, [])

  useEffect(() => {
    if (account && connector) {
      const handleUpdateEvent = (e: any) => {
        if (e?.chain?.id) {
          replaceBrowserHistory('chain', CHAIN_QUERY_NAME[e.chain.id])
          setSessionChainId(e.chain.id)
        }
        // Blocto in-app browser throws change event when no account change which causes user state reset therefore
        // this event should not be handled to avoid unexpected behaviour.
        if (!isBloctoMobileApp) {
          clearUserStates(dispatch, { chainId, newChainId: e?.chain?.id })
        }
      }

      const handleDeactiveEvent = () => {
        clearUserStates(dispatch, { chainId })
      }

      connector.emitter?.on('disconnect', handleDeactiveEvent)
      connector.emitter?.on('change', handleUpdateEvent)

      return () => {
        connector.emitter?.off('disconnect', handleDeactiveEvent)
        connector.emitter?.off('change', handleUpdateEvent)
      }
    }
    return undefined
  }, [account, chainId, dispatch, connector, setSessionChainId, isBloctoMobileApp])
}
