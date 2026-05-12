import { useTranslation } from '@pancakeswap/localization'
import { ChainId } from '@pancakeswap/sdk'
import { SubMenuItems } from '@pancakeswap/uikit'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import { useGetChainName } from 'state/info/hooks'
import { useRouter } from 'next/router'
import { useActiveChainId } from 'hooks/useActiveChainId'
import InfoNav from './components/InfoNav'

export const InfoPageLayout = ({ children }) => {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()
  const router = useRouter()
  const chainName = useGetChainName()
  const { t } = useTranslation()

  useEffect(() => {
    if (account && chainId === ChainId.BSC && router.query.chainName === 'eth')
      router.replace('/info', undefined, { shallow: true })
    else if (account && chainId === ChainId.ETHEREUM && router.query.chainName !== 'eth')
      router.replace('/info/eth', undefined, { shallow: true })
    else if (router.query.type === 'stableSwap') {
      router.replace(router.query.chainName === 'eth' ? '/info/eth' : '/info', undefined, { shallow: true })
    }
  }, [chainId, account, chainName, router])

  return (
    <>
      {chainName === 'BSC' && (
        <SubMenuItems
          items={[
            {
              label: t('Swap'),
              href: '/info',
            },
          ]}
          activeItem="/info"
        />
      )}

      <InfoNav isStableSwap={false} />
      {children}
    </>
  )
}
