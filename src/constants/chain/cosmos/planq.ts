import planqChainImg from '~/images/chainImgs/planq.png';
import planqTokenImg from '~/images/symbols/planq.png';
import type { CosmosChain } from '~/types/chain';

export const PLANQ: CosmosChain = {
  id: 'e16665cd-8866-4a64-ba6d-0fdf4a435f80',
  line: 'COSMOS',
  type: 'ETHERMINT',
  chainId: 'planq_7070-2',
  chainName: 'PLANQ',
  restURL: 'https://rest.planq.network',
  tokenImageURL: planqTokenImg,
  imageURL: planqChainImg,
  baseDenom: 'aplanq',      
  displayDenom: 'PLANQ',
  decimals: 18,
  bip44: {
    purpose: "44'",
    coinType: "60'",
    account: "0'",
    change: '0',
  },
  bech32Prefix: { address: 'plq' },
  coinGeckoId: 'planq',
  explorerURL: `https://explorer.tendermint.roomit.xyz/planq-mainnet`,
  gasRate: {
    tiny: '30000000000',
    low: '35000000000',
    average: '40000000000',
  },
  gas: { send: '150000', ibcSend: '180000' },
};
