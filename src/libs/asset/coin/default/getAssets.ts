import { isEqual } from 'es-toolkit';

import { getChains } from '@/libs/chain';
import type { AccountAddress } from '@/types/account';
import type { AptosAsset, BitcoinAsset, CosmosAsset, CosmosCw20Asset, EvmAsset, EvmErc20Asset, IotaAsset, SuiAsset } from '@/types/asset';
import type { AptosChain, BitcoinChain, CosmosChain, EvmChain, IotaChain, SuiChain } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import { createAllChainMap, createChainMap } from '@/utils/cache/chainMap';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';

import { getAllAccountAddress } from '../../../account';

type AssetsStore = {
  cosmosAssets: { asset: CosmosAsset; chain: CosmosChain; addresses: AccountAddress[] }[];
  evmAssets: { asset: EvmAsset; chain: EvmChain; addresses: AccountAddress[] }[];
  suiAssets: { asset: SuiAsset; chain: SuiChain; addresses: AccountAddress[] }[];
  aptosAssets: { asset: AptosAsset; chain: AptosChain; addresses: AccountAddress[] }[];
  bitcoinAssets: { asset: BitcoinAsset; chain: BitcoinChain; addresses: AccountAddress[] }[];
  iotaAssets: { asset: IotaAsset; chain: IotaChain; addresses: AccountAddress[] }[];
  erc20Assets: { asset: EvmErc20Asset; chain: EvmChain; addresses: AccountAddress[] }[];
  customErc20Assets: { asset: EvmErc20Asset; chain: EvmChain; addresses: AccountAddress[] }[];
  cw20Assets: { asset: CosmosCw20Asset; chain: CosmosChain; addresses: AccountAddress[] }[];
  customCw20Assets: { asset: CosmosCw20Asset; chain: CosmosChain; addresses: AccountAddress[] }[];
};

type CacheItem = {
  assets: AssetsStore;
  addressLength: number;
  timestamp: number;
};

const store = new Map<string, CacheItem>();

const CACHE_TTL = 5 * 60 * 1000;

async function getErc20Assets(assets: EvmErc20Asset[], addressMap: Map<string, AccountAddress[]>, evmChainsMap?: Map<string, EvmChain>) {
  const resolvedChainMaps = evmChainsMap || (await createChainMap('evm'));

  const erc20Assets = assets.reduce((acc: { asset: EvmErc20Asset; chain: EvmChain; addresses: AccountAddress[] }[], cur) => {
    const uniqueChainId = getUniqueChainIdWithManual(cur.chainId, cur.chainType);
    const evmChain = resolvedChainMaps?.get(uniqueChainId);

    if (evmChain) {
      const addressList = addressMap.get(uniqueChainId);

      if (addressList && addressList.length > 0) {
        acc.push({
          asset: cur,
          chain: evmChain,
          addresses: addressList,
        });
      }
    }
    return acc;
  }, []);

  return erc20Assets;
}

async function getCw20Assets(assets: CosmosCw20Asset[], addressMap: Map<string, AccountAddress[]>, cosmosChainsMap?: Map<string, CosmosChain>) {
  const resolvedChainMaps = cosmosChainsMap || (await createChainMap('cosmos'));

  const cw20Assets = assets.reduce((acc: { asset: CosmosCw20Asset; chain: CosmosChain; addresses: AccountAddress[] }[], cur) => {
    const uniqueChainId = getUniqueChainIdWithManual(cur.chainId, cur.chainType);

    const cosmosChain = resolvedChainMaps?.get(uniqueChainId);

    if (cosmosChain) {
      const addressList = addressMap.get(uniqueChainId);

      if (addressList && addressList.length > 0) {
        acc.push({
          asset: cur,
          chain: cosmosChain,
          addresses: addressList,
        });
      }
    }
    return acc;
  }, []);

  return cw20Assets;
}

function createAddressesMap(allAccountAddress: AccountAddress[]): Map<string, AccountAddress[]> {
  const addressesMap = new Map<string, AccountAddress[]>();

  const grouped = allAccountAddress.reduce(
    (acc, address) => {
      const key = getUniqueChainIdWithManual(address.chainId, address.chainType);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(address);
      return acc;
    },
    {} as Record<string, AccountAddress[]>,
  );

  Object.entries(grouped).forEach(([key, addresses]) => {
    addressesMap.set(key, addresses);
  });

  return addressesMap;
}

