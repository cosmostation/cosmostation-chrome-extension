import type { V11Asset, V11Spltoken } from '@/types/apiV11';

export const solana = {
  forum: { governance: '', main: '' },
  chain_id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
  chain_name: 'Solana',
  chain_image: 'https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/solana/asset/sol.png',
  main_asset_denom: 'sol',
  main_asset_symbol: 'SOL',
  main_asset_image: 'https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/solana/asset/sol.png',
  gas_asset_denom: 'sol',
  gas_asset_symbol: 'SOL',
  gas_asset_image: 'https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/solana/asset/sol.png',
  origin_genesis_time: '2015-07-30T03:26:13Z',
  api_name: 'solana',
  is_support_mobile_wallet: false,
  is_support_extension_wallet: true,
  is_support_erc20: false,
  chain_type: ['solana'],
  solana_program_id: {
    spl_token: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  },
  solana_fee_info: {
    simulated_gas_multiply: 1.3,
  },
  account_type: [
    {
      is_default: true,
      hd_path: "m/44'/501'/0'/X'",
      pubkey_style: 'ed25519',
      pubkey_type: '',
    },
  ],
  rpc_endpoint: [
    {
      provider: 'solana',
      url: 'https://api.mainnet-beta.solana.com',
    },
    {
      provider: 'allnodes',
      url: 'https://solana-rpc.publicnode.com',
    },
  ],
  explorer: {
    name: 'Solana Explorer',
    url: 'https://explorer.solana.com',
    account: 'https://explorer.solana.com/address/${address}',
    tx: 'https://explorer.solana.com/tx/${hash}',
    proposal: '',
  },
  about: {
    website: 'https://solana.com',
    docs: 'https://solana.com/docs',
    github: 'https://github.com/solana-foundation/solana-com',
    blog: 'https://solana.com/ko/news',
    medium: '',
    twitter: 'https://x.com/solana',
    coingecko: 'https://www.coingecko.com/en/coins/solana',
  },
  description: {
    ko: '이더리움은 암호화폐 이더리움(ETH)과 수천 개의 분산형 애플리케이션을 지원하는 L1 체인입니다.',
    en: 'Ethereum is the community-run technology powering the cryptocurrency ether (ETH) and thousands of decentralized applications.',
    ja: 'Ethereumは、暗号通貨Ethereum（ETH）と数千の分散型アプリケーションをサポートするL1チェーンです。',
  },
};

export const solanaTestAssets: V11Asset[] = [
  {
    type: 'native',
    denom: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    description: 'Solana Native Coin',
    decimals: 9,
    image: 'https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/solana/asset/sol.png',
    coinGeckoId: 'solana',
    chain: 'solana',
  },
];

export const solanaSplAssets: V11Spltoken[] = [
  {
    chain: 'solana',
    type: 'spl-token',
    contract: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    description: 'USD Coin',
    image: 'https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/ethereum/asset/usdc.png',
    coinGeckoId: 'usd-coin',
  },
];
