import { useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useFastRefreshEffect } from 'hooks/useRefreshEffect'
import { SerializedPool } from 'state/types'
import { transformPool } from 'state/pools/helpers'
import { getCakeContract } from 'utils/contractHelpers'
import { PoolCategory } from 'config/constants/types'
import { bscTokens } from '@pancakeswap/tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { fetchUserStakeBalances, fetchUserPendingRewards } from './fetchPoolsUser'

export interface PoolsState {
  data: SerializedPool
  userDataLoaded: boolean
}

const cakeContract = getCakeContract()

const initialData = {
  data: {
    sousId: 0,
    stakingToken: bscTokens.cake.serialize,
    earningToken: bscTokens.cake.serialize,
    contractAddress: {
      80001: '',
      137: '0x641084ecc9Ddb557BbA1eE3dE5fCcAf5E88159ED',
    },
    poolCategory: PoolCategory.CORE,
    tokenPerBlock: '10',
    isFinished: false,
    totalStaked: '0',
  },
  userDataLoaded: false,
}

export const useFetchUserPools = (account) => {
  const { chainId } = useActiveChainId()
  const [userPoolsData, setPoolsUserData] = useState<PoolsState>(initialData)

  const fetchUserPoolsData = useCallback(() => {
    if (account) {
      const fetchPoolsUserDataAsync = async () => {
        try {
          const [stakedBalances, pendingRewards, totalStaking] = await Promise.all([
            fetchUserStakeBalances(account),
            fetchUserPendingRewards(account),
            cakeContract.balanceOf(initialData.data.contractAddress[chainId]),
          ])

          const userData = {
            sousId: initialData.data.sousId,
            allowance: '0',
            stakingTokenBalance: '0',
            stakedBalance: stakedBalances,
            pendingReward: pendingRewards,
          }

          setPoolsUserData((old) => ({
            data: {
              ...old.data,
              userData,
              totalStaked: new BigNumber(totalStaking.toString()).toJSON(),
            },
            userDataLoaded: true,
          }))
        } catch (error) {
          console.error('[Pools Action] Error fetching pool user data', error)
        }
      }

      fetchPoolsUserDataAsync()
    }
  }, [account, chainId])

  useFastRefreshEffect(() => {
    fetchUserPoolsData()
  }, [fetchUserPoolsData])

  return {
    data: transformPool(userPoolsData.data),
    userDataLoaded: userPoolsData.userDataLoaded,
    fetchUserPoolsData,
  }
}
