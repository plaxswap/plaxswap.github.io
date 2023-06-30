import { Chain } from 'wagmi'

export const canto = {
 id: 7700,
 name: 'Canto',
 network: 'canto',
 nativeCurrency: {
 decimals: 18,
 name: 'Canto',
 symbol: 'CANTO',
 },
 rpcUrls: {
 public: { http: ['https://canto.slingshot.finance'] },
 default: { http: ['https://canto.slingshot.finance'] },
 },
 blockExplorers: {
 etherscan: { name: 'CantoExplorer', url: 'https://evm.explorer.canto.io' },
 default: { name: 'CantoExplorer', url: 'https://evm.explorer.canto.io/' },
 },
}

 export const core = {
    id: 1116,
    name: 'Core',
    network: 'core',
    nativeCurrency: {
    decimals: 18,
    name: 'Core',
    symbol: 'CORE',
    },
    rpcUrls: {
    public: { http: ['https://rpc-core.icecreamswap.com'] },
    default: { http: ['https://rpc-core.icecreamswap.com'] },
    },
    blockExplorers: {
    etherscan: { name: 'CoreScan', url: 'https://scan.coredao.org' },
    default: { name: 'CoreScan', url: 'https://scan.coredao.org' },
    },

    
} as const satisfies Chain
