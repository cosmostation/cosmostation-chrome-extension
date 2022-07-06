import type { CosmosChain, EthereumChain, EthereumNetwork } from '~/types/chain';

import { AKASH } from './cosmos/akash';
import { ASSET_MANTLE } from './cosmos/assetMantle';
import { AXELAR } from './cosmos/axelar';
import { BAND } from './cosmos/band';
import { BITCANNA } from './cosmos/bitcanna';
import { BITSONG } from './cosmos/bitsong';
import { CERBERUS } from './cosmos/cerberus';
import { CERTIK } from './cosmos/certik';
import { CHIHUAHUA } from './cosmos/chihuahua';
import { COMDEX } from './cosmos/comdex';
import { COSMOS } from './cosmos/cosmos';
import { CRESCENT } from './cosmos/crescent';
import { CRYPTO_ORG } from './cosmos/cryptoOrg';
import { CUDOS } from './cosmos/cudos';
import { DESMOS } from './cosmos/desmos';
import { EMONEY } from './cosmos/emoney';
import { EVMOS } from './cosmos/evmos';
import { FETCH_AI } from './cosmos/fetchAi';
import { GRAVITY_BRIDGE } from './cosmos/gravityBridge';
import { INJECTIVE } from './cosmos/injective';
import { IRIS } from './cosmos/iris';
import { JUNO } from './cosmos/juno';
import { KAVA } from './cosmos/kava';
import { KI } from './cosmos/ki';
import { KONSTELLATION } from './cosmos/konstellation';
import { LUM } from './cosmos/lum';
import { MEDIBLOC } from './cosmos/medibloc';
import { OMNIFLIX } from './cosmos/omniflix';
import { OSMOSIS } from './cosmos/osmosis';
import { PERSISTENCE } from './cosmos/persistence';
import { PROVENANCE } from './cosmos/provenance';
import { REGEN } from './cosmos/regen';
import { RIZON } from './cosmos/rizon';
import { SENTINEL } from './cosmos/sentinel';
import { SIF } from './cosmos/sif';
import { STARGAZE } from './cosmos/stargaze';
import { STARNAME } from './cosmos/starname';
import { TGRADE } from './cosmos/tgrade';
import { UMEE } from './cosmos/umee';
import { ETHEREUM } from './ethereum/ethereum';
import { ETHEREUM as NETWORK_ETHEREUM } from './ethereum/network/ethereum';
import { EVMOS as NETWORK_EVMOS } from './ethereum/network/evmos';

export const LINE_TYPE = {
  COSMOS: 'COSMOS',
  ETHEREUM: 'ETHEREUM',
} as const;

export const COSMOS_DEFAULT_GAS = '100000';

export const COSMOS_CHAINS: CosmosChain[] = [
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
  CRYPTO_ORG,
  CUDOS,
  DESMOS,
  EMONEY,
  EVMOS,
  FETCH_AI,
  GRAVITY_BRIDGE,
  INJECTIVE,
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
  TGRADE,
  UMEE,
];

export const ETHEREUM_CHAINS: EthereumChain[] = [ETHEREUM];

export const ETHEREUM_NETWORKS: EthereumNetwork[] = [NETWORK_ETHEREUM, NETWORK_EVMOS];

export const NETWORKS = [...ETHEREUM_NETWORKS];

export const CHAINS = [...ETHEREUM_CHAINS, ...COSMOS_CHAINS];
