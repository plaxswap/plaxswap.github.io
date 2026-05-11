import { CMC } from 'config/constants/lists'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { selectorByUrlsAtom } from 'state/lists/hooks'
import { useTokenDatasSWR, useAllTokenHighLight } from 'state/info/hooks'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { ChainId } from '@pancakeswap/sdk'

export const useBSCWhiteList = () => {
  const listsByUrl = useAtomValue(selectorByUrlsAtom)
  const { current: list } = listsByUrl[CMC]
  const whiteList = useMemo(() => {
    return list ? list.tokens.map((t) => t.address.toLowerCase()) : []
  }, [list])
  return whiteList
}

export const useTokenHighLightList = () => {
  const { chainId } = useActiveChainId()
  const bscWhiteList = useBSCWhiteList()
  const allTokensFromBSC = useTokenDatasSWR(chainId === ChainId.BSC ? bscWhiteList : [], false)
  const allTokensFromGraph = useAllTokenHighLight()

  return useMemo(() => {
    if (chainId !== ChainId.BSC) {
      return allTokensFromGraph
    }

    const tokensByAddress = new Map()
    ;[...(allTokensFromBSC ?? []), ...(allTokensFromGraph ?? [])].forEach((token) => {
      if (token?.address) {
        tokensByAddress.set(token.address.toLowerCase(), token)
      }
    })

    return Array.from(tokensByAddress.values())
  }, [allTokensFromBSC, allTokensFromGraph, chainId])
}
