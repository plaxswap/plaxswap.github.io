import { Button, ButtonProps } from '@pancakeswap/uikit'
import { useAppKit } from '@reown/appkit/react'
import { createElement } from 'react'
// @ts-ignore
// eslint-disable-next-line import/extensions
import { useActiveHandle } from 'hooks/useEagerConnect.bmp.ts'
import Trans from './Trans'

const ConnectWalletButton = ({ children, ...props }: ButtonProps) => {
  const handleActive = useActiveHandle()
  const { open } = useAppKit()

  const handleClick = () => {
    if (typeof __NEZHA_BRIDGE__ !== 'undefined') {
      handleActive()
    } else {
      open()
    }
  }

  return (
    <Button onClick={handleClick} {...props}>
      {children || createElement(Trans, null, 'Connect Wallet')}
    </Button>
  )
}

export default ConnectWalletButton
