import { CHAIN_TYPES_KEYS } from '@/constants/chain';
import { getAllChains } from '@/libs/chain';
import type {
  AptosChain,
  BitcoinChain,
  Chain,
  ChainType,
  ChainTypeMap,
  CosmosChain,
  EvmChain,
  GnoChain,
  IotaChain,
  SolanaChain,
  SuiChain,
  UniqueChainId,
} from '@/types/chain';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';

const CACHE_TTL = 5 * 60 * 1000;

function isCacheValid(timestamp: number, cachedDataLength: number, newDataLength: number): boolean {
  return timestamp > 0 && Date.now() - timestamp < CACHE_TTL && cachedDataLength === newDataLength;
}

export type ChainMapByType = {
  [K in keyof ChainTypeMap]: Map<UniqueChainId, ChainTypeMap[K]>;
};

type StoreKey = keyof ChainTypeMap | 'cosmwasm' | 'stakingSupport';

type ChainMapsStore = Record<StoreKey, { data: Map<UniqueChainId, Chain>; timestamp: number }>;

const stores: ChainMapsStore = {
  ...CHAIN_TYPES_KEYS.reduce((acc, chainType) => {
    acc[chainType] = { data: new Map(), timestamp: 0 } as ChainMapsStore[typeof chainType];
    return acc;
  }, {} as ChainMapsStore),
  cosmwasm: { data: new Map<UniqueChainId, CosmosChain>(), timestamp: 0 },
  stakingSupport: { data: new Map<UniqueChainId, CosmosChain>(), timestamp: 0 },
};

function updateChainMap(chainType: ChainType, chains: Chain[]) {
  const filteredChains = chains.filter((chain) => chain.chainType === chainType);
  const store = stores[chainType];

  if (isCacheValid(store.timestamp, store.data.size, filteredChains.length)) {
    return store.data;
  }

  store.data.clear();
  filteredChains.forEach((chain) => {
    store.data.set(getUniqueChainIdWithManual(chain.id, chain.chainType), chain);
  });
  store.timestamp = Date.now();

  return store.data;
}

export async function createChainMap(): Promise<ChainMapByType>;
export async function createChainMap<T extends ChainType>(chainType: T): Promise<ChainMapByType[T]>;
export async function createChainMap<T extends ChainType>(chainType?: T): Promise<ChainMapByType | ChainMapByType[T]> {
  const allChains = await getAllChains();

  if (chainType) {
    return updateChainMap(chainType, allChains) as ChainMapByType[T];
  }

  CHAIN_TYPES_KEYS.forEach((type) => {
    updateChainMap(type, allChains);
  });

  return {
    cosmos: stores.cosmos.data as Map<UniqueChainId, CosmosChain>,
    evm: stores.evm.data as Map<UniqueChainId, EvmChain>,
    bitcoin: stores.bitcoin.data as Map<UniqueChainId, BitcoinChain>,
    aptos: stores.aptos.data as Map<UniqueChainId, AptosChain>,
    sui: stores.sui.data as Map<UniqueChainId, SuiChain>,
    iota: stores.iota.data as Map<UniqueChainId, IotaChain>,
    gno: stores.gno.data as Map<UniqueChainId, GnoChain>,
    solana: stores.solana.data as Map<UniqueChainId, SolanaChain>,
  };
}

export async function createAllChainMap(): Promise<ChainMapByType | undefined> {
  return createChainMap();
}

export async function createCosmwasmChainMap() {
  const allChains = await getAllChains();
  const allCosmwasmChains = allChains.filter((chain) => chain.chainType === 'cosmos' && chain.isCosmwasm);
  const store = stores.cosmwasm;

  if (isCacheValid(store.timestamp, store.data.size, allCosmwasmChains.length)) {
    return store.data as Map<UniqueChainId, CosmosChain>;
  }

  const cosmosMap = updateChainMap('cosmos', allChains) as Map<UniqueChainId, CosmosChain>;

  store.data.clear();
  Array.from(cosmosMap)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, chain]) => chain.chainType === 'cosmos' && chain.isCosmwasm)
    .forEach(([key, chain]) => {
      store.data.set(key, chain);
    });
  store.timestamp = Date.now();

  return store.data as Map<string, CosmosChain>;
}

export async function createStakingSupportCosmosChainMap(): Promise<Map<UniqueChainId, CosmosChain>> {
  const allChains = await getAllChains();
  const allStakingSupportChains = allChains.filter((chain) => chain.chainType === 'cosmos' && chain.isSupportStaking);
  const store = stores.stakingSupport;

  if (isCacheValid(store.timestamp, store.data.size, allStakingSupportChains.length)) {
    return store.data as Map<UniqueChainId, CosmosChain>;
  }

  const cosmosMap = updateChainMap('cosmos', allChains) as Map<UniqueChainId, CosmosChain>;

  store.data.clear();
  Array.from(cosmosMap)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, chain]) => chain.chainType === 'cosmos' && chain.isSupportStaking)
    .forEach(([key, chain]) => {
      store.data.set(key, chain);
    });
  store.timestamp = Date.now();

  return store.data as Map<UniqueChainId, CosmosChain>;
}
