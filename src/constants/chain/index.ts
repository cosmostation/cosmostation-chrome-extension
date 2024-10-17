import type { AptosChain, AptosNetwork, BitcoinChain, CosmosChain, CosmosGasRate, EthereumChain, EthereumNetwork, SuiChain, SuiNetwork } from '~/types/chain';

import { APTOS } from './aptos/aptos';
import { DEVNET as APTOS_NETWORK__DEVNET } from './aptos/network/devnet';
import { MAINNET as APTOS_NETWORK__MAINNET } from './aptos/network/mainnet';
import { TESTNET as APTOS_NETWORK__TESTNET } from './aptos/network/testnet';
import { BITCOIN as BITCOIN__BITCOIN } from './bitcoin/bitcoin';
import { TESTNET4 as BITCOIN__TESTNET4 } from './bitcoin/testnet4';
import { AGORIC } from './cosmos/agoric';
import { AKASH } from './cosmos/akash';
import { ALTHEA } from './cosmos/althea';
import { ARCHWAY } from './cosmos/archway';
import { ARTELA_TESTNET } from './cosmos/artelaTestnet';
import { ASI_ALLIANCE } from './cosmos/asiAlliance';
import { ASSET_MANTLE } from './cosmos/assetMantle';
import { ATOM_ONE } from './cosmos/atomOne';
import { AXELAR } from './cosmos/axelar';
import { BAND } from './cosmos/band';
import { BITCANNA } from './cosmos/bitcanna';
import { BITSONG } from './cosmos/bitsong';
import { CANTO } from './cosmos/canto';
import { CELESTIA } from './cosmos/celestia';
import { CHIHUAHUA } from './cosmos/chihuahua';
import { COMDEX } from './cosmos/comdex';
import { COREUM } from './cosmos/coreum';
import { COSMOS } from './cosmos/cosmos';
import { CRONOS_POS } from './cosmos/cronosPos';
import { CUDOS } from './cosmos/cudos';
import { DESMOS } from './cosmos/desmos';
import { DYDX } from './cosmos/dydx';
import { DYMENSION } from './cosmos/dymension';
import { EVMOS } from './cosmos/evmos';
import { FINSCHIA } from './cosmos/finschia';
import { GOVGEN } from './cosmos/govgen';
import { GRAVITY_BRIDGE } from './cosmos/gravityBridge';
import { HUMANS_AI } from './cosmos/humansAi';
import { INJECTIVE } from './cosmos/injective';
import { IRIS } from './cosmos/iris';
import { IXO } from './cosmos/ixo';
import { JUNO } from './cosmos/juno';
import { KAVA } from './cosmos/kava';
import { KI } from './cosmos/ki';
import { KYVE } from './cosmos/kyve';
import { LAVA } from './cosmos/lava';
import { LIKE_COIN } from './cosmos/likeCoin';
import { LUM } from './cosmos/lum';
import { MANTRA } from './cosmos/mantra';
import { MARS } from './cosmos/mars';
import { MEDIBLOC } from './cosmos/medibloc';
import { NEUTRON } from './cosmos/neutron';
import { NIBIRU } from './cosmos/nibiru';
import { NOBLE, NOBLE_GAS_RATES } from './cosmos/noble';
import { NYX, NYX_GAS_RATES } from './cosmos/nyx';
import { OMNIFLIX } from './cosmos/omniflix';
import { ONOMY } from './cosmos/onomy';
import { OSMOSIS } from './cosmos/osmosis';
import { PASSAGE } from './cosmos/passage';
import { PERSISTENCE } from './cosmos/persistence';
import { PROVENANCE } from './cosmos/provenance';
import { PRYZM, PRYZM_GAS_RATES } from './cosmos/pryzm';
import { QUASAR } from './cosmos/quasar';
import { QUICK_SILVER } from './cosmos/quickSilver';
import { REGEN } from './cosmos/regen';
import { RIZON } from './cosmos/rizon';
import { SAGA } from './cosmos/saga';
import { SECRET } from './cosmos/secret';
import { SEI } from './cosmos/sei';
import { SENTINEL } from './cosmos/sentinel';
import { SHENTU } from './cosmos/shentu';
import { SOMMELIER } from './cosmos/sommelier';
import { STAFIHUB } from './cosmos/stafihub';
import { STARGAZE } from './cosmos/stargaze';
import { STRIDE } from './cosmos/stride';
import { TERITORI } from './cosmos/teritori';
import { TERRA } from './cosmos/terra';
import { UX } from './cosmos/ux';
import { XPLA } from './cosmos/xpla';
import { ZETA } from './cosmos/zeta';
import { ETHEREUM } from './ethereum/ethereum';
import { ALTHEA as ETHEREUM_NETWORK__ALTHEA } from './ethereum/network/althea';
import { ARBITRUM as ETHEREUM_NETWORK__ARBITRUM } from './ethereum/network/arbitrum';
import { ARTELA_TESTNET as ETHEREUM_NETWORK__ARTELA_TESTNET } from './ethereum/network/artelaTestnet';
import { AVALANCHE as ETHEREUM_NETWORK__AVALANCHE } from './ethereum/network/avalanche';
import { BASE as ETHEREUM_NETWORK__BASE } from './ethereum/network/base';
import { CANTO as ETHEREUM_NETWORK__CANTO } from './ethereum/network/canto';
import { CRONOS as ETHEREUM_NETWORK__CRONOS } from './ethereum/network/cronos';
import { DYMENSION as ETHEREUM_NETWORK__DYMENSION } from './ethereum/network/dymension';
import { ETHEREUM as ETHEREUM_NETWORK__ETHEREUM } from './ethereum/network/ethereum';
import { EVMOS as ETHEREUM_NETWORK__EVMOS } from './ethereum/network/evmos';
import { FANTOM as ETHEREUM_NETWORK__FANTOM } from './ethereum/network/fantom';
import { HARMONY as ETHEREUM_NETWORK__HARMONY } from './ethereum/network/harmony';
import { KAVA as ETHEREUM_NETWORK__KAVA } from './ethereum/network/kava';
import { OKT as ETHEREUM_NETWORK__OKT } from './ethereum/network/okt';
import { OPTIMISM as ETHEREUM_NETWORK__OPTIMISM } from './ethereum/network/optimism';
import { POLYGON as ETHEREUM_NETWORK__POLYGON } from './ethereum/network/polygon';
import { SCROLL_SEPOLIA_TESTNET as ETHEREUM_NETWORK__SCROLL_SEPOLIA_TESTNET } from './ethereum/network/scrollSepoliaTestnet';
import { SMART_CHAIN as ETHEREUM_NETWORK__SMART_CHAIN } from './ethereum/network/smartChain';
import { ZETA as ETHEREUM_NETWORK__ZETA } from './ethereum/network/zeta';
import { DEVNET as SUI_NETWORK__DEVNET } from './sui/network/devnet';
import { MAINNET as SUI_NETWORK__MAINNET } from './sui/network/mainnet';
import { TESTNET as SUI_NETWORK__TESTNET } from './sui/network/testnet';
import { SUI } from './sui/sui';