export async function getAssets() {
  const {
    assetsV11: assets,
    paramsV11: chains,
    erc20Assets,
    cw20Assets,
    customErc20Assets,
    customCw20Assets,
  } = await chrome.storage.local.get<ExtensionStorage>(['assetsV11', 'paramsV11', 'cw20Assets', 'erc20Assets', 'customErc20Assets', 'customCw20Assets']);
  if (!assets) {
    throw new Error('No assets found');
  }

  const { evmChains, suiChains, aptosChains, cosmosChains, bitcoinChains, iotaChains } = await getChains();

  const evmChainIds = new Set(evmChains.map((chain) => chain.id));
  const cosmosChainIds = new Set(cosmosChains.map((chain) => chain.id));
  const suiChainIds = new Set(suiChains.map((chain) => chain.id));
  const aptosChainIds = new Set(aptosChains.map((chain) => chain.id));
  const bitcoinChainIds = new Set(bitcoinChains.map((chain) => chain.id));
  const iotaChainIds = new Set(iotaChains.map((chain) => chain.id));

  const {
    evm: evmAssets,
    cosmos: cosmosAssets,
    sui: suiAssets,
    aptos: aptosAssets,
    bitcoin: bitcoinAssets,
    iota: iotaAssets,
  } = assets.reduce(
    (acc, asset) => {
      if (evmChainIds.has(asset.chain)) {
        const chainParam = chains?.[asset.chain]?.params?.chainlist_params;

        if (!chainParam) {
          return acc;
        }

        const isOnlyEVM = !chainParam.chain_type.includes('cosmos') && chainParam.chain_type.includes('evm');

        const gasCoinDenom = isOnlyEVM
          ? chainParam?.gas_asset_denom || chainParam?.main_asset_denom
          : chainParam?.gas_asset_denom || chainParam?.staking_asset_denom || chainParam?.main_asset_denom;

        if (asset.type === 'native' && gasCoinDenom === asset.denom) {
          acc.evm.push({
            ...asset,
            type: 'native',
            id: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            chainId: asset.chain,
            chainType: 'evm',
            decimals: 18,
          });
        }
      }
      if (cosmosChainIds.has(asset.chain)) {
        acc.cosmos.push({
          ...asset,
          chainId: asset.chain,
          id: asset.denom,
          chainType: 'cosmos',
        });
      }
      if (suiChainIds.has(asset.chain)) {
        acc.sui.push({
          ...asset,
          id: asset.denom,
          chainId: asset.chain,
          chainType: 'sui',
        });
      }
      if (aptosChainIds.has(asset.chain)) {
        acc.aptos.push({
          ...asset,
          id: asset.denom,
          chainId: asset.chain,
          chainType: 'aptos',
        });
      }
      if (bitcoinChainIds.has(asset.chain)) {
        acc.bitcoin.push({
          ...asset,
          id: asset.denom,
          chainId: asset.chain,
          chainType: 'bitcoin',
        });
      }
      if (iotaChainIds.has(asset.chain)) {
        acc.iota.push({
          ...asset,
          id: asset.denom,
          chainId: asset.chain,
          chainType: 'iota',
        });
      }
      return acc;
    },
    {
      evm: [] as EvmAsset[],
      cosmos: [] as CosmosAsset[],
      sui: [] as SuiAsset[],
      aptos: [] as AptosAsset[],
      bitcoin: [] as BitcoinAsset[],
      iota: [] as IotaAsset[],
    },
  );

  return {
    cosmosAssets,
    evmAssets,
    suiAssets,
    aptosAssets,
    bitcoinAssets,
    iotaAssets,
    erc20Assets,
    customErc20Assets,
    cw20Assets,
    customCw20Assets,
  };
}

