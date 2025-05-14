import { memo, PropsWithChildren } from 'react'
import styled from 'styled-components'

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.colors.gradientVioletAlt};
  @media only screen and (max-width: 575px) and (min-height: 740px) {
    height: calc(100vh - 150px);
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    height: calc(100vh - 100px);
  }
  overflow: hidden;
`

const Container: React.FC<PropsWithChildren> = ({ children }) => {
  return <StyledContainer>{children}</StyledContainer>
}

export default memo(Container)
