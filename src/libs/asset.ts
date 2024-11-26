import PromisePool from '@supercharge/promise-pool';

import type { AccountAptosAsset, AccountCosmosAsset, AccountCw20Asset, AccountErc20Asset, AccountEvmAsset, AccountSuiAsset } from '@/types/account';
import type { AptosAsset, AssetSingleGroup, BitcoinAsset, CosmosAsset, EvmAsset, SuiAsset } from '@/types/asset';
import type { ExtensionStorage } from '@/types/extension';

import { getChains } from './chain';

export async function getHiddenAssets(id: string) {
  const storage = await chrome.storage.local.get<ExtensionStorage>(`${id}-hidden-assetIds`);

  const hiddenAssetIds = storage[`${id}-hidden-assetIds`];

  return hiddenAssetIds ?? [];
}

export async function getAssets() {
  const {
    assetsV11: assets,
    paramsV11: chains,
    erc20Assets,
    cw20Assets,
  } = await chrome.storage.local.get<ExtensionStorage>(['assetsV11', 'paramsV11', 'cw20Assets', 'erc20Assets']);
  if (!assets) {
    throw new Error('No assets found');
  }

  const { evmChains, suiChains, aptosChains, cosmosChains, bitcoinChains } = await getChains();

  const evmChainIds = evmChains.map((chain) => chain.id);
  const cosmosChainIds = cosmosChains.map((chain) => chain.id);
  const suiChainIds = suiChains.map((chain) => chain.id);
  const aptosChainIds = aptosChains.map((chain) => chain.id);
  const bitcoinChainIds = bitcoinChains.map((chain) => chain.id);

  const filteredEvmAssets = assets.filter(
    (asset) =>
      evmChainIds.includes(asset.chain) && asset.type === 'native' && chains?.[asset.chain]?.params?.chainlist_params?.main_asset_denom === asset.denom,
  );

  const evmAssets: EvmAsset[] = filteredEvmAssets.map((asset) => {
    return {
      ...asset,
      type: 'native',
      id: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      chainId: asset.chain,
      chainType: 'evm',
    };
  });

  const filteredCosmosAssets = assets.filter((asset) => cosmosChainIds.includes(asset.chain));

  const cosmosAssets: CosmosAsset[] = filteredCosmosAssets.map((asset) => {
    return {
      ...asset,
      chainId: asset.chain,
      id: asset.denom,
      chainType: 'cosmos',
    };
  });

  const filteredSuiAssets = assets.filter((asset) => suiChainIds.includes(asset.chain));

  const suiAssets: SuiAsset[] = filteredSuiAssets.map((asset) => {
    return {
      ...asset,
      id: asset.denom,
      chainId: asset.chain,
      chainType: 'sui',
    };
  });

  const filteredAptosAssets = assets.filter((asset) => aptosChainIds.includes(asset.chain));

  const aptosAssets: AptosAsset[] = filteredAptosAssets.map((asset) => {
    return {
      ...asset,
      id: asset.denom,
      chainId: asset.chain,
      chainType: 'aptos',
    };
  });

  const filteredBitcoinAssets = assets.filter((asset) => bitcoinChainIds.includes(asset.chain));

  const bitcoinAssets: BitcoinAsset[] = filteredBitcoinAssets.map((asset) => {
    return {
      ...asset,
      id: asset.denom,
      chainId: asset.chain,
      chainType: 'bitcoin',
    };
  });

  return {
    cosmosAssets,
    evmAssets,
    suiAssets,
    aptosAssets,
    bitcoinAssets,
    erc20Assets,
    cw20Assets,
  };
}

export async function getGroupAssets() {
  const { aptosAssets, bitcoinAssets, cosmosAssets, cw20Assets, erc20Assets, evmAssets, suiAssets } = await getAssets();

  const supportedAssets = [...evmAssets, ...cosmosAssets, ...suiAssets, ...aptosAssets, ...bitcoinAssets, ...erc20Assets, ...cw20Assets];

  const assetToSingleOrGroup = supportedAssets.reduce<AssetSingleGroup>(
    (acc, asset) => {
      if (!asset.coinGeckoId) {
        acc.singles.push(asset);
        return acc;
      }

      if (!acc.groups[asset.coinGeckoId]) {
        acc.groups[asset.coinGeckoId] = [asset];
      } else {
        acc.groups[asset.coinGeckoId].push(asset);
      }
      return acc;
    },
    { singles: [], groups: {} },
  );

  const singles = assetToSingleOrGroup.singles;
  const groups = assetToSingleOrGroup.groups;

  return { singles, groups };
}

