import { Box, ButtonMenu, ButtonMenuItem, Flex, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useEffect, useMemo, useState, memo } from 'react'
import { useFetchPairPrices } from 'state/swap/hooks'
import dynamic from 'next/dynamic'
import { PairCandlesNormalized, PairDataTimeWindowEnum, PairPricesNormalized } from 'state/swap/types'
import fetchPairCandleData from 'state/swap/fetch/fetchPairCandleData'
import { ONE_DAY_UNIX, ONE_HOUR_SECONDS } from 'config/constants/info'
import NoChartAvailable from './NoChartAvailable'
import PairPriceDisplay from '../../../../components/PairPriceDisplay'
import { getTimeWindowChange } from './utils'

const SwapLineChart = dynamic(() => import('./SwapLineChart'), {
  ssr: false,
})

const SwapCandleChart = dynamic(() => import('./SwapCandleChart'), {
  ssr: false,
})

const getCandleInterval = (timeWindow: PairDataTimeWindowEnum) => {
  switch (timeWindow) {
    case PairDataTimeWindowEnum.DAY:
      return ONE_HOUR_SECONDS
    case PairDataTimeWindowEnum.WEEK:
      return ONE_HOUR_SECONDS * 4
    case PairDataTimeWindowEnum.MONTH:
      return ONE_DAY_UNIX
    case PairDataTimeWindowEnum.YEAR:
      return ONE_DAY_UNIX * 15
    default:
      return ONE_HOUR_SECONDS * 4
  }
}

const pricesToCandles = (
  prices: PairPricesNormalized,
  timeWindow: PairDataTimeWindowEnum,
): PairCandlesNormalized => {
  const interval = getCandleInterval(timeWindow)
  const candles = new Map<number, { open: number; high: number; low: number; close: number }>()

  prices
    ?.filter((price) => price.value && price.value !== Infinity && !Number.isNaN(price.value))
    .forEach((price, index, filteredPrices) => {
      const previousPrice = filteredPrices[index - 1]
      const open = previousPrice?.value ?? price.value
      const close = price.value
      const bucketTime = Math.floor(price.time.getTime() / 1000 / interval) * interval
      const candle = candles.get(bucketTime)

      if (!candle) {
        candles.set(bucketTime, {
          open,
          high: Math.max(open, close),
          low: Math.min(open, close),
          close,
        })
        return
      }

      candle.high = Math.max(candle.high, open, close)
      candle.low = Math.min(candle.low, open, close)
      candle.close = close
    })

  return Array.from(candles.entries()).map(([time, candle]) => ({
    time,
    ...candle,
  }))
}

