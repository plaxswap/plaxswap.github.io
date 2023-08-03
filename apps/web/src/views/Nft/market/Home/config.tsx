import { LinkExternal } from '@pancakeswap/uikit'
import { ContextApi } from '@pancakeswap/localization'

const config = (t: ContextApi['t']) => {
  return [
    {
      title: t('I sold an NFT, where’s my MATIC?'),
      description: [
        t(
          'Trades are settled in WMATIC, which is a wrapped version of MATIC used on Polygon Chain. That means that when you sell an item, WMATIC is sent to your wallet instead of MATIC.',
        ),
        t('You can instantly swap your WMATIC for MATIC with no trading fees on PlaxSwap.'),
      ],
    },
    {
      title: t('How can I list my NFT collection on the Market?'),
      description: [
        t('In Phase 2 of the NFT Marketplace, collections must be whitelisted before they may be listed.'),
        t('We are now accepting applications from NFT collection owners seeking to list their collections.'),
        <LinkExternal href="https://docs.pancakeswap.finance/contact-us/nft-market-applications">
          {t('Please apply here')}
        </LinkExternal>,
      ],
    },
    {
      title: t('What are the fees?'),
      description: [
        t(
          '100% of all platform fees taken by PlaxSwap from sales are used to buy back and BURN PLAX tokens in our weekly PLAX burns.',
        ),
        t(
          'Platform fees: 2% is subtracted from NFT sales on the market. Subject to change.Collection fees: Additional fees may be taken by collection creators, once those collections are live. These will not contribute to the PLAX burns.',
        ),
      ],
    },
  ]
}

export default config
