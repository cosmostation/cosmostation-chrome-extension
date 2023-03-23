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