export const LINE_TYPE = {
  BITCOIN: 'BITCOIN',
  COSMOS: 'COSMOS',
  ETHEREUM: 'ETHEREUM',
  APTOS: 'APTOS',
  SUI: 'SUI',
  COMMON: 'COMMON',
} as const;

export const COSMOS_DEFAULT_GAS = '100000';
export const COSMOS_DEFAULT_SEND_GAS = '100000';
export const COSMOS_DEFAULT_SWAP_GAS = '250000';
export const COSMOS_DEFAULT_IBC_SEND_GAS = '150000';
export const COSMOS_DEFAULT_TRANSFER_GAS = '200000';
export const COSMOS_DEFAULT_IBC_TRANSFER_GAS = '250000';
export const COSMOS_DEFAULT_REWARD_GAS = '300000';
export const COSMOS_DEFAULT_COMMISSION_GAS = '300000';
export const COSMOS_DEFAULT_SQUID_CONTRACT_SWAP_GAS = '350000';

export const COSMOS_DEFAULT_ESTIMATE_AV = '1.2';
export const COSMOS_DEFAULT_ESTIMATE_EXCEPTED_AV = '1.4';

export const COSMOS_CHAINS: CosmosChain[] = [
  COSMOS,
  AGORIC,
  AKASH,
  ALTHEA,
  ARCHWAY,
  ARTELA_TESTNET,
  ASI_ALLIANCE,
  ASSET_MANTLE,
  ATOM_ONE,
  AXELAR,
  BAND,
  BITCANNA,
  BITSONG,
  CANTO,
  CELESTIA,
  CHIHUAHUA,
  COMDEX,
  COREUM,
  CRONOS_POS,
  CUDOS,
  DESMOS,
  DYDX,
  DYMENSION,
  EVMOS,
  FINSCHIA,
  GOVGEN,
  GRAVITY_BRIDGE,
  HUMANS_AI,
  INJECTIVE,
  IRIS,
  IXO,
  JUNO,
  KAVA,
  KI,
  KYVE,
  LAVA,
  LIKE_COIN,
  LUM,
  MANTRA,
  MARS,
  MEDIBLOC,
  NEUTRON,
  NIBIRU,
  NOBLE,
  NYX,
  OMNIFLIX,
  ONOMY,
  OSMOSIS,
  PASSAGE,
  PERSISTENCE,
  PROVENANCE,
  PRYZM,
  QUASAR,
  QUICK_SILVER,
  REGEN,
  RIZON,
  SAGA,
  SECRET,
  SEI,
  SENTINEL,
  SHENTU,
  SOMMELIER,
  STAFIHUB,
  STARGAZE,
  STRIDE,
  TERITORI,
  TERRA,
  UX,
  XPLA,
  ZETA,
];