export async function getAssetsDetailed(id: string): Promise<AssetsStore> {
  const { customErc20Assets: customErc20AssetsData, customCw20Assets: customCw20AssetsData } = await chrome.storage.local.get<ExtensionStorage>([
    'customErc20Assets',
    'customCw20Assets',
  ]);

  const allAccountAddress = await getAllAccountAddress(id);

  const currentAccountStore = store.get(id);

  let addressesMap: Map<string, AccountAddress[]> | undefined;

  if (currentAccountStore) {
    const isCacheStillValid = isCacheValid(currentAccountStore.timestamp, currentAccountStore.addressLength, allAccountAddress.length);

    const hasCustomErc20Changed = !isEqual(
      currentAccountStore.assets.customErc20Assets.map((a) => a.asset.id),
      customErc20AssetsData.map((a) => a.id),
    );

    if (hasCustomErc20Changed || !isCacheStillValid) {
      if (!addressesMap) {
        addressesMap = createAddressesMap(allAccountAddress);
      }

      const newCustomErc20Assets = await getErc20Assets(customErc20AssetsData, addressesMap);
      currentAccountStore.assets.customErc20Assets = newCustomErc20Assets;
    }

    const hasCustomCW20Changed = !isEqual(
      currentAccountStore.assets.customCw20Assets.map((a) => a.asset.id),
      customCw20AssetsData.map((a) => a.id),
    );

    if (hasCustomCW20Changed || !isCacheStillValid) {
      if (!addressesMap) {
        addressesMap = createAddressesMap(allAccountAddress);
      }

      const newCustomCw20Assets = await getCw20Assets(customCw20AssetsData, addressesMap);
      currentAccountStore.assets.customCw20Assets = newCustomCw20Assets;
    }

    if (isCacheStillValid) {
      return currentAccountStore.assets;
    }
  }

  const [assetStorage, chainMaps] = await Promise.all([
    chrome.storage.local.get<ExtensionStorage>(['assetsV11', 'paramsV11', 'cw20Assets', 'erc20Assets']),
    createAllChainMap(),
  ]);

  const { assetsV11: assets, paramsV11: chains, cw20Assets: cw20AssetsData, erc20Assets: erc20AssetsData } = assetStorage;

  if (!assets) {
    throw new Error('No assets found');
  }

  const {
    cosmos: cosmosChainsMap,
    evm: evmChainsMap,
    bitcoin: bitcoinChainsMap,
    aptos: aptosChainsMap,
    sui: suiChainsMap,
    iota: iotaChainsMap,
  } = chainMaps || {};

  if (!addressesMap) {
    addressesMap = createAddressesMap(allAccountAddress);
  }

  const {
    evm: evmAssets,
    cosmos: cosmosAssets,
    sui: suiAssets,
    aptos: aptosAssets,
    bitcoin: bitcoinAssets,
    iota: iotaAssets,
  } = assets.reduce(
    (acc, asset) => {
      const evmChainKey = getUniqueChainIdWithManual(asset.chain, 'evm');
      const evmChain = evmChainsMap?.get(evmChainKey);
      if (evmChain) {
        const chainParam = chains?.[asset.chain]?.params?.chainlist_params;
        const addressList = addressesMap.get(evmChainKey);

        if (chainParam && addressList && addressList.length > 0) {
          const isOnlyEVM = !chainParam.chain_type.includes('cosmos') && chainParam.chain_type.includes('evm');

          const gasCoinDenom = isOnlyEVM
            ? chainParam?.gas_asset_denom || chainParam?.main_asset_denom
            : chainParam?.gas_asset_denom || chainParam?.staking_asset_denom || chainParam?.main_asset_denom;

          if (asset.type === 'native' && gasCoinDenom === asset.denom) {
            acc.evm.push({
              asset: {
                ...asset,
                type: 'native',
                id: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                chainId: asset.chain,
                chainType: 'evm',
                decimals: 18,
              },
              chain: evmChain,
              addresses: addressList,
            });
          }
        }
      }

      const cosmosChainKey = getUniqueChainIdWithManual(asset.chain, 'cosmos');
      const cosmosChain = cosmosChainsMap?.get(cosmosChainKey);
      if (cosmosChain) {
        const addressList = addressesMap.get(cosmosChainKey);

        if (addressList && addressList.length > 0) {
          acc.cosmos.push({
            asset: {
              ...asset,
              chainId: asset.chain,
              id: asset.denom,
              chainType: 'cosmos',
            },
            chain: cosmosChain,
            addresses: addressList,
          });
        }
      }

      const suiChainKey = getUniqueChainIdWithManual(asset.chain, 'sui');
      const suiChain = suiChainsMap?.get(suiChainKey);
      if (suiChain) {
        const addressList = addressesMap.get(suiChainKey);

        if (addressList && addressList.length > 0) {
          acc.sui.push({
            asset: {
              ...asset,
              id: asset.denom,
              chainId: asset.chain,
              chainType: 'sui',
            },
            chain: suiChain,
            addresses: addressList,
          });
        }
      }

      const aptosChainKey = getUniqueChainIdWithManual(asset.chain, 'aptos');
      const aptosChain = aptosChainsMap?.get(aptosChainKey);
      if (aptosChain) {
        const addressList = addressesMap.get(aptosChainKey);

        if (addressList && addressList.length > 0) {
          acc.aptos.push({
            asset: {
              ...asset,
              id: asset.denom,
              chainId: asset.chain,
              chainType: 'aptos',
            },
            chain: aptosChain,
            addresses: addressList,
          });
        }
      }

      const bitcoinChainKey = getUniqueChainIdWithManual(asset.chain, 'bitcoin');
      const bitcoinChain = bitcoinChainsMap?.get(bitcoinChainKey);
      if (bitcoinChain) {
        const addressList = addressesMap.get(bitcoinChainKey);

        if (addressList && addressList.length > 0) {
          acc.bitcoin.push({
            asset: {
              ...asset,
              id: asset.denom,
              chainId: asset.chain,
              chainType: 'bitcoin',
            },
            chain: bitcoinChain,
            addresses: addressList,
          });
        }
      }

      const iotaChainKey = getUniqueChainIdWithManual(asset.chain, 'iota');
      const iotaChain = iotaChainsMap?.get(iotaChainKey);
      if (iotaChain) {
        const addressList = addressesMap.get(iotaChainKey);

        if (addressList && addressList.length > 0) {
          acc.iota.push({
            asset: {
              ...asset,
              id: asset.denom,
              chainId: asset.chain,
              chainType: 'iota',
            },
            chain: iotaChain,
            addresses: addressList,
          });
        }
      }
      return acc;
    },
    {
      evm: [],
      cosmos: [],
      sui: [],
      aptos: [],
      bitcoin: [],
      iota: [],
    } as {
      evm: { asset: EvmAsset; chain: EvmChain; addresses: AccountAddress[] }[];
      cosmos: { asset: CosmosAsset; chain: CosmosChain; addresses: AccountAddress[] }[];
      sui: { asset: SuiAsset; chain: SuiChain; addresses: AccountAddress[] }[];
      aptos: { asset: AptosAsset; chain: AptosChain; addresses: AccountAddress[] }[];
      bitcoin: { asset: BitcoinAsset; chain: BitcoinChain; addresses: AccountAddress[] }[];
      iota: { asset: IotaAsset; chain: IotaChain; addresses: AccountAddress[] }[];
    },
  );

  const [erc20Assets, cw20Assets] = await Promise.all([
    getErc20Assets(erc20AssetsData, addressesMap, evmChainsMap),
    getCw20Assets(cw20AssetsData, addressesMap, cosmosChainsMap),
  ]);

  const customErc20Assets = currentAccountStore?.assets.customErc20Assets || (await getErc20Assets(customErc20AssetsData, addressesMap, evmChainsMap));
  const customCw20Assets = currentAccountStore?.assets.customCw20Assets || (await getCw20Assets(customCw20AssetsData, addressesMap, cosmosChainsMap));

  const result: AssetsStore = {
    cosmosAssets,
    evmAssets,
    suiAssets,
    aptosAssets,
    bitcoinAssets,
    iotaAssets,
    erc20Assets,
    customErc20Assets,
    cw20Assets,
    customCw20Assets,
  };

  setCachedResult(id, result, allAccountAddress.length);

  return result;
}

function isCacheValid(cachedTimestamp: number, length: number, expectedSize: number) {
  if (Date.now() - cachedTimestamp > CACHE_TTL || length !== expectedSize) {
    return false;
  }

  return true;
}

function setCachedResult(accountId: string, assets: AssetsStore, length: number) {
  store.set(accountId, {
    assets,
    addressLength: length,
    timestamp: Date.now(),
  });
}
