import { getAllChains } from '@/libs/chain';
import type { AptosChain, BitcoinChain, Chain, ChainType, CosmosChain, EvmChain, IotaChain, SuiChain } from '@/types/chain';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';

const CACHE_TTL = 5 * 60 * 1000;

function isCacheValid(timestamp: number, cachedDataLength: number, newDataLength: number): boolean {
  return timestamp > 0 && Date.now() - timestamp < CACHE_TTL && cachedDataLength === newDataLength;
}

export type ChainMapByType = {
  cosmos: Map<string, CosmosChain>;
  evm: Map<string, EvmChain>;
  bitcoin: Map<string, BitcoinChain>;
  aptos: Map<string, AptosChain>;
  sui: Map<string, SuiChain>;
  iota: Map<string, IotaChain>;
};

type ChainMapsStore = {
  cosmos: { data: Map<string, Chain>; timestamp: number };
  evm: { data: Map<string, Chain>; timestamp: number };
  bitcoin: { data: Map<string, Chain>; timestamp: number };
  aptos: { data: Map<string, Chain>; timestamp: number };
  sui: { data: Map<string, Chain>; timestamp: number };
  iota: { data: Map<string, Chain>; timestamp: number };
  cosmwasm: { data: Map<string, Chain>; timestamp: number };
  stakingSupport: { data: Map<string, Chain>; timestamp: number };
};

const stores: ChainMapsStore = {
  cosmos: { data: new Map<string, CosmosChain>(), timestamp: 0 },
  evm: { data: new Map<string, EvmChain>(), timestamp: 0 },
  bitcoin: { data: new Map<string, BitcoinChain>(), timestamp: 0 },
  aptos: { data: new Map<string, AptosChain>(), timestamp: 0 },
  sui: { data: new Map<string, SuiChain>(), timestamp: 0 },
  iota: { data: new Map<string, IotaChain>(), timestamp: 0 },
  cosmwasm: { data: new Map<string, CosmosChain>(), timestamp: 0 },
  stakingSupport: { data: new Map<string, CosmosChain>(), timestamp: 0 },
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

  const chainTypes: ChainType[] = ['cosmos', 'evm', 'bitcoin', 'aptos', 'sui', 'iota'];

  chainTypes.forEach((type) => {
    updateChainMap(type, allChains);
  });

  return {
    cosmos: stores.cosmos.data as Map<string, CosmosChain>,
    evm: stores.evm.data as Map<string, EvmChain>,
    bitcoin: stores.bitcoin.data as Map<string, BitcoinChain>,
    aptos: stores.aptos.data as Map<string, AptosChain>,
    sui: stores.sui.data as Map<string, SuiChain>,
    iota: stores.iota.data as Map<string, IotaChain>,
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
    return store.data as Map<string, CosmosChain>;
  }

  const cosmosMap = updateChainMap('cosmos', allChains) as Map<string, CosmosChain>;

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

export async function createStakingSupportCosmosChainMap(): Promise<Map<string, CosmosChain>> {
  const allChains = await getAllChains();
  const allStakingSupportChains = allChains.filter((chain) => chain.chainType === 'cosmos' && chain.isSupportStaking);
  const store = stores.stakingSupport;

  if (isCacheValid(store.timestamp, store.data.size, allStakingSupportChains.length)) {
    return store.data as Map<string, CosmosChain>;
  }

  const cosmosMap = updateChainMap('cosmos', allChains) as Map<string, CosmosChain>;

  store.data.clear();
  Array.from(cosmosMap)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, chain]) => chain.chainType === 'cosmos' && chain.isSupportStaking)
    .forEach(([key, chain]) => {
      store.data.set(key, chain);
    });
  store.timestamp = Date.now();

  return store.data as Map<string, CosmosChain>;
}