export const COSMOS_NON_NATIVE_GAS_RATES: CosmosGasRate[] = [...NYX_GAS_RATES, ...NOBLE_GAS_RATES, ...PRYZM_GAS_RATES];

export const ETHEREUM_CHAINS: EthereumChain[] = [ETHEREUM];

export const ETHEREUM_NETWORKS: EthereumNetwork[] = [
  ETHEREUM_NETWORK__ETHEREUM,
  ETHEREUM_NETWORK__ALTHEA,
  ETHEREUM_NETWORK__ARBITRUM,
  ETHEREUM_NETWORK__ARTELA_TESTNET,
  ETHEREUM_NETWORK__AVALANCHE,
  ETHEREUM_NETWORK__BASE,
  ETHEREUM_NETWORK__CANTO,
  ETHEREUM_NETWORK__CRONOS,
  ETHEREUM_NETWORK__DYMENSION,
  ETHEREUM_NETWORK__EVMOS,
  ETHEREUM_NETWORK__FANTOM,
  ETHEREUM_NETWORK__HARMONY,
  ETHEREUM_NETWORK__KAVA,
  ETHEREUM_NETWORK__OKT,
  ETHEREUM_NETWORK__OPTIMISM,
  ETHEREUM_NETWORK__POLYGON,
  ETHEREUM_NETWORK__SMART_CHAIN,
  ETHEREUM_NETWORK__SCROLL_SEPOLIA_TESTNET,
  ETHEREUM_NETWORK__ZETA,
];

export const APTOS_CHAINS: AptosChain[] = [APTOS];

export const APTOS_NETWORKS: AptosNetwork[] = [APTOS_NETWORK__MAINNET, APTOS_NETWORK__TESTNET, APTOS_NETWORK__DEVNET];

export const SUI_CHAINS: SuiChain[] = [SUI];

export const SUI_NETWORKS: SuiNetwork[] = [SUI_NETWORK__MAINNET, SUI_NETWORK__TESTNET, SUI_NETWORK__DEVNET];

export const BITCOIN_CHAINS: BitcoinChain[] = [BITCOIN__BITCOIN, BITCOIN__TESTNET4];

export const CHAINS = [...ETHEREUM_CHAINS, ...COSMOS_CHAINS, ...APTOS_CHAINS, ...SUI_CHAINS, ...BITCOIN_CHAINS];