const BasicChart = ({
  token0Address,
  token1Address,
  isChartExpanded,
  inputCurrency,
  outputCurrency,
  isMobile,
  currentSwapPrice,
}) => {
  const [timeWindow, setTimeWindow] = useState<PairDataTimeWindowEnum>(0)

  const { pairPrices = [], pairId } = useFetchPairPrices({
    token0Address,
    token1Address,
    timeWindow,
    currentSwapPrice,
  })
  const [pairCandles, setPairCandles] = useState<PairCandlesNormalized>([])
  const [hoverValue, setHoverValue] = useState<number | undefined>()
  const [hoverDate, setHoverDate] = useState<string | undefined>()
  const candlePrices = useMemo(
    () => pairCandles.map(({ time, close }) => ({ time: new Date(time * 1000), value: close })),
    [pairCandles],
  )
  const derivedCandles = useMemo(
    () => (pairCandles.length > 0 ? pairCandles : pricesToCandles(pairPrices, timeWindow)),
    [pairCandles, pairPrices, timeWindow],
  )
  const derivedCandlePrices = useMemo(
    () => derivedCandles.map(({ time, close }) => ({ time: new Date(time * 1000), value: close })),
    [derivedCandles],
  )
  const chartPrices = candlePrices.length > 0 ? candlePrices : derivedCandlePrices.length > 0 ? derivedCandlePrices : pairPrices
  const valueToDisplay = hoverValue || chartPrices[chartPrices.length - 1]?.value
  const { changePercentage, changeValue } = getTimeWindowChange(chartPrices)
  const isChangePositive = changeValue >= 0
  const chartHeight = isChartExpanded ? 'calc(100vh - 220px)' : '320px'
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const currentDate = new Date().toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  useEffect(() => {
    let cancelled = false

    const fetchCandles = async () => {
      if (!pairId || !token0Address) {
        setPairCandles([])
        return
      }

      const candles = await fetchPairCandleData(pairId, token0Address, timeWindow)

      if (!cancelled) {
        setPairCandles(candles)
      }
    }

    fetchCandles()

    return () => {
      cancelled = true
    }
  }, [pairId, timeWindow, token0Address])

  // Sometimes we might receive array full of zeros for obscure tokens while trying to derive data
  // In that case chart is not useful to users
  const isBadData =
    pairPrices &&
    pairPrices.length > 0 &&
    pairPrices.every(
      (price) => !price.value || price.value === 0 || price.value === Infinity || Number.isNaN(price.value),
    )

  if (isBadData && derivedCandles.length === 0) {
    return (
      <NoChartAvailable
        token0Address={token0Address}
        token1Address={token1Address}
        pairAddress={pairId}
        isMobile={isMobile}
      />
    )
  }

  return (
    <>
      <Flex
        flexDirection={['column', null, null, null, null, null, 'row']}
        alignItems={['flex-start', null, null, null, null, null, 'center']}
        justifyContent="space-between"
        px="24px"
        flexWrap="wrap"
      >
        <Flex flexDirection="column" pt="12px">
          <PairPriceDisplay
            value={pairPrices?.length > 0 && valueToDisplay}
            inputSymbol={inputCurrency?.symbol}
            outputSymbol={outputCurrency?.symbol}
          >
            <Text color={isChangePositive ? 'success' : 'failure'} fontSize="20px" ml="4px" bold>
              {`${isChangePositive ? '+' : ''}${changeValue.toFixed(3)} (${changePercentage}%)`}
            </Text>
          </PairPriceDisplay>
          <Text small color="secondary">
            {hoverDate || currentDate}
          </Text>
        </Flex>
        <Box>
          <ButtonMenu activeIndex={timeWindow} onItemClick={setTimeWindow} scale="sm">
            <ButtonMenuItem>{t('24H')}</ButtonMenuItem>
            <ButtonMenuItem>{t('1W')}</ButtonMenuItem>
            <ButtonMenuItem>{t('1M')}</ButtonMenuItem>
            <ButtonMenuItem>{t('1Y')}</ButtonMenuItem>
          </ButtonMenu>
        </Box>
      </Flex>
      <Box height={isMobile ? '100%' : chartHeight} p={isMobile ? '0px' : '16px'} width="100%">
        {derivedCandles.length > 0 ? (
          <SwapCandleChart
            data={derivedCandles}
            setHoverValue={setHoverValue}
            setHoverDate={setHoverDate}
            isChartExpanded={isChartExpanded}
            timeWindow={timeWindow}
          />
        ) : (
          <SwapLineChart
            data={pairPrices}
            setHoverValue={setHoverValue}
            setHoverDate={setHoverDate}
            isChangePositive={isChangePositive}
            isChartExpanded={isChartExpanded}
            timeWindow={timeWindow}
          />
        )}
      </Box>
    </>
  )
}

export default memo(BasicChart, (prev, next) => {
  return (
    prev.token0Address === next.token0Address &&
    prev.token1Address === next.token1Address &&
    prev.isChartExpanded === next.isChartExpanded &&
    prev.isMobile === next.isMobile &&
    prev.isChartExpanded === next.isChartExpanded &&
    ((prev.currentSwapPrice !== null &&
      next.currentSwapPrice !== null &&
      prev.currentSwapPrice[prev.token0Address] === next.currentSwapPrice[next.token0Address] &&
      prev.currentSwapPrice[prev.token1Address] === next.currentSwapPrice[next.token1Address]) ||
      (prev.currentSwapPrice === null && next.currentSwapPrice === null))
  )
})
