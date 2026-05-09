import { useEffect, useMemo, useRef, useState, Dispatch, SetStateAction } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { baseColors, darkColors, lightColors } from '@pancakeswap/ui/tokens/colors'
import { CandleChartLoader } from 'components/ChartLoaders'
import { format } from 'date-fns'
import useTheme from 'hooks/useTheme'
import { createChart, IChartApi, UTCTimestamp } from 'lightweight-charts'
import { PairCandlesNormalized, PairDataTimeWindowEnum } from 'state/swap/types'

export type SwapCandleChartProps = {
  data: PairCandlesNormalized
  setHoverValue?: Dispatch<SetStateAction<number | undefined>>
  setHoverDate?: Dispatch<SetStateAction<string | undefined>>
  isChartExpanded: boolean
  timeWindow: PairDataTimeWindowEnum
} & React.HTMLAttributes<HTMLDivElement>

const dateFormattingByTimewindow: Record<PairDataTimeWindowEnum, string> = {
  [PairDataTimeWindowEnum.DAY]: 'h:mm a',
  [PairDataTimeWindowEnum.WEEK]: 'MMM dd',
  [PairDataTimeWindowEnum.MONTH]: 'MMM dd',
  [PairDataTimeWindowEnum.YEAR]: 'MMM dd',
}

const SwapCandleChart = ({
  data,
  setHoverValue,
  setHoverDate,
  isChartExpanded,
  timeWindow,
  ...rest
}: SwapCandleChartProps) => {
  const { isDark } = useTheme()
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartCreated, setChart] = useState<IChartApi | undefined>()
  const {
    currentLanguage: { locale },
  } = useTranslation()

  const transformedData = useMemo(
    () =>
      data?.map(({ time, open, high, low, close }) => ({
        time: time as UTCTimestamp,
        open,
        high,
        low,
        close,
      })) || [],
    [data],
  )

  useEffect(() => {
    if (!chartRef.current?.parentElement) {
      return undefined
    }

    const chart = createChart(chartRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: isDark ? darkColors.text : lightColors.text,
      },
      handleScale: false,
      handleScroll: false,
      width: chartRef.current.parentElement.clientWidth - 32,
      height: chartRef.current.parentElement.clientHeight - 32,
      rightPriceScale: {
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        borderVisible: false,
      },
      timeScale: {
        visible: true,
        borderVisible: false,
        secondsVisible: false,
        tickMarkFormatter: (unixTime: number) => {
          return format(unixTime * 1000, dateFormattingByTimewindow[timeWindow])
        },
      },
      grid: {
        horzLines: {
          visible: false,
        },
        vertLines: {
          visible: false,
        },
      },
      crosshair: {
        horzLine: {
          visible: true,
          labelVisible: true,
        },
        mode: 1,
        vertLine: {
          visible: true,
          labelVisible: false,
          style: 3,
          width: 1,
          color: isDark ? '#B8ADD2' : '#7A6EAA',
        },
      },
    })

    const series = chart.addCandlestickSeries({
      upColor: baseColors.success,
      downColor: baseColors.failure,
      borderUpColor: baseColors.success,
      borderDownColor: baseColors.failure,
      wickUpColor: baseColors.success,
      wickDownColor: baseColors.failure,
    })

    const handleResize = () => {
      if (chartRef.current?.parentElement) {
        chart.applyOptions({
          width: chartRef.current.parentElement.clientWidth - 32,
          height: chartRef.current.parentElement.clientHeight - 32,
        })
      }
    }

    setChart(chart)
    series.setData(transformedData)
    chart.timeScale().fitContent()

    chart.subscribeCrosshairMove((param) => {
      if (series && param && param.seriesPrices.size) {
        const timestamp = param.time as number
        const now = new Date(timestamp * 1000)
        const time = `${now.toLocaleString(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'UTC',
        })} (UTC)`
        const parsed = param.seriesPrices.get(series) as { close: number } | undefined
        if (setHoverValue) setHoverValue(parsed?.close)
        if (setHoverDate) setHoverDate(time)
      } else {
        if (setHoverValue) setHoverValue(undefined)
        if (setHoverDate) setHoverDate(undefined)
      }
    })

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [transformedData, isDark, isChartExpanded, locale, timeWindow, setHoverDate, setHoverValue])

  return (
    <>
      {!chartCreated && <CandleChartLoader />}
      <div ref={chartRef} id="swap-candle-chart" {...rest} />
    </>
  )
}

export default SwapCandleChart
