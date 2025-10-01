import axios from 'axios';

import { getAccount } from '@/libs/account';
import { getHiddenAssets } from '@/libs/asset';
import { getAccountAssets } from '@/libs/asset/coin/default/accountAsset';
import { getAddedCustomChains } from '@/libs/chain';
import type { UniqueChainId } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import { isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';

import { aptosBalances } from './balance/aptos/balance';
import { bitcoinBalances } from './balance/bitcoin/balance';
import { customCw20Balance, customErc20Balance, cw20Balance, erc20Balance } from './balance/contractToken.ts/balance';
import { cosmosBalances, customCosmosBalances } from './balance/cosmos/balance';
import { getDefaultVisibleAsset } from './balance/defaultVisibleAssets';
import { customEvmBalances, evmBalances } from './balance/evm/balance';
import { iotaBalances } from './balance/iota/balance';
import { suiBalances } from './balance/sui/balance';

export async function updateDefaultAssetsBalance(id: string) {
  console.time(`default-balance-${id}`);
  try {
    await getAccount(id);

    await Promise.all([
      cosmosBalances(id, {
        isMinimal: true,
      }),
      evmBalances(id, {
        isMinimal: true,
      }),
      bitcoinBalances(id),
    ]);

    await updateHiddenAssetsExcludingDefault(id);

    updateBalance(id);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd(`default-balance-${id}`);
  }
}

export async function updateActiveAssetsBalance(id: string) {
  console.time(`balance-${id}`);
  try {
    await getAccount(id);
    await initAssests(id);

    await updateBalance(id);

    await initAccount(id);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd(`balance-${id}`);
  }
}

export async function updateSpecificChainBalance(id: string, chainId: UniqueChainId) {
  console.time(`chain-balance-${id}-${chainId}`);
  try {
    await getAccount(id);

    await fetchChainBalanceByType(id, chainId);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd(`chain-balance-${id}-${chainId}`);
  }
}

async function fetchChainBalanceByType(id: string, chainId: UniqueChainId) {
  const addedCustomChainList = await getAddedCustomChains();

  const { chainType } = parseUniqueChainId(chainId);
  const isCustomChain = addedCustomChainList.some((customChain) => isMatchingUniqueChainId(customChain, chainId));

  if (isCustomChain) {
    if (chainType === 'cosmos') {
      await Promise.all([customCosmosBalances(id, { chainId }), customCw20Balance(id, { chainId })]);
    }

    if (chainType === 'evm') {
      await Promise.all([customEvmBalances(id, { chainId }), customErc20Balance(id, { chainId })]);
    }
  } else {
    if (chainType === 'cosmos') {
      await Promise.all([cosmosBalances(id, { chainId }), cw20Balance(id, { chainId }), customCw20Balance(id, { chainId })]);
    }

    if (chainType === 'evm') {
      await Promise.all([evmBalances(id, { chainId }), erc20Balance(id, { chainId }), customErc20Balance(id, { chainId })]);
    }

    if (chainType === 'aptos') {
      await Promise.all([aptosBalances(id, { chainId })]);
    }

    if (chainType === 'sui') {
      await Promise.all([suiBalances(id, { chainId })]);
    }
    if (chainType === 'bitcoin') {
      await Promise.all([bitcoinBalances(id, { chainId })]);
    }
    if (chainType === 'iota') {
      await Promise.all([iotaBalances(id, { chainId })]);
    }
  }
}

export async function updateBalance(id: string) {
  console.time(`update-balance-${id}`);
  try {
    await getAccount(id);

    await Promise.all([cosmosBalances(id), evmBalances(id), aptosBalances(id), suiBalances(id), iotaBalances(id), bitcoinBalances(id)]);

    await Promise.all([erc20Balance(id), cw20Balance(id), customErc20Balance(id), customCw20Balance(id)]);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd(`update-balance-${id}`);
  }
}

export async function updateCustomBalance(id: string) {
  console.time(`update-custom-balance-${id}`);
  try {
    await getAccount(id);
    await Promise.all([customCosmosBalances(id), customEvmBalances(id)]);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd(`update-custom-balance-${id}`);
  }
}

export async function updatePriorityBalance(id: string, priority: 'high' | 'low', updateAssets: () => void) {
  console.time(`update-priority-balance-${id}`);

  try {
    await getAccount(id);

    const chunkSize = priority === 'high' ? 10 : 30;
    const optionUpdatePerChunk = { priority, updateAssets, chunkSize };
    const optionUpdateAfterAll = { priority, chunkSize };

    await Promise.all([
      cosmosBalances(id, optionUpdatePerChunk),
      evmBalances(id, optionUpdatePerChunk),
      erc20Balance(id, optionUpdatePerChunk),
      cw20Balance(id, optionUpdatePerChunk),
      customErc20Balance(id, optionUpdatePerChunk),
      customCw20Balance(id, optionUpdatePerChunk),
      Promise.all([
        suiBalances(id, optionUpdateAfterAll),
        iotaBalances(id, optionUpdateAfterAll),
        aptosBalances(id, optionUpdateAfterAll),
        bitcoinBalances(id, optionUpdateAfterAll),
        customCosmosBalances(id, optionUpdateAfterAll),
        customEvmBalances(id, optionUpdateAfterAll),
      ]).then(() => updateAssets()),
    ]);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd(`update-priority-balance-${id}`);
  }
}

export async function initAccount(id: string) {
  await getAccount(id);
  const { initAccountIds } = await chrome.storage.local.get<ExtensionStorage>('initAccountIds');

  const storedHiddenAssetIds = await getHiddenAssets(id);

  if (!initAccountIds?.includes(id)) {
    const { cw20AccountAssets, erc20AccountAssets } = await getAccountAssets(id);

    const mergedAccountAssets = [...cw20AccountAssets, ...erc20AccountAssets];

    const hiddenAssetIds = mergedAccountAssets
      .filter((asset) => asset.balance === '0')
      .map((asset) => {
        return { id: asset.asset.id, chainId: asset.asset.chainId, chainType: asset.asset.chainType };
      });

    const uniqueHiddenAssetIds = [...storedHiddenAssetIds, ...hiddenAssetIds].filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id && t.chainId === v.chainId && t.chainType === v.chainType) === i,
    );

    const defaultVisibleAssetIds = getDefaultVisibleAsset();

    if (initAccountIds?.length > 0) {
      await chrome.storage.local.set<Pick<ExtensionStorage, 'initAccountIds'>>({ initAccountIds: [...initAccountIds, id] });
    } else {
      await chrome.storage.local.set<Pick<ExtensionStorage, 'initAccountIds'>>({ initAccountIds: [id] });
    }

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-hidden-assetIds`>>({ [`${id}-hidden-assetIds`]: uniqueHiddenAssetIds });
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-visible-assetIds`>>({ [`${id}-visible-assetIds`]: defaultVisibleAssetIds });
  }
}

