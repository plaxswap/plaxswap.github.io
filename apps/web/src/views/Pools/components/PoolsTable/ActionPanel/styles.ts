import styled from 'styled-components'
import { Flex } from '@pancakeswap/uikit'

export const ActionContainer = styled(Flex)`
  flex: 1;
  flex-direction: column;
  padding: 16px;
  border: 2px solid ${({ theme }) => theme.colors.input};
  border-radius: 16px;
  margin-bottom: 16px;

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-left: 12px;
    margin-right: 12px;
    margin-bottom: 0;
  }

  ${({ theme }) => theme.mediaQueries.xl} {
    margin-left: 32px;
    margin-right: 0;
  }
`

export const RowActionContainer = styled(ActionContainer)`
  flex-direction: row;
`

export const ActionTitles = styled.div`
  font-weight: 600;
  font-size: 12px;
`

export const ActionContent = styled(Flex).attrs({
  mt: '8px',
})`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
