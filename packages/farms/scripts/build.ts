/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

const farm137 = require('../constants/137')
const farm80001 = require('../constants/80001')
const lpHelpers80001 = require('../constants/priceHelperLps/80001')
const lpHelpers137 = require('../constants/priceHelperLps/137')

const chains = [
  [137, farm137, lpHelpers137],
  [80001, farm80001, lpHelpers80001],
]

const saveList = async () => {
  console.info('save farm config...')
  try {
    fs.mkdirSync(`${path.resolve()}/lists`)
    fs.mkdirSync(`${path.resolve()}/lists/priceHelperLps`)
  } catch (error) {
    // Directory might already exist
  }
  
  for (const [chain, farm, lpHelper] of chains) {
    console.info('Starting build farm config', chain)
    const farmListPath = `${path.resolve()}/lists/${chain}.json`
    const stringifiedList = JSON.stringify(farm, null, 2)
    fs.writeFileSync(farmListPath, stringifiedList)
    console.info('Farm list saved to ', farmListPath)
    
    const lpPriceHelperListPath = `${path.resolve()}/lists/priceHelperLps/${chain}.json`
    const stringifiedHelperList = JSON.stringify(lpHelper, null, 2)
    fs.writeFileSync(lpPriceHelperListPath, stringifiedHelperList)
    console.info('Lp list saved to ', lpPriceHelperListPath)
  }
}

const buildPath = path.join(__dirname, '../dist')
const srcPath = path.join(__dirname, '../src')

// Clean dist directory
if (fs.existsSync(buildPath)) {
  fs.rmSync(buildPath, { recursive: true })
}

// Create dist directory
fs.mkdirSync(buildPath)

// Copy files
fs.readdirSync(srcPath).forEach((file) => {
  if (file.endsWith('.ts')) {
    const content = fs.readFileSync(path.join(srcPath, file), 'utf8')
    fs.writeFileSync(path.join(buildPath, file), content)
  }
})

// Run tsc
execSync('tsc', { stdio: 'inherit' })

// Save farm configurations
saveList()
