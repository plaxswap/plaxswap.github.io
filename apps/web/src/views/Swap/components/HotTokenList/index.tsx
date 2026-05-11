import { useTranslation } from '@pancakeswap/localization'
import { ButtonMenu, ButtonMenuItem, useMatchBreakpoints } from '@pancakeswap/uikit'
import { memo, useEffect, useState, useMemo } from 'react'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { ChainId, Currency } from '@pancakeswap/sdk'

import styled from 'styled-components'
import TokenTable from './SwapTokenTable'
import { useTokenHighLightList } from './useList'

const Wrapper = styled.div`
  padding-top: 10px;
  ${({ theme }) => theme.mediaQueries.lg} {
    width: 725px;
    padding: 24px;
    box-sizing: border-box;
    background: ${({ theme }) => (theme.isDark ? 'rgba(39, 38, 44, 0.5)' : 'rgba(255, 255, 255, 0.5)')};
    border: 1px solid ${({ theme }) => theme.colors.cardBorder};
    border-radius: 32px;
  }
`
const MenuWrapper = styled.div`
  padding: 0px 24px 12px;
  ${({ theme }) => theme.mediaQueries.lg} {
    margin-bottom: 24px;
  }
`

const LIQUIDITY_FILTER = { [ChainId.BSC]: 100000 }

const HotTokenList: React.FC<{ handleOutputSelect: (newCurrencyOutput: Currency) => void }> = ({
  handleOutputSelect,
}) => {
  const { chainId } = useActiveChainId()
  const allTokens = useTokenHighLightList()
  const [index, setIndex] = useState(0)
  const { isMobile } = useMatchBreakpoints()
  const formattedTokens = useMemo(
    () => {
      const tokensWithMarketData = (allTokens ?? []).filter((t) => t.exists)
      const tokensWithLiquidity = tokensWithMarketData.filter((t) => t.liquidityUSD >= LIQUIDITY_FILTER[chainId])
      return tokensWithLiquidity.length > 0 ? tokensWithLiquidity : tokensWithMarketData
    },
    [allTokens, chainId],
  )
  const priceChangeTokens = useMemo(() => {
    const tokensWithPriceChange = formattedTokens.filter((t) => t.priceUSDChange !== 0)
    return tokensWithPriceChange.length > 0 ? tokensWithPriceChange : formattedTokens
  }, [formattedTokens])

  useEffect(() => {
    const tokens = allTokens ?? []
    const tokensWithPrice = tokens.filter((t) => t.priceUSD !== 0)
    const tokensWithVolume = tokens.filter((t) => t.volumeUSD !== 0)
    const tokensWithMarketData = tokens.filter((t) => t.priceUSD !== 0 && t.volumeUSD !== 0)
    const tokensWithLiquidity = tokensWithMarketData.filter((t) => t.liquidityUSD >= LIQUIDITY_FILTER[chainId])
    console.info('[HotTokenList debug] table filters', {
      chainId,
      totalTokens: tokens.length,
      tokensWithPrice: tokensWithPrice.length,
      tokensWithVolume: tokensWithVolume.length,
      tokensWithMarketData: tokensWithMarketData.length,
      tokensWithLiquidity: tokensWithLiquidity.length,
      formattedTokens: formattedTokens.length,
      priceChangeTokens: priceChangeTokens.length,
      sampleAllTokens: tokens.slice(0, 5),
      sampleFormattedTokens: formattedTokens.slice(0, 5),
      rejectedSamples: tokens
        .filter((t) => t.priceUSD === 0 || t.volumeUSD === 0)
        .slice(0, 5)
        .map((t) => ({
          address: t.address,
          symbol: t.symbol,
          priceUSD: t.priceUSD,
          volumeUSD: t.volumeUSD,
          liquidityUSD: t.liquidityUSD,
          priceUSDChange: t.priceUSDChange,
        })),
    })
  }, [allTokens, chainId, formattedTokens, priceChangeTokens])

  const { t } = useTranslation()
  return (
    <Wrapper>
      <MenuWrapper>
        <ButtonMenu activeIndex={index} onItemClick={setIndex} fullWidth scale="sm" variant="subtle">
          <ButtonMenuItem>{chainId === ChainId.BSC ? t('Price Change') : t('Liquidity')}</ButtonMenuItem>
          <ButtonMenuItem>{t('Volume (24H)')}</ButtonMenuItem>
        </ButtonMenu>
      </MenuWrapper>
      {index === 0 ? (
        <TokenTable
          tokenDatas={priceChangeTokens}
          type={chainId === ChainId.BSC ? 'priceChange' : 'liquidity'}
          defaultSortField={chainId === ChainId.BSC ? 'priceUSDChange' : 'liquidityUSD'}
          maxItems={isMobile ? 100 : 6}
          handleOutputSelect={handleOutputSelect}
        />
      ) : (
        <TokenTable
          tokenDatas={formattedTokens}
          type="volume"
          defaultSortField="volumeUSD"
          maxItems={isMobile ? 100 : 6}
          handleOutputSelect={handleOutputSelect}
        />
      )}
    </Wrapper>
  )
}

export default memo(HotTokenList)
