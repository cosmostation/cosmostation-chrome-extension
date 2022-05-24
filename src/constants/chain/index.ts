import type { EthereumChain, EthereumNetwork, TendermintChain } from '~/types/chain';

import { ETHEREUM } from './ethereum/ethereum';
import { MAINNET as ETHEREUM_NETWORK_MAINNET } from './ethereum/network/mainnet';
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
import { CRYPTO_ORG } from './tendermint/cryptoOrg';
import { DESMOS } from './tendermint/desmos';
import { EMONEY } from './tendermint/emoney';
import { EVMOS } from './tendermint/evmos';
import { FETCH_AI } from './tendermint/fetchAi';
import { GRAVITY_BRIDGE } from './tendermint/gravityBridge';
import { INJECTIVE } from './tendermint/injective';
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
  CRYPTO_ORG,
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
  UMEE,
];

export const ETHEREUM_CHAINS: EthereumChain[] = [ETHEREUM];

export const ETHEREUM_NETWORKS: EthereumNetwork[] = [ETHEREUM_NETWORK_MAINNET];

export const NETWORKS = [...ETHEREUM_NETWORKS];

export const CHAINS = [...ETHEREUM_CHAINS, ...TENDERMINT_CHAINS];
