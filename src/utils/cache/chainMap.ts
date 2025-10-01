import { getAllChains } from '@/libs/chain';
import type { AptosChain, BitcoinChain, Chain, ChainType, CosmosChain, EvmChain, IotaChain, SuiChain } from '@/types/chain';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';

type CacheItem = {
  data: Chain[];
  timestamp: number;
};

let cachedAllChains: CacheItem | null = null;
const CACHE_TTL = 5 * 60 * 1000;

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

async function getChainsWithTtl(): Promise<Chain[]> {
  if (cachedAllChains && isCacheValid(cachedAllChains.timestamp)) {
    return cachedAllChains.data;
  }

  const newChains = await getAllChains();

  cachedAllChains = {
    data: newChains,
    timestamp: Date.now(),
  };

  return newChains;
}

const cosmosChainMap = new Map<string, CosmosChain>();
const evmChainMap = new Map<string, EvmChain>();
const bitcoinChainMap = new Map<string, BitcoinChain>();
const aptosChainMap = new Map<string, AptosChain>();
const suiChainMap = new Map<string, SuiChain>();
const iotaChainMap = new Map<string, IotaChain>();
const cosmwasmChainMap = new Map<string, CosmosChain>();
const stakingSupportCosmosChainMap = new Map<string, CosmosChain>();

export type ChainMapByType = {
  cosmos: Map<string, CosmosChain>;
  evm: Map<string, EvmChain>;
  bitcoin: Map<string, BitcoinChain>;
  aptos: Map<string, AptosChain>;
  sui: Map<string, SuiChain>;
  iota: Map<string, IotaChain>;
};

const chainMapStore = {
  cosmos: cosmosChainMap,
  evm: evmChainMap,
  bitcoin: bitcoinChainMap,
  aptos: aptosChainMap,
  sui: suiChainMap,
  iota: iotaChainMap,
} as const;

function updateChainMap(chainType: ChainType, chains: Chain[]) {
  const filteredChains = chains.filter((chain) => chain.chainType === chainType);

  if (chainType === 'cosmos') {
    if (cosmosChainMap.size !== filteredChains.length) {
      cosmosChainMap.clear();
      filteredChains.forEach((chain) => {
        cosmosChainMap.set(getUniqueChainIdWithManual(chain.id, chain.chainType), chain as CosmosChain);
      });
    }
  }
  if (chainType === 'evm') {
    if (evmChainMap.size !== filteredChains.length) {
      evmChainMap.clear();
      filteredChains.forEach((chain) => {
        evmChainMap.set(getUniqueChainIdWithManual(chain.id, chain.chainType), chain as EvmChain);
      });
    }
  }
  if (chainType === 'bitcoin') {
    if (bitcoinChainMap.size !== filteredChains.length) {
      bitcoinChainMap.clear();
      filteredChains.forEach((chain) => {
        bitcoinChainMap.set(getUniqueChainIdWithManual(chain.id, chain.chainType), chain as BitcoinChain);
      });
    }
  }
  if (chainType === 'aptos') {
    if (aptosChainMap.size !== filteredChains.length) {
      aptosChainMap.clear();
      filteredChains.forEach((chain) => {
        aptosChainMap.set(getUniqueChainIdWithManual(chain.id, chain.chainType), chain as AptosChain);
      });
    }
  }
  if (chainType === 'sui') {
    if (suiChainMap.size !== filteredChains.length) {
      suiChainMap.clear();
      filteredChains.forEach((chain) => {
        suiChainMap.set(getUniqueChainIdWithManual(chain.id, chain.chainType), chain as SuiChain);
      });
    }
  }
  if (chainType === 'iota') {
    if (iotaChainMap.size !== filteredChains.length) {
      iotaChainMap.clear();
      filteredChains.forEach((chain) => {
        iotaChainMap.set(getUniqueChainIdWithManual(chain.id, chain.chainType), chain as IotaChain);
      });
    }
  }
}

export async function createChainMap(): Promise<ChainMapByType>;
export async function createChainMap<T extends ChainType>(chainType: T): Promise<ChainMapByType[T]>;
export async function createChainMap<T extends ChainType>(chainType?: T): Promise<ChainMapByType | ChainMapByType[T]> {
  const allChains = await getChainsWithTtl();

  if (chainType) {
    updateChainMap(chainType, allChains);
    return chainMapStore[chainType];
  }

  const chainTypes: ChainType[] = ['cosmos', 'evm', 'bitcoin', 'aptos', 'sui', 'iota'];

  chainTypes.forEach((type) => {
    updateChainMap(type, allChains);
  });

  return chainMapStore;
}

export async function createAllChainMap(): Promise<ChainMapByType | undefined> {
  return createChainMap();
}

export async function createCosmwasmChainMap() {
  const allChains = await getChainsWithTtl();
  const allCosmwasmChains = allChains.filter((chain) => chain.chainType === 'cosmos' && chain.isCosmwasm) as CosmosChain[];

  if (cosmwasmChainMap.size !== allCosmwasmChains.length) {
    cosmwasmChainMap.clear();
    allCosmwasmChains.forEach((chain) => {
      cosmwasmChainMap.set(getUniqueChainIdWithManual(chain.id, chain.chainType), chain);
    });
  }

  return cosmwasmChainMap;
}

export async function createStakingSupportCosmosChainMap() {
  const allChains = await getChainsWithTtl();
  const allStakingSupportChains = allChains.filter((chain) => chain.chainType === 'cosmos' && chain.isSupportStaking) as CosmosChain[];

  if (stakingSupportCosmosChainMap.size !== allStakingSupportChains.length) {
    stakingSupportCosmosChainMap.clear();
    allStakingSupportChains.forEach((chain) => {
      stakingSupportCosmosChainMap.set(getUniqueChainIdWithManual(chain.id, chain.chainType), chain);
    });
  }

  return stakingSupportCosmosChainMap;
}
