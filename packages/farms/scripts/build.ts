/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import path from 'path'
import fs from 'fs'
import farm137 from '../constants/137'
import farm80001 from '../constants/80001'

import lpHelpers80001 from '../constants/priceHelperLps/80001'
import lpHelpers137 from '../constants/priceHelperLps/137'

const chains = [
  [137, farm137, lpHelpers137],
  [80001, farm80001, lpHelpers80001],
]

export const saveList = async () => {
  console.info('save farm config...')
  const listsDir = path.resolve('lists')
  const priceHelperLpsDir = path.resolve('lists/priceHelperLps')
  
  try {
    if (!fs.existsSync(listsDir)) {
      fs.mkdirSync(listsDir, { recursive: true })
    }
    if (!fs.existsSync(priceHelperLpsDir)) {
      fs.mkdirSync(priceHelperLpsDir, { recursive: true })
    }
  } catch (error) {
    console.error('Error creating directories:', error)
    throw error
  }

  for (const [chain, farm, lpHelper] of chains) {
    try {
      console.info('Starting build farm config', chain)
      const farmListPath = path.join(listsDir, `${chain}.json`)
      const stringifiedList = JSON.stringify(farm, null, 2)
      fs.writeFileSync(farmListPath, stringifiedList)
      console.info('Farm list saved to ', farmListPath)

      const lpPriceHelperListPath = path.join(priceHelperLpsDir, `${chain}.json`)
      const stringifiedHelperList = JSON.stringify(lpHelper, null, 2)
      fs.writeFileSync(lpPriceHelperListPath, stringifiedHelperList)
      console.info('Lp list saved to ', lpPriceHelperListPath)
    } catch (error) {
      console.error(`Error processing chain ${chain}:`, error)
      throw error
    }
  }
}

saveList().catch((error) => {
  console.error('Build failed:', error)
  process.exit(1)
})
