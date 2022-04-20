import ethereumImg from '~/images/symbols/ethereum.png';
import type { EthereumChain, EthereumNetwork, TendermintChain } from '~/types/chain';

import { AKASH } from './tendermint/akash';
import { ASSET_MANTLE } from './tendermint/assetMantle';
import { AXELAR } from './tendermint/axelar';
import { BAND } from './tendermint/band';
import { BITCANNA } from './tendermint/bitcanna';
import { BITSONG } from './tendermint/bitsong';
import { CERBERUS } from './tendermint/cerberus';
import { CERTIK } from './tendermint/certik';
import { CHIHUAHUA } from './tendermint/chihuahua';
import { COMDEX } from './tendermint/comdex';
import { COSMOS } from './tendermint/cosmos';
import { CRESCENT } from './tendermint/crescent';
import { CRYPTO_COM } from './tendermint/cryptoCom';
import { DESMOS } from './tendermint/desmos';
import { EMONEY } from './tendermint/emoney';
import { FETCH_AI } from './tendermint/fetchAi';
import { GRAVITY_BRIDGE } from './tendermint/gravityBridge';
import { IRIS } from './tendermint/iris';
import { JUNO } from './tendermint/juno';
import { KAVA } from './tendermint/kava';
import { KI } from './tendermint/ki';
import { KONSTELLATION } from './tendermint/konstellation';
import { LUM } from './tendermint/lum';
import { MEDIBLOC } from './tendermint/medibloc';
import { OMNIFLIX } from './tendermint/omniflix';
import { OSMOSIS } from './tendermint/osmosis';
import { PERSISTENCE } from './tendermint/persistence';
import { PROVENANCE } from './tendermint/provenance';
import { REGEN } from './tendermint/regen';
import { RIZON } from './tendermint/rizon';
import { SENTINEL } from './tendermint/sentinel';
import { SIF } from './tendermint/sif';
import { STARGAZE } from './tendermint/stargaze';
import { STARNAME } from './tendermint/starname';
import { UMEE } from './tendermint/umee';

export const LINE_TYPE = {
  TENDERMINT: 'TENDERMINT',
  ETHEREUM: 'ETHEREUM',
} as const;

export const TENDERMINT_TYPE = {
  BASIC: '',
  ETHERMINT: 'ETHERMINT',
} as const;

export const DEFAULT_GAS = '100000';

export const TENDERMINT_CHAINS: TendermintChain[] = [
  COSMOS,
  AKASH,
  ASSET_MANTLE,
  AXELAR,
  BAND,
  BITCANNA,
  BITSONG,
  CERBERUS,
  CERTIK,
  CHIHUAHUA,
  COMDEX,
  CRESCENT,
  CRYPTO_COM,
  DESMOS,
  EMONEY,
  FETCH_AI,
  GRAVITY_BRIDGE,
  IRIS,
  JUNO,
  KAVA,
  KI,
  KONSTELLATION,
  LUM,
  MEDIBLOC,
  OMNIFLIX,
  OSMOSIS,
  PERSISTENCE,
  PROVENANCE,
  REGEN,
  RIZON,
  SENTINEL,
  SIF,
  STARGAZE,
  STARNAME,
  UMEE,
];

export const ETHEREUM_CHAINS: EthereumChain[] = [
  // {
  //   id: '33c328b1-2d5f-43f1-ac88-25be1a5abf6c',
  //   chainName: 'Ethereum',
  //   imageURL: ethereumImg,
  //   line: LINE_TYPE.ETHEREUM,
  //   bip44: {
  //     purpose: "44'",
  //     coinType: "60'",
  //     account: "0'",
  //     change: '0',
  //   },
  // },
];

export const ETHEREUM_NETWORKS: EthereumNetwork[] = [
  {
    id: '63c2c3dd-7ab1-47d7-9ec8-c70c64729cc6',
    ethereumChainId: '33c328b1-2d5f-43f1-ac88-25be1a5abf6c',
    chainId: '1',
    networkName: 'mainnet',
    // rpcURL: 'http://61.74.179.193:50001',
    rpcURL: 'https://api.mycryptoapi.com/eth',
    imageURL: ethereumImg,
    baseDenom: 'weth',
    displayDenom: 'eth',
    decimals: 18,
    explorerURL: 'https://etherscan.io',
    coinGeckoId: 'ethereum',
  },
];

export const CHAINS = [...ETHEREUM_CHAINS, ...TENDERMINT_CHAINS];