export async function updateHiddenAssetsExcludingDefault(id: string) {
  await getAccount(id);
  const { initAccountIds } = await chrome.storage.local.get<ExtensionStorage>('initAccountIds');

  const storedHiddenAssetIds = await getHiddenAssets(id);

  if (!initAccountIds?.includes(id)) {
    const { cw20AccountAssets, erc20AccountAssets } = await getAccountAssets(id);

    const mergedAccountAssets = [...cw20AccountAssets, ...erc20AccountAssets];

    const hiddenAssetIds = mergedAccountAssets
      .filter((asset) => asset.balance === '0')
      .map((asset) => {
        return { id: asset.asset.id, chainId: asset.asset.chainId, chainType: asset.asset.chainType };
      });

    const uniqueHiddenAssetIds = [...storedHiddenAssetIds, ...hiddenAssetIds].filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id && t.chainId === v.chainId && t.chainType === v.chainType) === i,
    );

    const defaultVisibleAssetIds = getDefaultVisibleAsset();

    if (initAccountIds?.length > 0) {
      await chrome.storage.local.set<Pick<ExtensionStorage, 'initAccountIds'>>({ initAccountIds: [...initAccountIds, id] });
    } else {
      await chrome.storage.local.set<Pick<ExtensionStorage, 'initAccountIds'>>({ initAccountIds: [id] });
    }

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-hidden-assetIds`>>({ [`${id}-hidden-assetIds`]: uniqueHiddenAssetIds });
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-visible-assetIds`>>({ [`${id}-visible-assetIds`]: defaultVisibleAssetIds });
  }
}

export async function initAssests(id: string) {
  await getAccount(id);
  const { initAccountIds } = await chrome.storage.local.get<ExtensionStorage>('initAccountIds');

  if (!initAccountIds?.includes(id)) {
    const { erc20Assets, cw20Assets } = await chrome.storage.local.get<ExtensionStorage>(['cw20Assets', 'erc20Assets']);

    const nonPreloadedERC20Tokens = erc20Assets.filter((asset) => !asset.wallet_preload);
    const nonPreloadedCW20Assets = cw20Assets.filter((asset) => !asset.wallet_preload);

    const hiddenAssetIds = [...nonPreloadedERC20Tokens, ...nonPreloadedCW20Assets].map((asset) => {
      return { id: asset.id, chainId: asset.chainId, chainType: asset.chainType };
    });

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-hidden-assetIds`>>({ [`${id}-hidden-assetIds`]: hiddenAssetIds });
  }
}
