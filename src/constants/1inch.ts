import type { EthereumNetwork } from '~/types/chain';

import { ARBITRUM } from './chain/ethereum/network/arbitrum';
import { AVALANCHE } from './chain/ethereum/network/avalanche';
import { ETHEREUM } from './chain/ethereum/network/ethereum';
import { FANTOM } from './chain/ethereum/network/fantom';
import { OPTIMISM } from './chain/ethereum/network/optimism';
import { POLYGON } from './chain/ethereum/network/polygon';
import { SMART_CHAIN } from './chain/ethereum/network/smartChain';

export const ONEINCH_SUPPORTED_CHAINS: EthereumNetwork[] = [ETHEREUM, SMART_CHAIN, POLYGON, OPTIMISM, ARBITRUM, AVALANCHE, FANTOM];

export const REFERRER_ADDRESS = undefined;

export const FEE_RATIO = undefined;
