import { Button, ButtonProps } from '@pancakeswap/uikit'
import { useAppKit } from '@reown/appkit/react'
import { createElement } from 'react'
import styled from 'styled-components'
// @ts-ignore
// eslint-disable-next-line import/extensions
import { useActiveHandle } from 'hooks/useEagerConnect.bmp.ts'
import Trans from './Trans'

const StyledConnectWalletButton = styled(Button)`
  background: linear-gradient(90deg, #42d7ee 0%, #8450d8 100%);
  box-shadow: none;
  color: #ffffff;

  &:hover:not(:disabled):not(.pancake-button--disabled):not(:active) {
    opacity: 0.85;
  }
`

const ConnectWalletButton = ({ children, style, ...props }: ButtonProps) => {
  const handleActive = useActiveHandle()
  const { open } = useAppKit()
  const restStyle = style ? { ...style } : undefined

  if (restStyle) {
    delete restStyle.background
    delete restStyle.backgroundColor
    delete restStyle.color
  }

  const handleClick = () => {
    if (typeof __NEZHA_BRIDGE__ !== 'undefined') {
      handleActive()
    } else {
      open()
    }
  }

  return (
    <StyledConnectWalletButton onClick={handleClick} style={restStyle} {...props}>
      {children || createElement(Trans, null, 'Connect Wallet')}
    </StyledConnectWalletButton>
  )
}

export default ConnectWalletButton
