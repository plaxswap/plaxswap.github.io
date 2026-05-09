import { useConnect, useReconnect } from 'wagmi'
import { useEffect } from 'react'

const SAFE_ID = 'safe'

const useEagerConnect = () => {
  const { connectAsync, connectors } = useConnect()
  const { reconnect } = useReconnect()
  useEffect(() => {
    const connectorInstance = connectors.find((c) => c.id === SAFE_ID && c.ready)
    if (
      connectorInstance &&
      // @ts-ignore
      !window.cy
    ) {
      connectAsync({ connector: connectorInstance }).catch(() => {
        reconnect()
      })
    } else {
      reconnect()
    }
  }, [connectAsync, connectors, reconnect])
}

export default useEagerConnect
