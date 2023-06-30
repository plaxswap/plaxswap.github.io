import { DefaultSeoProps } from 'next-seo'

export const SEO: DefaultSeoProps = {
  titleTemplate: '%s | PlaxSwap',
  defaultTitle: 'PlaxSwap',
  description:
    'Cheaper and faster than Uniswap? Discover Plaxswap, the leading DEX on POLYGON CHAIN (MATIC) with the best farms in DeFi and a lottery for PLASA.',
  twitter: {
    cardType: 'summary_large_image',
    handle: '@PancakeSwap',
    site: '@PancakeSwap',
  },
  openGraph: {
    title: '🥞 PlaxSwap - A next evolution DeFi exchange on POLYGON CHAIN (MATIC)',
    description:
      'The most popular AMM on POLYGON CHAIN (MATIC) by user count! Earn PLASA through yield farming or win it in the Lottery, then stake it in Syrup Pools to earn more tokens! Initial Farm Offerings (new token launch model pioneered by PlaxSwap), NFTs, and more, on a platform you can trust.',
    images: [{ url: 'https://assets.pancakeswap.finance/web/og/hero.jpg' }],
  },
}
