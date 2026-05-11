import { Flex, Skeleton, Text, FlexGap, FlexGapProps } from '@pancakeswap/uikit'
import styled from 'styled-components'

interface TokenDisplayProps extends FlexGapProps {
  value?: number | string
  inputSymbol?: string
  outputSymbol?: string
  format?: boolean
}

const TextLabel = styled(Text)`
  font-size: 32px;
  line-height: 1.1;

  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 40px;
  }
`

const formatPrice = (value: number) => {
  if (!Number.isFinite(value)) {
    return '-'
  }

  return new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 6,
    useGrouping: false,
  }).format(value)
}

const PairPriceDisplay: React.FC<React.PropsWithChildren<TokenDisplayProps>> = ({
  value,
  inputSymbol,
  outputSymbol,
  children,
  format = true,
  ...props
}) => {
  return value ? (
    <FlexGap alignItems="baseline" {...props}>
      <Flex alignItems="inherit">
        <TextLabel mr="8px" bold>
          {format ? formatPrice(typeof value === 'string' ? parseFloat(value) : value) : value}
        </TextLabel>
        {inputSymbol && outputSymbol && (
          <Text color="textSubtle" fontSize="20px" bold lineHeight={1.1}>
            {`${inputSymbol}/${outputSymbol}`}
          </Text>
        )}
      </Flex>
      {children}
    </FlexGap>
  ) : (
    <Skeleton height="36px" width="128px" {...props} />
  )
}

export default PairPriceDisplay
