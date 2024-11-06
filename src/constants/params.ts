import { ASI_ALLIANCE } from './chain/cosmos/asiAlliance';
import { ASSET_MANTLE } from './chain/cosmos/assetMantle';
import { CRONOS_POS } from './chain/cosmos/cronosPos';
import { GRAVITY_BRIDGE } from './chain/cosmos/gravityBridge';
import { HUMANS_AI } from './chain/cosmos/humansAi';
import { KI } from './chain/cosmos/ki';
import { MARS } from './chain/cosmos/mars';
import { ONOMY } from './chain/cosmos/onomy';
import { STAFIHUB } from './chain/cosmos/stafihub';
import { UX } from './chain/cosmos/ux';
import { ZETA } from './chain/cosmos/zeta';
import { ALTHEA as ETHEREUM_NETWORK__ALTHEA } from './chain/ethereum/network/althea';
import { ARBITRUM as ETHEREUM_NETWORK__ARBITRUM } from './chain/ethereum/network/arbitrum';
import { AVALANCHE as ETHEREUM_NETWORK__AVALANCHE } from './chain/ethereum/network/avalanche';
import { BASE as ETHEREUM_NETWORK__BASE } from './chain/ethereum/network/base';
import { CANTO as ETHEREUM_NETWORK__CANTO } from './chain/ethereum/network/canto';
import { CRONOS as ETHEREUM_NETWORK__CRONOS } from './chain/ethereum/network/cronos';
import { DYMENSION as ETHEREUM_NETWORK__DYMENSION } from './chain/ethereum/network/dymension';
import { ETHEREUM as ETHEREUM_NETWORK__ETHEREUM } from './chain/ethereum/network/ethereum';
import { EVMOS as ETHEREUM_NETWORK__EVMOS } from './chain/ethereum/network/evmos';
import { FANTOM as ETHEREUM_NETWORK__FANTOM } from './chain/ethereum/network/fantom';
import { HARMONY as ETHEREUM_NETWORK__HARMONY } from './chain/ethereum/network/harmony';
import { KAVA as ETHEREUM_NETWORK__KAVA } from './chain/ethereum/network/kava';
import { OKT as ETHEREUM_NETWORK__OKT } from './chain/ethereum/network/okt';
import { OPTIMISM as ETHEREUM_NETWORK__OPTIMISM } from './chain/ethereum/network/optimism';
import { POLYGON as ETHEREUM_NETWORK__POLYGON } from './chain/ethereum/network/polygon';
import { SCROLL_SEPOLIA_TESTNET as ETHEREUM_NETWORK__SCROLL_SEPOLIA_TESTNET } from './chain/ethereum/network/scrollSepoliaTestnet';
import { SMART_CHAIN as ETHEREUM_NETWORK__SMART_CHAIN } from './chain/ethereum/network/smartChain';
import { ZETA as ETHEREUM_NETWORK__ZETA } from './chain/ethereum/network/zeta';

export const CHAIN_ID_TO_ASSET_NAME_MAPS = {
  [CRONOS_POS.chainId]: 'crypto-org',
  [ASSET_MANTLE.chainId]: 'asset-mantle',
  [GRAVITY_BRIDGE.chainId]: 'gravity-bridge',
  [KI.chainId]: 'ki-chain',
  [STAFIHUB.chainId]: 'stafi',
  [ASI_ALLIANCE.chainId]: 'fetchai',
  [MARS.chainId]: 'mars-protocol',
  [HUMANS_AI.chainId]: 'humans',
  [ONOMY.chainId]: 'onomy-protocol',
  [UX.chainId]: 'umee',
  [ZETA.chainId]: 'zeta',

  [ETHEREUM_NETWORK__ETHEREUM.chainId]: 'ethereum',
  [ETHEREUM_NETWORK__ALTHEA.chainId]: 'althea',
  [ETHEREUM_NETWORK__ARBITRUM.chainId]: 'arbitrum',
  [ETHEREUM_NETWORK__AVALANCHE.chainId]: 'avalanche',
  [ETHEREUM_NETWORK__BASE.chainId]: 'base',
  [ETHEREUM_NETWORK__CANTO.chainId]: 'canto',
  [ETHEREUM_NETWORK__CRONOS.chainId]: 'cronos',
  [ETHEREUM_NETWORK__DYMENSION.chainId]: 'dymension',
  [ETHEREUM_NETWORK__EVMOS.chainId]: 'evmos',
  [ETHEREUM_NETWORK__FANTOM.chainId]: 'fantom',
  [ETHEREUM_NETWORK__HARMONY.chainId]: 'harmony',
  [ETHEREUM_NETWORK__KAVA.chainId]: 'kava',
  [ETHEREUM_NETWORK__OKT.chainId]: 'okc',
  [ETHEREUM_NETWORK__OPTIMISM.chainId]: 'optimism',
  [ETHEREUM_NETWORK__POLYGON.chainId]: 'polygon',
  [ETHEREUM_NETWORK__SMART_CHAIN.chainId]: 'bnb-smart-chain',
  [ETHEREUM_NETWORK__SCROLL_SEPOLIA_TESTNET.chainId]: 'scroll-sepolia-testnet',
  [ETHEREUM_NETWORK__ZETA.chainId]: 'zeta',
};
