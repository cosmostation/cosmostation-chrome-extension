import axios from 'axios';
import { PromisePool } from '@supercharge/promise-pool';

import { BALANCE_FETCH_TIME_OUT_MS } from '@/constants/common';
import { COREUM_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { chainToDeploymentMap, MULICALL_CONTRACT_ADDRESS } from '@/constants/evm/mutlicall3';
import { getAccount, getAccountAddress, getAllAccountAddress, getCustomAccountAddress } from '@/libs/account';
import { getAccountAssets, getAssets, getHiddenAssets } from '@/libs/asset';
import { getAddedCustomChains, getAllChains, getChains } from '@/libs/chain';
import type {
  AccountAddressBalanceAptos,
  AccountAddressBalanceBitcoin,
  AccountAddressBalanceCosmos,
  AccountAddressBalanceEvm,
  AccountAddressBalanceIota,
  AccountAddressBalanceSui,
  AccountAddressLockedBalanceCosmos,
} from '@/types/account';
import type { AptosResourceResponse } from '@/types/aptos/api';
import type { AssetId } from '@/types/asset';
import type { AccountDetail } from '@/types/bitcoin/balance';
import type { ChainType, UniqueChainId } from '@/types/chain';
import type { ExtensionStorage } from '@/types/extension';
import { upsertList } from '@/utils/array';
import {
  fetchCoreumSpendableBalances,
  fetchCosmosBalances,
  fetchCW20Balances,
  fetchERC20Balances,
  fetchEVMBalances,
  fetchMultiERC20Balances,
} from '@/utils/cosmos/fetch/balance';
import { fetchIotaBalances } from '@/utils/iota/fetch/balance';
import { minus } from '@/utils/numbers';
import { getUniqueChainIdWithManual, isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { isEqualsIgnoringCase } from '@/utils/string';
import { fetchSuiBalances } from '@/utils/sui/fetch/balance';

export interface BalanceFetchOption {
  address?: string;
  chainId?: UniqueChainId;
}
interface CosmosBalancesOption extends BalanceFetchOption {
  isMinimal?: boolean;
}

interface EVMBalancesOption extends BalanceFetchOption {
  isMinimal?: boolean;
}

const defaultCosmosCoinList: AssetId[] = [{ id: 'uatom', chainId: 'cosmos', chainType: 'cosmos' }];
const defaultEvmCoinList: AssetId[] = [{ id: NATIVE_EVM_COIN_ADDRESS, chainId: 'ethereum', chainType: 'evm' }];
const defaultBitcoinCoinList: AssetId[] = [{ id: 'btc', chainId: 'bitcoin', chainType: 'bitcoin' }];

const defaultCoinList = [...defaultCosmosCoinList, ...defaultEvmCoinList, ...defaultBitcoinCoinList];

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
      console.error(`${error.request?.method} ${error.request?.url} ${error.cause?.message}`);
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
      console.error(`${error.request?.method} ${error.request?.url} ${error.cause?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd(`balance-${id}`);
  }
}

export async function updateSpecificChainBalance(id: string, chainId: UniqueChainId, address: string) {
  console.time(`chain-balance-${id}-${chainId}-${address}`);
  try {
    await getAccount(id);

    await fetchChainBalanceByType(id, chainId, address);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error.cause?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd(`chain-balance-${id}-${chainId}-${address}`);
  }
}

async function fetchChainBalanceByType(id: string, chainId: UniqueChainId, address: string) {
  const addedCustomChainList = await getAddedCustomChains();

  const { chainType } = parseUniqueChainId(chainId);
  const isCustomChain = addedCustomChainList.some((customChain) => isMatchingUniqueChainId(customChain, chainId));

  if (isCustomChain) {
    if (chainType === 'cosmos') {
      await Promise.all([customCosmosBalances(id, { address, chainId }), customCw20Balance(id, { address, chainId })]);
    }

    if (chainType === 'evm') {
      await Promise.all([customEvmBalances(id, { address, chainId }), customErc20Balance(id, { address, chainId })]);
    }
  } else {
    if (chainType === 'cosmos') {
      await Promise.all([cosmosBalances(id, { address, chainId }), cw20Balance(id, { address, chainId }), customCw20Balance(id, { address, chainId })]);
    }

    if (chainType === 'evm') {
      await Promise.all([evmBalances(id, { address, chainId }), erc20Balance(id, { address, chainId }), customErc20Balance(id, { address, chainId })]);
    }

    if (chainType === 'aptos') {
      await Promise.all([aptosBalances(id, { address, chainId })]);
    }

    if (chainType === 'sui') {
      await Promise.all([suiBalances(id, { address, chainId })]);
    }
    if (chainType === 'bitcoin') {
      await Promise.all([bitcoinBalances(id, { address, chainId })]);
    }
    if (chainType === 'iota') {
      await Promise.all([iotaBalances(id, { address, chainId })]);
    }
  }
}

export async function updateBalance(id: string) {
  console.time(`update-balance-${id}`);
  try {
    await getAccount(id);

    await Promise.all([
      cosmosBalances(id),
      evmBalances(id),
      aptosBalances(id),
      suiBalances(id),
      iotaBalances(id),
      bitcoinBalances(id),
      erc20Balance(id),
      cw20Balance(id),
      customErc20Balance(id),
      customCw20Balance(id),
    ]);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error.cause?.message}`);
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
      console.error(`${error.request?.method} ${error.request?.url} ${error.cause?.message}`);
    } else {
      console.error(error);
    }
  } finally {
    console.timeEnd(`update-custom-balance-${id}`);
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

    const defaultVisibleAssetIds = defaultCoinList.map((coin) => ({
      id: coin.id,
      chainId: coin.chainId,
      chainType: coin.chainType as ChainType,
    }));

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

    const defaultVisibleAssetIds = defaultCoinList.map((coin) => ({
      id: coin.id,
      chainId: coin.chainId,
      chainType: coin.chainType as ChainType,
    }));

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
    const { cw20Assets, erc20Assets } = await getAssets();

    const nonPreloadedERC20Tokens = erc20Assets.filter((asset) => !asset.wallet_preload);
    const nonPreloadedCW20Assets = cw20Assets.filter((asset) => !asset.wallet_preload);

    const hiddenAssetIds = [...nonPreloadedERC20Tokens, ...nonPreloadedCW20Assets].map((asset) => {
      return { id: asset.id, chainId: asset.chainId, chainType: asset.chainType };
    });

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-hidden-assetIds`>>({ [`${id}-hidden-assetIds`]: hiddenAssetIds });
  }
}
interface UpsertItemBase {
  address: string;
  chainId: string | number;
  chainType: string;
  id: string;
}

const isSameUpsertItem = (a: UpsertItemBase, b: UpsertItemBase) =>
  isEqualsIgnoringCase(a.address, b.address) && a.chainId === b.chainId && a.chainType === b.chainType && a.id === b.id;

async function cosmosBalances(id: string, { isMinimal = false, address, chainId }: CosmosBalancesOption = {}) {
  const accountAddress = await getAccountAddress(id);
  const { cosmosChains } = await getChains();
  const stored = (await getExtensionLocalStorage(`${id}-balance-cosmos`)) || [];

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isMinimal
    ? accountAddress.filter((addr) => defaultCosmosCoinList.some((chain) => chain.chainId === addr.chainId && chain.chainType === addr.chainType))
    : isUpdateSpecificAddress
      ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
      : accountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = cosmosChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const { lcdUrls } = chain;

      try {
        // note 테스트용 코드
        // if (chainId === 'cosmos') {
        //   throw new Error('의도적 에러처리');
        // }
        const balances = await fetchCosmosBalances(address, lcdUrls.map((item) => item.url).filter(Boolean));

        if (chainId === COREUM_CHAINLIST_ID) {
          try {
            const spendableBalances = await fetchCoreumSpendableBalances(address, lcdUrls.map((item) => item.url).filter(Boolean));

            const totalBalance = balances.find((item) => item.denom === chain.mainAssetDenom);
            const spendableBalance = spendableBalances.find((item) => item.denom === chain.mainAssetDenom);

            const lockedAmount = minus(totalBalance?.amount || '0', spendableBalance?.amount || '0');

            const lockedAssetInfo = {
              denom: chain.mainAssetDenom,
              amount: lockedAmount,
            };

            const lockedResult: AccountAddressLockedBalanceCosmos = {
              id,
              chainId,
              chainType,
              address,
              lockedBalances: [lockedAssetInfo],
            };

            await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-locked-cosmos`>>({ [`${id}-locked-cosmos`]: [lockedResult] });

            const result: AccountAddressBalanceCosmos = { id, chainId, chainType, address, balances: spendableBalances, lastUpdatedAtMs: Date.now() };

            return result;
          } catch {
            await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-locked-cosmos`>>({ [`${id}-locked-cosmos`]: [] });

            const result: AccountAddressBalanceCosmos = { id, chainId, chainType, address, balances, lastUpdatedAtMs: Date.now() };
            return result;
          }
        }

        const result: AccountAddressBalanceCosmos = { id, chainId, chainType, address, balances, lastUpdatedAtMs: Date.now() };

        return result;
      } catch {
        const target = stored.find((store) => store.chainId === chainId && store.chainType === chainType && isEqualsIgnoringCase(store.address, address));

        if (target) {
          if (!target.lastUpdatedAtMs) {
            return {
              ...target,
              lastUpdatedAtMs: Date.now(),
            };
          }

          return target;
        }
        const result: AccountAddressBalanceCosmos = { id, chainId, chainType, address, balances: [], lastUpdatedAtMs: Date.now() };

        return result;
      }
    });

  if (isUpdateSpecificAddress) {
    const updatedCosmosBalance = upsertList(stored, results, isSameUpsertItem, (e, i) => (e.balances = i.balances));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-cosmos`>>({ [`${id}-balance-cosmos`]: updatedCosmosBalance });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-cosmos`>>({ [`${id}-balance-cosmos`]: results });
  }
}

async function customCosmosBalances(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const customAccountAddress = await getCustomAccountAddress(id);
  const addedCustomChains = await getAddedCustomChains();
  const stored = (await getExtensionLocalStorage(`${id}-custom-balance-cosmos`)) || [];

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? customAccountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : customAccountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const addedCosmosCustomChains = addedCustomChains.filter((chain) => chain.chainType === 'cosmos');
      const chain = addedCosmosCustomChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const { lcdUrls } = chain;

      try {
        const balances = await fetchCosmosBalances(address, lcdUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressBalanceCosmos = { id, chainId, chainType, address, balances, lastUpdatedAtMs: Date.now() };

        return result;
      } catch {
        const target = stored.find((store) => store.chainId === chainId && store.chainType === chainType && isEqualsIgnoringCase(store.address, address));

        if (target) {
          if (!target.lastUpdatedAtMs) {
            return {
              ...target,
              lastUpdatedAtMs: Date.now(),
            };
          }

          return target;
        }
        const result: AccountAddressBalanceCosmos = { id, chainId, chainType, address, balances: [], lastUpdatedAtMs: Date.now() };

        return result;
      }
    });

  if (isUpdateSpecificAddress) {
    const updatedCustomCosmosBalance = upsertList(stored, results, isSameUpsertItem, (e, i) => (e.balances = i.balances));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-cosmos`>>({ [`${id}-custom-balance-cosmos`]: updatedCustomCosmosBalance });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-cosmos`>>({ [`${id}-custom-balance-cosmos`]: results });
  }
}

async function evmBalances(id: string, { isMinimal = false, address, chainId }: EVMBalancesOption = {}) {
  const accountAddress = await getAccountAddress(id);
  const { evmChains } = await getChains();
  const stored = (await getExtensionLocalStorage(`${id}-balance-evm`)) || [];

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isMinimal
    ? accountAddress.filter((addr) => defaultEvmCoinList.find((chain) => chain.chainId === addr.chainId && chain.chainType === addr.chainType))
    : isUpdateSpecificAddress
      ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
      : accountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = evmChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      try {
        const balance = await fetchEVMBalances(address, rpcUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressBalanceEvm = { id, chainId, chainType, address, balance, lastUpdatedAtMs: Date.now() };

        return result;
      } catch {
        const target = stored.find((store) => store.chainId === chainId && store.chainType === chainType && isEqualsIgnoringCase(store.address, address));

        if (target) {
          if (!target.lastUpdatedAtMs) {
            return {
              ...target,
              lastUpdatedAtMs: Date.now(),
            };
          }

          return target;
        }

        const result: AccountAddressBalanceEvm = { id, chainId, chainType, address, balance: '0x0', lastUpdatedAtMs: Date.now() };

        return result;
      }
    });

  if (isUpdateSpecificAddress) {
    const updatedEVMBalance = upsertList(stored, results, isSameUpsertItem, (e, i) => (e.balance = i.balance));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-evm`>>({ [`${id}-balance-evm`]: updatedEVMBalance });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-evm`>>({ [`${id}-balance-evm`]: results });
  }
}

async function customEvmBalances(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const customAccountAddress = await getCustomAccountAddress(id);
  const addedCustomChains = await getAddedCustomChains();
  const stored = (await getExtensionLocalStorage(`${id}-custom-balance-evm`)) || [];

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? customAccountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : customAccountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const addedEVMCustomChains = addedCustomChains.filter((chain) => chain.chainType === 'evm');
      const chain = addedEVMCustomChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;

      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      try {
        const balance = await fetchEVMBalances(address, rpcUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressBalanceEvm = { id, chainId, chainType, address, balance, lastUpdatedAtMs: Date.now() };

        return result;
      } catch {
        const target = stored.find((store) => store.chainId === chainId && store.chainType === chainType && isEqualsIgnoringCase(store.address, address));

        if (target) {
          if (!target.lastUpdatedAtMs) {
            return {
              ...target,
              lastUpdatedAtMs: Date.now(),
            };
          }

          return target;
        }
        const result: AccountAddressBalanceEvm = { id, chainId, chainType, address, balance: '0x0', lastUpdatedAtMs: Date.now() };

        return result;
      }
    });

  if (isUpdateSpecificAddress) {
    const updatedCustomEVMBalance = upsertList(stored, results, isSameUpsertItem, (e, i) => (e.balance = i.balance));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-evm`>>({ [`${id}-custom-balance-evm`]: updatedCustomEVMBalance });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-evm`>>({ [`${id}-custom-balance-evm`]: results });
  }
}

async function bitcoinBalances(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const accountAddress = await getAccountAddress(id);
  const { bitcoinChains } = await getChains();
  const stored = (await getExtensionLocalStorage(`${id}-balance-bitcoin`)) || [];

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : accountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = bitcoinChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { mempoolURL } = chain;

      const url = `${mempoolURL}/address/${address}`;

      try {
        const response = await axios.get<AccountDetail>(url, {
          timeout: BALANCE_FETCH_TIME_OUT_MS,
        });

        const balance = {
          chainStats: response.data?.chain_stats || undefined,
          mempoolStats: response.data?.mempool_stats || undefined,
        };

        const result: AccountAddressBalanceBitcoin = { id, chainId, chainType, address, balance, lastUpdatedAtMs: Date.now() };

        return result;
      } catch {
        const target = stored.find((store) => store.chainId === chainId && store.chainType === chainType && isEqualsIgnoringCase(store.address, address));

        if (target) {
          if (!target.lastUpdatedAtMs) {
            return {
              ...target,
              lastUpdatedAtMs: Date.now(),
            };
          }

          return target;
        }

        const result: AccountAddressBalanceBitcoin = {
          id,
          chainId,
          chainType,
          address,
          balance: {
            chainStats: undefined,
            mempoolStats: undefined,
          },
          lastUpdatedAtMs: Date.now(),
        };

        return result;
      }
    });

  if (isUpdateSpecificAddress) {
    const updatedBitcoinBalances = upsertList(stored, results, isSameUpsertItem, (e, i) => (e.balance = i.balance));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-bitcoin`>>({ [`${id}-balance-bitcoin`]: updatedBitcoinBalances });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-bitcoin`>>({ [`${id}-balance-bitcoin`]: results });
  }
}

async function aptosBalances(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const accountAddress = await getAccountAddress(id);
  const { aptosChains } = await getChains();
  const stored = (await getExtensionLocalStorage(`${id}-balance-aptos`)) || [];

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : accountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = aptosChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const urlPath = `/v1/accounts/${address}/resources`;

      const { rpcUrls } = chain;

      const promises = rpcUrls.map(async (rpcUrl) => {
        const url = rpcUrl.url.endsWith('/') ? rpcUrl.url.slice(0, -1) : rpcUrl.url;
        const requestUrl = `${url}${urlPath}`;

        const response = await axios.get<AptosResourceResponse[]>(requestUrl, {
          timeout: BALANCE_FETCH_TIME_OUT_MS,
        });

        return response.data;
      });

      try {
        const response = await Promise.any(promises);

        const balances = response.filter((resource) => resource.type?.startsWith('0x1::coin::CoinStore'));

        const result: AccountAddressBalanceAptos = { id, chainId, chainType, address, balances, lastUpdatedAtMs: Date.now() };

        return result;
      } catch {
        const target = stored.find((store) => store.chainId === chainId && store.chainType === chainType && isEqualsIgnoringCase(store.address, address));

        if (target) {
          if (!target.lastUpdatedAtMs) {
            return {
              ...target,
              lastUpdatedAtMs: Date.now(),
            };
          }

          return target;
        }

        const result: AccountAddressBalanceAptos = { id, chainId, chainType, address, balances: [], lastUpdatedAtMs: Date.now() };

        return result;
      }
    });

  if (isUpdateSpecificAddress) {
    const updatedAptosBalances = upsertList(stored, results, isSameUpsertItem, (e, i) => (e.balances = i.balances));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-aptos`>>({ [`${id}-balance-aptos`]: updatedAptosBalances });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-aptos`>>({ [`${id}-balance-aptos`]: results });
  }
}

async function suiBalances(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const accountAddress = await getAccountAddress(id);
  const { suiChains } = await getChains();
  const stored = (await getExtensionLocalStorage(`${id}-balance-sui`)) || [];

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : accountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = suiChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      try {
        const balances = await fetchSuiBalances(address, rpcUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressBalanceSui = { id, chainId, chainType, address, balances, lastUpdatedAtMs: Date.now() };

        return result;
      } catch {
        const target = stored.find((store) => store.chainId === chainId && store.chainType === chainType && isEqualsIgnoringCase(store.address, address));

        if (target) {
          if (!target.lastUpdatedAtMs) {
            return {
              ...target,
              lastUpdatedAtMs: Date.now(),
            };
          }

          return target;
        }

        const result: AccountAddressBalanceSui = { id, chainId, chainType, address, balances: [], lastUpdatedAtMs: Date.now() };

        return result;
      }
    });

  if (isUpdateSpecificAddress) {
    const updatedSuiBalances = upsertList(stored, results, isSameUpsertItem, (e, i) => (e.balances = i.balances));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-sui`>>({ [`${id}-balance-sui`]: updatedSuiBalances });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-sui`>>({ [`${id}-balance-sui`]: results });
  }
}

async function iotaBalances(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const accountAddress = await getAccountAddress(id);
  const { iotaChains } = await getChains();
  const stored = (await getExtensionLocalStorage(`${id}-balance-iota`)) || [];

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : accountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = iotaChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      try {
        const balances = await fetchIotaBalances(address, rpcUrls.map((item) => item.url).filter(Boolean));

        const result: AccountAddressBalanceIota = { id, chainId, chainType, address, balances, lastUpdatedAtMs: Date.now() };

        return result;
      } catch {
        const target = stored.find((store) => store.chainId === chainId && store.chainType === chainType && isEqualsIgnoringCase(store.address, address));

        if (target) {
          if (!target.lastUpdatedAtMs) {
            return {
              ...target,
              lastUpdatedAtMs: Date.now(),
            };
          }

          return target;
        }

        const result: AccountAddressBalanceIota = { id, chainId, chainType, address, balances: [], lastUpdatedAtMs: Date.now() };

        return result;
      }
    });

  if (isUpdateSpecificAddress) {
    const updatedIotaBalances = upsertList(stored, results, isSameUpsertItem, (e, i) => (e.balances = i.balances));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-iota`>>({ [`${id}-balance-iota`]: updatedIotaBalances });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-iota`>>({ [`${id}-balance-iota`]: results });
  }
}

async function erc20Balance(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const accountAddress = await getAccountAddress(id);
  const hiddenAssets = await getHiddenAssets(id);
  const { evmChains } = await getChains();
  const { erc20Assets } = await getAssets();
  const stored = (await getExtensionLocalStorage(`${id}-balance-erc20`)) || [];

  const erc20AssetsToDisplay = erc20Assets.filter((asset) => {
    const isAssetVisible = !hiddenAssets.find(
      (hiddenAsset) => hiddenAsset.id === asset.id && hiddenAsset.chainId === asset.chainId && hiddenAsset.chainType === asset.chainType,
    );
    const isPreload = asset.wallet_preload;

    return isAssetVisible || isPreload;
  });

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : accountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = evmChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const { rpcUrls } = chain;
      const assets = erc20AssetsToDisplay.filter((asset) => asset.chainType === addr.chainType && asset.chainId === addr.chainId && asset.type === 'erc20');

      const chainIdDecimal = parseInt(chain.chainId, 16).toString();

      const isMulticallEnabled =
        !!chainToDeploymentMap[chainIdDecimal] && isEqualsIgnoringCase(chainToDeploymentMap[chainIdDecimal], MULICALL_CONTRACT_ADDRESS);

      if (isMulticallEnabled) {
        try {
          const allBalances = await fetchMultiERC20Balances(
            address,
            assets.map((item) => item.id),
            rpcUrls.map((item) => item.url).filter(Boolean),
          );

          const balances = allBalances.map((item) => {
            if (item.isError) {
              const target = stored.find((store) => store.chainId === chainId && store.chainType === chainType && isEqualsIgnoringCase(store.address, address));
              const realTarget = target?.balances.find((storedItem) => isEqualsIgnoringCase(storedItem.contract, item.contract));

              if (realTarget) {
                if (!realTarget.lastUpdatedAtMs) {
                  return {
                    ...realTarget,
                    lastUpdatedAtMs: Date.now(),
                  };
                }

                return realTarget;
              }

              return {
                contract: item.contract,
                balance: '0',
                lastUpdatedAtMs: Date.now(),
              };
            }

            return item;
          });

          const result = { id, chainId, chainType, address, balances };

          return result;
        } catch {
          const defaultAssets = assets.map((item) => ({
            contract: item.id,
            balance: '0',
            lastUpdatedAtMs: Date.now(),
          }));

          const result = { id, chainId, chainType, address, balances: defaultAssets };

          return result;
        }
      } else {
        const { results: allBalances } = await PromisePool.withConcurrency(5)
          .for(assets)
          .process(async (asset) => {
            const { id: contractAddress } = asset;

            try {
              const balance = await fetchERC20Balances(address, contractAddress, rpcUrls.map((item) => item.url).filter(Boolean));

              const result = { contract: contractAddress, balance, lastUpdatedAtMs: Date.now() };

              return result;
            } catch {
              const target = stored.find((store) => store.chainId === chainId && store.chainType === chainType && isEqualsIgnoringCase(store.address, address));
              const realTarget = target?.balances.find((storedItem) => isEqualsIgnoringCase(storedItem.contract, asset.id));

              if (realTarget) {
                if (!realTarget.lastUpdatedAtMs) {
                  return {
                    ...realTarget,
                    lastUpdatedAtMs: Date.now(),
                  };
                }

                return realTarget;
              }

              return {
                contract: contractAddress,
                balance: '0',
                lastUpdatedAtMs: Date.now(),
              };
            }
          });

        const result = { id, chainId, chainType, address, balances: allBalances };
        return result;
      }
    });

  if (isUpdateSpecificAddress) {
    const updatedERC20Balances = upsertList(stored, results, isSameUpsertItem, (e, i) => (e.balances = i.balances));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-erc20`>>({ [`${id}-balance-erc20`]: updatedERC20Balances });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-erc20`>>({ [`${id}-balance-erc20`]: results });
  }
}

async function customErc20Balance(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const allAccountAddress = await getAllAccountAddress(id);

  const allChain = await getAllChains();

  const allEVMChains = allChain.filter((chain) => chain.chainType === 'evm');

  const { customErc20Assets } = await getAssets();
  const stored = (await getExtensionLocalStorage(`${id}-custom-balance-erc20`)) || [];

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? allAccountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : allAccountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = allEVMChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const { rpcUrls } = chain;
      const assets = customErc20Assets.filter((asset) => asset.chainType === addr.chainType && asset.chainId === addr.chainId && asset.type === 'erc20');

      const chainIdDecimal = parseInt(chain.chainId, 16).toString();

      const isMulticallEnabled =
        !!chainToDeploymentMap[chainIdDecimal] && isEqualsIgnoringCase(chainToDeploymentMap[chainIdDecimal], MULICALL_CONTRACT_ADDRESS);

      if (isMulticallEnabled) {
        try {
          const allBalances = await fetchMultiERC20Balances(
            address,
            assets.map((item) => item.id),
            rpcUrls.map((item) => item.url).filter(Boolean),
          );

          const balances = allBalances.map((item) => {
            if (item.isError) {
              const target = stored.find((store) => store.chainId === chainId && store.chainType === chainType && isEqualsIgnoringCase(store.address, address));
              const realTarget = target?.balances.find((storedItem) => isEqualsIgnoringCase(storedItem.contract, item.contract));

              if (realTarget) {
                if (!realTarget.lastUpdatedAtMs) {
                  return {
                    ...realTarget,
                    lastUpdatedAtMs: Date.now(),
                  };
                }

                return realTarget;
              }

              return {
                contract: item.contract,
                balance: '0',
                lastUpdatedAtMs: Date.now(),
              };
            }

            return item;
          });

          const result = { id, chainId, chainType, address, balances };
          return result;
        } catch {
          const defaultAssets = assets.map((item) => ({
            contract: item.id,
            balance: '0',
            lastUpdatedAtMs: Date.now(),
          }));

          const result = { id, chainId, chainType, address, balances: defaultAssets };

          return result;
        }
      } else {
        const { results: allBalances } = await PromisePool.withConcurrency(5)
          .for(assets)
          .process(async (asset) => {
            const { id: contractAddress } = asset;

            try {
              const balance = await fetchERC20Balances(address, contractAddress, rpcUrls.map((item) => item.url).filter(Boolean));

              const result = { contract: contractAddress, balance, lastUpdatedAtMs: Date.now() };

              return result;
            } catch {
              const target = stored.find((store) => store.chainId === chainId && store.chainType === chainType && isEqualsIgnoringCase(store.address, address));
              const realTarget = target?.balances.find((storedItem) => isEqualsIgnoringCase(storedItem.contract, asset.id));

              if (realTarget) {
                if (!realTarget.lastUpdatedAtMs) {
                  return {
                    ...realTarget,
                    lastUpdatedAtMs: Date.now(),
                  };
                }

                return realTarget;
              }

              return {
                contract: asset.id,
                balance: '0',
                lastUpdatedAtMs: Date.now(),
              };
            }
          });

        const result = { id, chainId, chainType, address, balances: allBalances };
        return result;
      }
    });

  if (isUpdateSpecificAddress) {
    const updatedCustomERC20Balances = upsertList(stored, results, isSameUpsertItem, (e, i) => (e.balances = i.balances));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-erc20`>>({ [`${id}-custom-balance-erc20`]: updatedCustomERC20Balances });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-erc20`>>({ [`${id}-custom-balance-erc20`]: results });
  }
}

async function cw20Balance(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const accountAddress = await getAccountAddress(id);
  const hiddenAssets = await getHiddenAssets(id);
  const { cosmosChains } = await getChains();
  const { cw20Assets } = await getAssets();
  const stored = (await getExtensionLocalStorage(`${id}-balance-cw20`)) || [];

  const cw20AssetsWithoutHidden = cw20Assets.filter((asset) => {
    const isAssetVisible = !hiddenAssets.find(
      (hiddenAsset) => hiddenAsset.id === asset.id && hiddenAsset.chainId === asset.chainId && hiddenAsset.chainType === asset.chainType,
    );
    const isPreload = asset.wallet_preload;

    return isAssetVisible || isPreload;
  });

  const cosmosChainsWithCosmwasm = cosmosChains.filter((chain) => chain.isCosmwasm);

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : accountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = cosmosChainsWithCosmwasm.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const { lcdUrls } = chain;
      const assets = cw20AssetsWithoutHidden.filter((asset) => asset.chainType === addr.chainType && asset.chainId === addr.chainId && asset.type === 'cw20');

      const { results: allBalances } = await PromisePool.withConcurrency(5)
        .for(assets)
        .process(async (asset) => {
          const { id: contractAddress } = asset;

          try {
            const balance = await fetchCW20Balances(address, contractAddress, lcdUrls.map((item) => item.url).filter(Boolean));

            const result = { contract: contractAddress, balance, lastUpdatedAtMs: Date.now() };

            return result;
          } catch {
            const target = stored.find((store) => store.chainId === chainId && store.chainType === chainType && isEqualsIgnoringCase(store.address, address));
            const realTarget = target?.balances.find((storedItem) => isEqualsIgnoringCase(storedItem.contract, asset.id));

            if (realTarget) {
              if (!realTarget.lastUpdatedAtMs) {
                return {
                  ...realTarget,
                  lastUpdatedAtMs: Date.now(),
                };
              }

              return realTarget;
            }

            return {
              contract: contractAddress,
              balance: '0',
              lastUpdatedAtMs: Date.now(),
            };
          }
        });

      const result = { id, chainId, chainType, address, balances: allBalances };
      return result;
    });

  if (isUpdateSpecificAddress) {
    const updatedCW20Balances = upsertList(stored, results, isSameUpsertItem, (e, i) => (e.balances = i.balances));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-cw20`>>({ [`${id}-balance-cw20`]: updatedCW20Balances });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-cw20`>>({ [`${id}-balance-cw20`]: results });
  }
}

async function customCw20Balance(id: string, { address, chainId }: BalanceFetchOption = {}) {
  const allAccountAddress = await getAllAccountAddress(id);

  const allChain = await getAllChains();

  const allCosmosChains = allChain.filter((chain) => chain.chainType === 'cosmos');

  const { customCw20Assets } = await getAssets();
  const stored = (await getExtensionLocalStorage(`${id}-balance-cw20`)) || [];

  const cosmosChainsWithCosmwasm = allCosmosChains.filter((chain) => chain.isCosmwasm);

  const isUpdateSpecificAddress = !!address && !!chainId;

  const addressList = isUpdateSpecificAddress
    ? allAccountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId && isEqualsIgnoringCase(addr.address, address))
    : allAccountAddress;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = cosmosChainsWithCosmwasm.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const { lcdUrls } = chain;
      const assets = customCw20Assets.filter((asset) => asset.chainType === addr.chainType && asset.chainId === addr.chainId && asset.type === 'cw20');

      const { results: allBalances } = await PromisePool.withConcurrency(5)
        .for(assets)
        .process(async (asset) => {
          const { id: contractAddress } = asset;

          try {
            const balance = await fetchCW20Balances(address, contractAddress, lcdUrls.map((item) => item.url).filter(Boolean));

            const result = { contract: contractAddress, balance, lastUpdatedAtMs: Date.now() };

            return result;
          } catch {
            const target = stored.find((store) => store.chainId === chainId && store.chainType === chainType && isEqualsIgnoringCase(store.address, address));
            const realTarget = target?.balances.find((storedItem) => isEqualsIgnoringCase(storedItem.contract, asset.id));

            if (realTarget) {
              if (!realTarget.lastUpdatedAtMs) {
                return {
                  ...realTarget,
                  lastUpdatedAtMs: Date.now(),
                };
              }

              return realTarget;
            }

            return {
              contract: contractAddress,
              balance: '0',
              lastUpdatedAtMs: Date.now(),
            };
          }
        });

      const result = { id, chainId, chainType, address, balances: allBalances };
      return result;
    });

  if (isUpdateSpecificAddress) {
    const updatedCustomCW20Balances = upsertList(stored, results, isSameUpsertItem, (e, i) => (e.balances = i.balances));

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-cw20`>>({ [`${id}-custom-balance-cw20`]: updatedCustomCW20Balances });
  } else {
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-cw20`>>({ [`${id}-custom-balance-cw20`]: results });
  }
}
