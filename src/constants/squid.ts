import type { CosmosChain } from '~/types/chain';

import { ASSET_MANTLE } from './chain/cosmos/assetMantle';
import { COMDEX } from './chain/cosmos/comdex';
import { CRESCENT } from './chain/cosmos/crescent';
import { EVMOS } from './chain/cosmos/evmos';
import { JUNO } from './chain/cosmos/juno';
import { KUJIRA } from './chain/cosmos/kujira';
import { OSMOSIS } from './chain/cosmos/osmosis';
import { REGEN } from './chain/cosmos/regen';
import { SECRET } from './chain/cosmos/secret';
import { STARGAZE } from './chain/cosmos/stargaze';
import { UMEE } from './chain/cosmos/umee';

export const SQUID_SUPPORTED_COSMOS_CHAINS: CosmosChain[] = [ASSET_MANTLE, COMDEX, CRESCENT, EVMOS, JUNO, KUJIRA, OSMOSIS, REGEN, SECRET, STARGAZE, UMEE];

export const SQUID_CONTRACT_ADDRESS = '0xce16F69375520ab01377ce7B88f5BA8C48F8D666';

export const SQUID_BASE_URL = 'https://api.0xsquid.com';
