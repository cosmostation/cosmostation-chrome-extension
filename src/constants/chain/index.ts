import type { CosmosChain, CosmosFeeBaseDenom, CosmosGasRate, EthereumChain, EthereumNetwork } from '~/types/chain';

import { AKASH } from './cosmos/akash';
import { ASSET_MANTLE } from './cosmos/assetMantle';
import { AXELAR } from './cosmos/axelar';
import { BAND } from './cosmos/band';
import { BITCANNA } from './cosmos/bitcanna';
import { BITSONG } from './cosmos/bitsong';
import { CERBERUS } from './cosmos/cerberus';
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
import { LIKE_COIN } from './cosmos/likeCoin';
import { LUM } from './cosmos/lum';
import { MEDIBLOC } from './cosmos/medibloc';
import { NYX, NYX_FEE_BASE_DENOMS, NYX_GAS_RATES } from './cosmos/nyx';
import { OMNIFLIX } from './cosmos/omniflix';
import { OSMOSIS } from './cosmos/osmosis';
import { PASSAGE } from './cosmos/passage';
import { PERSISTENCE } from './cosmos/persistence';
import { PROVENANCE } from './cosmos/provenance';
import { REGEN } from './cosmos/regen';
import { RIZON } from './cosmos/rizon';
import { SECRET } from './cosmos/secret';
import { SENTINEL } from './cosmos/sentinel';
import { SHENTU } from './cosmos/shentu';
import { SIF } from './cosmos/sif';
import { STARGAZE } from './cosmos/stargaze';
import { STARNAME } from './cosmos/starname';
import { TGRADE } from './cosmos/tgrade';
import { UMEE } from './cosmos/umee';
import { ETHEREUM } from './ethereum/ethereum';
import { ARBITRUM as NETWORK__ARBITRUM } from './ethereum/network/arbitrum';
import { AVALANCHE as NETWORK__AVALANCHE } from './ethereum/network/avalanche';
import { CRONOS as NETWORK__CRONOS } from './ethereum/network/cronos';
import { ETHEREUM as NETWORK__ETHEREUM } from './ethereum/network/ethereum';
import { EVMOS as NETWORK__EVMOS } from './ethereum/network/evmos';
import { FANTOM as NETWORK__FANTOM } from './ethereum/network/fantom';
import { HARMONY as NETWORK__HARMONY } from './ethereum/network/harmony';
import { POLYGON as NETWORK__POLYGON } from './ethereum/network/polygon';
import { SMART_CHAIN as NETWORK__SMART_CHAIN } from './ethereum/network/smartChain';

export const LINE_TYPE = {
  COSMOS: 'COSMOS',
  ETHEREUM: 'ETHEREUM',
  COMMON: 'COMMON',
} as const;

export const COSMOS_DEFAULT_GAS = '100000';
export const COSMOS_DEFAULT_SEND_GAS = '100000';
export const COSMOS_DEFAULT_TRANSFER_GAS = '200000';

export const COSMOS_CHAINS: CosmosChain[] = [
  COSMOS,
  AKASH,
  ASSET_MANTLE,
  AXELAR,
  BAND,
  BITCANNA,
  BITSONG,
  CERBERUS,
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
  LIKE_COIN,
  LUM,
  MEDIBLOC,
  NYX,
  OMNIFLIX,
  OSMOSIS,
  PASSAGE,
  PERSISTENCE,
  PROVENANCE,
  REGEN,
  RIZON,
  SECRET,
  SENTINEL,
  SHENTU,
  SIF,
  STARGAZE,
  STARNAME,
  TGRADE,
  UMEE,
];

export const COSMOS_FEE_BASE_DENOMS: CosmosFeeBaseDenom[] = [...NYX_FEE_BASE_DENOMS];

export const COSMOS_GAS_RATES: CosmosGasRate[] = [...NYX_GAS_RATES];

export const ETHEREUM_CHAINS: EthereumChain[] = [ETHEREUM];

export const ETHEREUM_NETWORKS: EthereumNetwork[] = [
  NETWORK__ETHEREUM,
  NETWORK__ARBITRUM,
  NETWORK__AVALANCHE,
  NETWORK__CRONOS,
  NETWORK__EVMOS,
  NETWORK__FANTOM,
  NETWORK__HARMONY,
  NETWORK__POLYGON,
  NETWORK__SMART_CHAIN,
];

export const NETWORKS = [...ETHEREUM_NETWORKS];

export const CHAINS = [...ETHEREUM_CHAINS, ...COSMOS_CHAINS];
