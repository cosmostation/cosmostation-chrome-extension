import type { CosmosChain, EthereumNetwork } from '~/types/chain';

import { ASSET_MANTLE } from './chain/cosmos/assetMantle';
import { COMDEX } from './chain/cosmos/comdex';
import { CRESCENT } from './chain/cosmos/crescent';
import { EVMOS } from './chain/cosmos/evmos';
import { FETCH_AI } from './chain/cosmos/fetchAi';
import { JUNO } from './chain/cosmos/juno';
import { KUJIRA } from './chain/cosmos/kujira';
import { OSMOSIS } from './chain/cosmos/osmosis';
import { REGEN } from './chain/cosmos/regen';
import { SECRET } from './chain/cosmos/secret';
import { STARGAZE } from './chain/cosmos/stargaze';
import { UMEE } from './chain/cosmos/umee';
import { ARBITRUM } from './chain/ethereum/network/arbitrum';
import { AVALANCHE } from './chain/ethereum/network/avalanche';
import { ETHEREUM } from './chain/ethereum/network/ethereum';
import { FANTOM } from './chain/ethereum/network/fantom';
import { KAVA } from './chain/ethereum/network/kava';
import { POLYGON } from './chain/ethereum/network/polygon';
import { SMART_CHAIN } from './chain/ethereum/network/smartChain';

// FIXME : This is a temporary solution. We need to find a better way to handle this.
export const SQUID_SUPPORTED_EVM_CHAINS: EthereumNetwork[] = [ETHEREUM, ARBITRUM, AVALANCHE, POLYGON, SMART_CHAIN, FANTOM, KAVA];

export const SQUID_SUPPORTED_COSMOS_CHAINS: CosmosChain[] = [
  ASSET_MANTLE,
  COMDEX,
  CRESCENT,
  EVMOS,
  JUNO,
  KUJIRA,
  OSMOSIS,
  REGEN,
  SECRET,
  STARGAZE,
  UMEE,
  FETCH_AI,
];

export const SQUID_CONTRACT_ADDRESS = '0xce16F69375520ab01377ce7B88f5BA8C48F8D666';

export const SQUID_BASE_URL = 'https://api.0xsquid.com';
