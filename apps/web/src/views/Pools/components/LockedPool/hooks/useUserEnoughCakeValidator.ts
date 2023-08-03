import BigNumber from 'bignumber.js'
import { useTranslation } from '@pancakeswap/localization'
import { getBalanceAmount } from '@pancakeswap/utils/formatBalance'

import { useMemo } from 'react'

export const useUserEnoughCakeValidator = (cakeAmount: string, stakingTokenBalance: BigNumber) => {
  const { t } = useTranslation()
  const errorMessage = t('Insufficient PLAX balance')

  const userNotEnoughCake = useMemo(() => {
    if (new BigNumber(cakeAmount).gt(getBalanceAmount(stakingTokenBalance, 8))) return true
    return false
  }, [cakeAmount, stakingTokenBalance])
  return { userNotEnoughCake, notEnoughErrorMessage: errorMessage }
}
