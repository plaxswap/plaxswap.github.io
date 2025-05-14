import { useTranslation } from '@pancakeswap/localization'
import { Button, ButtonProps } from '@pancakeswap/uikit'
import useAuth from 'hooks/useAuth'
// @ts-ignore
// eslint-disable-next-line import/extensions
import { useActiveHandle } from 'hooks/useEagerConnect.bmp.ts'
import { useAppKit,useAppKitAccount } from '@reown/appkit/react'
import { PropsWithChildren } from 'react'
import { ConnectorNames } from 'config/wallet'

const ConnectWalletButton = ({ children, ...props }: PropsWithChildren<ButtonProps>) => {
  const handleActive = useActiveHandle()
  const { login } = useAuth()
  const {
    t,
    currentLanguage: { code },
  } = useTranslation()
  const { open: connectReown } = useAppKit()
  const { isConnected } = useAppKitAccount()


  const handleReownLogin = async () => {
    if (isConnected) {
      login(ConnectorNames.Injected)
    }
  }

  const handleClick = async () => {
    if (typeof __NEZHA_BRIDGE__ !== 'undefined') {
      handleActive()
    } else {
      try {
        await connectReown()
        await handleReownLogin()
      } finally {
        // do nothing
      }
    }
  }


  return (
    <>
      <Button onClick={handleClick} variant="primary">
        {children || t('Connect Wallet')}
      </Button>
      
    </>
  )
}

export default ConnectWalletButton
