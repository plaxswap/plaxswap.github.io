import { CMC } from 'config/constants/lists'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
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

  const tokenHighLightList = useMemo(() => {
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

  useEffect(() => {
    console.info('[HotTokenList debug] token sources', {
      chainId,
      whitelistAddresses: bscWhiteList.length,
      whitelistTokenData: allTokensFromBSC?.length ?? 0,
      graphTokenData: allTokensFromGraph?.length ?? 0,
      mergedTokenData: tokenHighLightList?.length ?? 0,
      sampleWhitelistAddresses: bscWhiteList.slice(0, 5),
      sampleWhitelistTokenData: allTokensFromBSC?.slice(0, 3),
      sampleGraphTokenData: allTokensFromGraph?.slice(0, 3),
    })
  }, [allTokensFromBSC, allTokensFromGraph, bscWhiteList, chainId, tokenHighLightList])

  return tokenHighLightList
}
