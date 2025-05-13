import { ModalProvider, light, dark, UIKitProvider } from '@pancakeswap/uikit'
import { Provider } from 'react-redux'
import { SWRConfig } from 'swr'
import { LanguageProvider } from '@pancakeswap/localization'
import { fetchStatusMiddleware } from 'hooks/useSWRContract'
import { Store } from '@reduxjs/toolkit'
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from 'next-themes'
import { WagmiProvider } from '@pancakeswap/wagmi'
import { client } from 'utils/wagmi'
import { HistoryManagerProvider } from 'contexts/HistoryContext'
import { createAppKit } from '@reown/appkit/react'
import { polygon } from '@reown/appkit/networks'
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";

const projectId = '9ba1c138ff7ad815f7026b920b652f0b'
const networks = [polygon]

const metadata = {
  name: 'plaxswap',
  description: 'PlaxSwap DEX',
  url: 'https://plaxswap.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

const modal = createAppKit({
  adapters: [new Ethers5Adapter()],
  projectId: projectId,
  networks: [polygon],
  enableWalletGuide: false,
  enableWalletConnect: true,
  metadata: metadata,
  features: {
    analytics: true,
    email: false,
    socials: false,
    onramp: false,
    swaps: false,
  },
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
    '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662',
    '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4',
    '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150',
    '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66',
    '15c8b91ade1a4e58f3ce4e7a0dd7f42b47db0c8df7e0d84f63eb39bcb96c4e0f',
    'bb71b54ced62aa11f76e4f3edacb37a41300807506db840b98b740379f99cc71'
  ],
})

const StyledUIKitProvider: React.FC<React.PropsWithChildren> = ({ children, ...props }) => {
  const { resolvedTheme } = useNextTheme()
  return (
    <UIKitProvider children={children} theme={resolvedTheme === 'dark' ? dark : light} {...props}>
      {children}
    </UIKitProvider>
  )
}

const Providers: React.FC<React.PropsWithChildren<{ store: Store; children: React.ReactNode }>> = ({
  children,
  store,
}) => {
  return (
    <WagmiProvider client={client}>
      <Provider store={store} children={children}>
        <NextThemeProvider>
          <StyledUIKitProvider>
            <LanguageProvider>
              <SWRConfig
                value={{
                  use: [fetchStatusMiddleware],
                }}
              >
                <HistoryManagerProvider children={children}>
                  <ModalProvider>{children}</ModalProvider>
                </HistoryManagerProvider>
              </SWRConfig>
            </LanguageProvider>
          </StyledUIKitProvider>
        </NextThemeProvider>
      </Provider>
    </WagmiProvider>
  )
}

export default Providers