export async function getAccountAssets(id: string) {
  console.time('getAccountAssets');
  const concurrency = 10;
  const storage = await chrome.storage.local.get<ExtensionStorage>([
    `${id}-address`,
    `${id}-balance-cosmos`,
    `${id}-balance-evm`,
    `${id}-balance-aptos`,
    `${id}-balance-sui`,
    `${id}-balance-erc20`,
    `${id}-balance-cw20`,
  ]);

  const hiddenAssetIds = await getHiddenAssets(id);

  const { aptosChains, cosmosChains, evmChains, suiChains } = await getChains();
  const { aptosAssets, cosmosAssets, cw20Assets, erc20Assets, evmAssets, suiAssets } = await getAssets();

  const aptosAssetsWithoutHidden = aptosAssets.filter(
    (asset) => !hiddenAssetIds.find((assetId) => assetId.chainId === asset.chainId && assetId.id === asset.id && assetId.chainType === asset.chainType),
  );
  const cosmosAssetsWithoutHidden = cosmosAssets.filter(
    (asset) => !hiddenAssetIds.find((assetId) => assetId.chainId === asset.chainId && assetId.id === asset.id && assetId.chainType === asset.chainType),
  );
  const cw20AssetsWithoutHidden = cw20Assets.filter(
    (asset) => !hiddenAssetIds.find((assetId) => assetId.chainId === asset.chainId && assetId.id === asset.id && assetId.chainType === asset.chainType),
  );
  const erc20AssetsWithoutHidden = erc20Assets.filter(
    (asset) => !hiddenAssetIds.find((assetId) => assetId.chainId === asset.chainId && assetId.id === asset.id && assetId.chainType === asset.chainType),
  );
  const evmAssetsWithoutHidden = evmAssets.filter(
    (asset) => !hiddenAssetIds.find((assetId) => assetId.chainId === asset.chainId && assetId.id === asset.id && assetId.chainType === asset.chainType),
  );
  const suiAssetsWithoutHidden = suiAssets.filter(
    (asset) => !hiddenAssetIds.find((assetId) => assetId.chainId === asset.chainId && assetId.id === asset.id && assetId.chainType === asset.chainType),
  );

  const accountAddress = storage[`${id}-address`];

  const cosmosBalances = storage[`${id}-balance-cosmos`];
  const evmBalances = storage[`${id}-balance-evm`];
  const aptosBalances = storage[`${id}-balance-aptos`];
  const suiBalances = storage[`${id}-balance-sui`];
  const erc20Balances = storage[`${id}-balance-erc20`];
  const cw20Balances = storage[`${id}-balance-cw20`];

  const cosmosPromise = PromisePool.withConcurrency(concurrency)
    .for(cosmosAssetsWithoutHidden)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = cosmosChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const type = asset.id;
          const balanceInfo = cosmosBalances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );
          const balance = balanceInfo?.balances?.find((balance) => balance.denom === type)?.amount || '0';

          const result: AccountCosmosAsset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const cw20Promise = PromisePool.withConcurrency(concurrency)
    .for(cw20AssetsWithoutHidden)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = cosmosChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const type = asset.id;
          const balanceInfo = cw20Balances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );
          const balance = balanceInfo?.balances?.find((balance) => balance.contract === type)?.balance || '0';

          const result: AccountCw20Asset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const evmPromise = PromisePool.withConcurrency(concurrency)
    .for(evmAssetsWithoutHidden)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = evmChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const balanceInfo = evmBalances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );

          const balance = balanceInfo?.balance ? BigInt(balanceInfo?.balance).toString() : '0';

          const result: AccountEvmAsset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const erc20Promise = PromisePool.withConcurrency(concurrency)
    .for(erc20AssetsWithoutHidden)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = evmChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const type = asset.id;
          const balanceInfo = erc20Balances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );
          const balance = balanceInfo?.balances?.find((balance) => balance.contract === type)?.balance || '0';

          const result: AccountErc20Asset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const aptosPromise = PromisePool.withConcurrency(concurrency)
    .for(aptosAssetsWithoutHidden)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = aptosChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const type = `0x1::coin::CoinStore<${asset.id}>`;
          const balanceInfo = aptosBalances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );
          const balance = balanceInfo?.balances?.find((balance) => balance.type === type)?.data?.coin?.value || '0';
          const result: AccountAptosAsset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const suiPromise = PromisePool.withConcurrency(concurrency)
    .for(suiAssetsWithoutHidden)
    .process(async (asset) => {
      const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
      const chain = suiChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

      const { results } = await PromisePool.withConcurrency(concurrency)
        .for(addresses)
        .process((address) => {
          const type = asset.id;
          const balanceInfo = suiBalances?.find(
            (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
          );
          const balance = balanceInfo?.balances?.find((balance) => balance.coinType === type)?.totalBalance || '0';
          const result: AccountSuiAsset = {
            chain,
            asset,
            address,
            balance: balance,
          };

          return result;
        });

      return results;
    });

  const results = await Promise.all([cosmosPromise, evmPromise, aptosPromise, suiPromise, cw20Promise, erc20Promise]);

  const cosmosAccountAssets = results[0].results.flat().filter((asset) => asset.chain && asset.address);
  const evmAccountAssets = results[1].results.flat().filter((asset) => asset.chain && asset.address);
  const aptosAccountAssets = results[2].results.flat().filter((asset) => asset.chain && asset.address);
  const suiAccountAssets = results[3].results.flat().filter((asset) => asset.chain && asset.address);
  const cw20AccountAssets = results[4].results.flat().filter((asset) => asset.chain && asset.address);
  const erc20AccountAssets = results[5].results.flat().filter((asset) => asset.chain && asset.address);

  console.timeEnd('getAccountAssets');

  return { cosmosAccountAssets, evmAccountAssets, aptosAccountAssets, suiAccountAssets, cw20AccountAssets, erc20AccountAssets };
}
