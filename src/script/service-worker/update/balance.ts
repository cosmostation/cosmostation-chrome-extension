import axios from 'axios';
import { PromisePool } from '@supercharge/promise-pool';

import { BALANCE_FETCH_TIME_OUT_MS } from '@/constants/common';
import { COREUM_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import { chainToDeploymentMap } from '@/constants/evm/mutlicall3';
import { getAccount, getAccountAddress, getAllAccountAddress, getCustomAccountAddress } from '@/libs/account';
import { getAccountAssets, getAssets, getHiddenAssets } from '@/libs/asset';
import { getAddedCustomChains, getAllChains, getChains } from '@/libs/chain';
import type {
  AccountAddressBalanceAptosV2,
  AccountAddressBalanceBitcoin,
  AccountAddressBalanceCosmos,
  AccountAddressBalanceErc20,
  AccountAddressBalanceEvm,
  AccountAddressBalanceIota,
  AccountAddressBalanceSolana,
  AccountAddressBalanceSplToken,
  AccountAddressBalanceSui,
  AccountAddressLockedBalanceCosmos,
} from '@/types/account';
import type { AssetId } from '@/types/asset';
import type { AccountDetail } from '@/types/bitcoin/balance';
import type { ChainId, ChainType, UniqueChainId } from '@/types/chain';
import type { Cw20Balance } from '@/types/cosmos/balance';
import type { Erc20Balance } from '@/types/evm/balance';
import type { ExtensionStorage } from '@/types/extension';
import type { SplTokenBalance } from '@/types/solana/api';
import { fetchAptosBalances } from '@/utils/aptos/fetch/balance';
import {
  upsertAptosBalance,
  upsertBitcoinBalance,
  upsertCosmosBalance,
  upsertCW20Balance,
  upsertERC20Balance,
  upsertEVMBalance,
  upsertIotaBalance,
  upsertSolanaBalance,
  upsertSplTokenBalance,
  upsertSuiBalance,
} from '@/utils/balanceUpsert';
import {
  fetchCoreumSpendableBalances,
  fetchCosmosBalances,
  fetchCW20Balances,
  fetchERC20Balances,
  fetchEVMBalances,
  fetchMultiERC20Balances,
  fetchSolanaBalances,
  fetchSolanaSplTokenBalances,
} from '@/utils/cosmos/fetch/balance';
import { fetchIotaBalances } from '@/utils/iota/fetch/balance';
import { minus } from '@/utils/numbers';
import { getUniqueChainIdWithManual, isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { fetchSuiBalances } from '@/utils/sui/fetch/balance';

export interface BalanceFetchOption {
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
const defaultSolanaCoinList = [{ id: 'sol', chainId: 'solana', chainType: 'solana' }];

const defaultCoinList = [...defaultCosmosCoinList, ...defaultEvmCoinList, ...defaultBitcoinCoinList, ...defaultSolanaCoinList];

const CHAIN_MULTICALL_CONFIGS: Record<
  ChainId['id'],
  {
    maxMulticallDataLength: number;
  }
> = {
  evmos: {
    maxMulticallDataLength: 500,
  },
};

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

export async function updateSpecificChainBalance(id: string, chainId: UniqueChainId) {
  console.time(`chain-balance-${id}-${chainId}`);
  try {
    await getAccount(id);

    await fetchChainBalanceByType(id, chainId);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${error.request?.method} ${error.request?.url} ${error.cause?.message}`);
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
    if (chainType === 'solana') {
      await Promise.all([solanaBalances(id, { chainId }), splTokenBalance(id, { chainId })]);
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
      solanaBalances(id),
      erc20Balance(id),
      cw20Balance(id),
      splTokenBalance(id),
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
    const { cw20AccountAssets, erc20AccountAssets, spltokenAccountAssets } = await getAccountAssets(id);

    const mergedAccountAssets = [...cw20AccountAssets, ...erc20AccountAssets, ...spltokenAccountAssets];

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
    const { cw20AccountAssets, erc20AccountAssets, spltokenAccountAssets } = await getAccountAssets(id);

    const mergedAccountAssets = [...cw20AccountAssets, ...erc20AccountAssets, ...spltokenAccountAssets];

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
    const { cw20Assets, erc20Assets, spltokenAssets } = await getAssets();

    const nonPreloadedERC20Tokens = erc20Assets.filter((asset) => !asset.wallet_preload);
    const nonPreloadedCW20Assets = cw20Assets.filter((asset) => !asset.wallet_preload);
    const nonPreloadedSPLTokenAssets = spltokenAssets.filter((asset) => !asset.wallet_preload);

    const hiddenAssetIds = [...nonPreloadedERC20Tokens, ...nonPreloadedCW20Assets, ...nonPreloadedSPLTokenAssets].map((asset) => {
      return { id: asset.id, chainId: asset.chainId, chainType: asset.chainType };
    });

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-hidden-assetIds`>>({ [`${id}-hidden-assetIds`]: hiddenAssetIds });
  }
}

async function cosmosBalances(id: string, { isMinimal = false, chainId }: CosmosBalancesOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isMinimal
    ? accountAddress.filter((addr) => defaultCosmosCoinList.some((chain) => chain.chainId === addr.chainId && chain.chainType === addr.chainType))
    : isUpdateSpecificAddress
      ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
      : accountAddress;

  const targetChain = chainId && cosmosChains.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || cosmosChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
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

            const result: AccountAddressBalanceCosmos = {
              id,
              chainId,
              chainType,
              address,
              balances: spendableBalances,
              lastUpdatedAtMs: startUpdateTime,
              status: 'success',
            };

            return result;
          } catch {
            await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-locked-cosmos`>>({ [`${id}-locked-cosmos`]: [] });

            const result: AccountAddressBalanceCosmos = { id, chainId, chainType, address, balances, lastUpdatedAtMs: startUpdateTime, status: 'error' };
            return result;
          }
        }

        const result: AccountAddressBalanceCosmos = { id, chainId, chainType, address, balances, lastUpdatedAtMs: startUpdateTime, status: 'success' };

        return result;
      } catch {
        const result: AccountAddressBalanceCosmos = { id, chainId, chainType, address, balances: [], lastUpdatedAtMs: startUpdateTime, status: 'error' };

        return result;
      }
    });

  const stored = (await getExtensionLocalStorage(`${id}-balance-cosmos`)) || [];

  const updatedCosmosBalance = upsertCosmosBalance(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-cosmos`>>({ [`${id}-balance-cosmos`]: updatedCosmosBalance });
}

async function customCosmosBalances(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const customAccountAddress = await getCustomAccountAddress(id);
  const addedCustomChains = await getAddedCustomChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? customAccountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : customAccountAddress;

  const addedCosmosCustomChains = addedCustomChains.filter((chain) => chain.chainType === 'cosmos');

  const targetChain = chainId && addedCosmosCustomChains.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || addedCosmosCustomChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
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

        const result: AccountAddressBalanceCosmos = { id, chainId, chainType, address, balances, lastUpdatedAtMs: startUpdateTime, status: 'success' };

        return result;
      } catch {
        const result: AccountAddressBalanceCosmos = { id, chainId, chainType, address, balances: [], lastUpdatedAtMs: startUpdateTime, status: 'error' };

        return result;
      }
    });

  const stored = (await getExtensionLocalStorage(`${id}-custom-balance-cosmos`)) || [];

  const updatedCustomCosmosBalance = upsertCosmosBalance(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-cosmos`>>({ [`${id}-custom-balance-cosmos`]: updatedCustomCosmosBalance });
}

async function evmBalances(id: string, { isMinimal = false, chainId }: EVMBalancesOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const { evmChains } = await getChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isMinimal
    ? accountAddress.filter((addr) => defaultEvmCoinList.find((chain) => chain.chainId === addr.chainId && chain.chainType === addr.chainType))
    : isUpdateSpecificAddress
      ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
      : accountAddress;

  const targetChain = chainId && evmChains.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || evmChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
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

        const result: AccountAddressBalanceEvm = { id, chainId, chainType, address, balance, lastUpdatedAtMs: startUpdateTime, status: 'success' };

        return result;
      } catch {
        const result: AccountAddressBalanceEvm = { id, chainId, chainType, address, balance: '0x0', lastUpdatedAtMs: startUpdateTime, status: 'error' };

        return result;
      }
    });

  const stored = (await getExtensionLocalStorage(`${id}-balance-evm`)) || [];

  const updatedEVMBalance = upsertEVMBalance(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-evm`>>({ [`${id}-balance-evm`]: updatedEVMBalance });
}

async function customEvmBalances(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const customAccountAddress = await getCustomAccountAddress(id);
  const addedCustomChains = await getAddedCustomChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? customAccountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : customAccountAddress;

  const addedEVMCustomChains = addedCustomChains.filter((chain) => chain.chainType === 'evm');

  const targetChain = chainId && addedEVMCustomChains.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || addedEVMCustomChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;

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

        const result: AccountAddressBalanceEvm = { id, chainId, chainType, address, balance, lastUpdatedAtMs: startUpdateTime, status: 'success' };

        return result;
      } catch {
        const result: AccountAddressBalanceEvm = { id, chainId, chainType, address, balance: '0x0', lastUpdatedAtMs: startUpdateTime, status: 'error' };

        return result;
      }
    });

  const stored = (await getExtensionLocalStorage(`${id}-custom-balance-evm`)) || [];

  const updatedCustomEVMBalance = upsertEVMBalance(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-evm`>>({ [`${id}-custom-balance-evm`]: updatedCustomEVMBalance });
}

async function bitcoinBalances(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const { bitcoinChains } = await getChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const targetChain = chainId && bitcoinChains.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || bitcoinChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
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

        const result: AccountAddressBalanceBitcoin = { id, chainId, chainType, address, balance, lastUpdatedAtMs: startUpdateTime, status: 'success' };

        return result;
      } catch {
        const result: AccountAddressBalanceBitcoin = {
          id,
          chainId,
          chainType,
          address,
          balance: {
            chainStats: undefined,
            mempoolStats: undefined,
          },
          lastUpdatedAtMs: startUpdateTime,
          status: 'error',
        };

        return result;
      }
    });

  const stored = (await getExtensionLocalStorage(`${id}-balance-bitcoin`)) || [];

  const updatedBitcoinBalances = upsertBitcoinBalance(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-bitcoin`>>({ [`${id}-balance-bitcoin`]: updatedBitcoinBalances });
}

async function aptosBalances(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const { aptosChains } = await getChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const targetChain = chainId && aptosChains.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || aptosChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address } = addr;

      try {
        const balances = await fetchAptosBalances(address);

        const result: AccountAddressBalanceAptosV2 = { id, chainId, chainType, address, balances, lastUpdatedAtMs: startUpdateTime, status: 'success' };

        return result;
      } catch {
        const result: AccountAddressBalanceAptosV2 = { id, chainId, chainType, address, balances: [], lastUpdatedAtMs: startUpdateTime, status: 'error' };

        return result;
      }
    });

  const stored = (await getExtensionLocalStorage(`${id}-balance-aptos-v2`)) || [];

  const updatedAptosBalances = upsertAptosBalance(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-aptos-v2`>>({ [`${id}-balance-aptos-v2`]: updatedAptosBalances });
}

async function suiBalances(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const { suiChains } = await getChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const targetChain = chainId && suiChains.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || suiChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
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

        const result: AccountAddressBalanceSui = { id, chainId, chainType, address, balances, lastUpdatedAtMs: startUpdateTime, status: 'success' };

        return result;
      } catch {
        const result: AccountAddressBalanceSui = { id, chainId, chainType, address, balances: [], lastUpdatedAtMs: startUpdateTime, status: 'error' };

        return result;
      }
    });

  const stored = (await getExtensionLocalStorage(`${id}-balance-sui`)) || [];

  const updatedSuiBalances = upsertSuiBalance(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-sui`>>({ [`${id}-balance-sui`]: updatedSuiBalances });
}

async function iotaBalances(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const { iotaChains } = await getChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const targetChain = chainId && iotaChains.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || iotaChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
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

        const result: AccountAddressBalanceIota = { id, chainId, chainType, address, balances, lastUpdatedAtMs: startUpdateTime, status: 'success' };

        return result;
      } catch {
        const result: AccountAddressBalanceIota = { id, chainId, chainType, address, balances: [], lastUpdatedAtMs: startUpdateTime, status: 'error' };

        return result;
      }
    });

  const stored = (await getExtensionLocalStorage(`${id}-balance-iota`)) || [];

  const updatedIotaBalances = upsertIotaBalance(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-iota`>>({ [`${id}-balance-iota`]: updatedIotaBalances });
}

async function solanaBalances(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const { solanaChains } = await getChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const targetChain = chainId && solanaChains.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || solanaChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(10)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      try {
        const balance = await fetchSolanaBalances(
          address,
          rpcUrls.map((item) => item.url),
        );

        const result: AccountAddressBalanceSolana = {
          id,
          chainId,
          chainType,
          address,
          balance: balance.value,
          lastUpdatedAtMs: startUpdateTime,
          status: 'success',
        };

        return result;
      } catch {
        const result: AccountAddressBalanceSolana = { id, chainId, chainType, address, balance: 0, lastUpdatedAtMs: startUpdateTime, status: 'error' };

        return result;
      }
    });

  const stored = (await getExtensionLocalStorage(`${id}-balance-solana`)) || [];

  const updatedSolanaBalances = upsertSolanaBalance(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-solana`>>({ [`${id}-balance-solana`]: updatedSolanaBalances });
}

async function erc20Balance(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const hiddenAssets = await getHiddenAssets(id);
  const { evmChains } = await getChains();
  const { erc20Assets } = await getAssets();

  const erc20AssetsToDisplay = erc20Assets.filter((asset) => {
    const isAssetVisible = !hiddenAssets.find(
      (hiddenAsset) => hiddenAsset.id === asset.id && hiddenAsset.chainId === asset.chainId && hiddenAsset.chainType === asset.chainType,
    );
    const isPreload = asset.wallet_preload;

    return isAssetVisible || isPreload;
  });

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const targetChain = chainId && evmChains.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || evmChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const { rpcUrls, id } = chain;
      const assets = erc20AssetsToDisplay.filter((asset) => asset.chainType === addr.chainType && asset.chainId === addr.chainId && asset.type === 'erc20');

      const chainIdDecimal = parseInt(chain.chainId, 16);
      const isMulticallEnabled = chainToDeploymentMap.get(chainIdDecimal);
      if (isMulticallEnabled) {
        try {
          const multicallWrapperOption = CHAIN_MULTICALL_CONFIGS[id];

          const allBalances = await fetchMultiERC20Balances(
            address,
            assets.map((item) => item.id),
            rpcUrls.map((item) => item.url).filter(Boolean),
            multicallWrapperOption,
          );

          const balances: Erc20Balance[] = allBalances.map((item) => {
            return {
              ...item,
              lastUpdatedAtMs: startUpdateTime,
            };
          });

          const result: AccountAddressBalanceErc20 = { id, chainId, chainType, address, balances };

          return result;
        } catch {
          const defaultAssets: Erc20Balance[] = assets.map((item) => ({
            contract: item.id,
            balance: '0',
            lastUpdatedAtMs: startUpdateTime,
            status: 'error',
          }));

          const result: AccountAddressBalanceErc20 = { id, chainId, chainType, address, balances: defaultAssets };

          return result;
        }
      } else {
        const { results: allBalances } = await PromisePool.withConcurrency(5)
          .for(assets)
          .process(async (asset) => {
            const { id: contractAddress } = asset;

            try {
              const balance = await fetchERC20Balances(address, contractAddress, rpcUrls.map((item) => item.url).filter(Boolean));

              const result: Erc20Balance = { contract: contractAddress, balance, lastUpdatedAtMs: startUpdateTime, status: 'success' };

              return result;
            } catch {
              return {
                contract: contractAddress,
                balance: '0',
                lastUpdatedAtMs: startUpdateTime,
                status: 'error',
              } as Erc20Balance;
            }
          });

        const result: AccountAddressBalanceErc20 = { id, chainId, chainType, address, balances: allBalances };
        return result;
      }
    });

  const stored = (await getExtensionLocalStorage(`${id}-balance-erc20`)) || [];

  const updatedERC20Balances = upsertERC20Balance(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-erc20`>>({ [`${id}-balance-erc20`]: updatedERC20Balances });
}

async function customErc20Balance(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const allAccountAddress = await getAllAccountAddress(id);

  const allChain = await getAllChains();

  const allEVMChains = allChain.filter((chain) => chain.chainType === 'evm');

  const { customErc20Assets } = await getAssets();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? allAccountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : allAccountAddress;

  const targetChain = chainId && allEVMChains.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || allEVMChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(5)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const { rpcUrls } = chain;
      const assets = customErc20Assets.filter((asset) => asset.chainType === addr.chainType && asset.chainId === addr.chainId && asset.type === 'erc20');

      const chainIdDecimal = parseInt(chain.chainId, 16);

      const isMulticallEnabled = chainToDeploymentMap.get(chainIdDecimal);
      if (isMulticallEnabled) {
        try {
          const multicallWrapperOption = CHAIN_MULTICALL_CONFIGS[id];

          const allBalances = await fetchMultiERC20Balances(
            address,
            assets.map((item) => item.id),
            rpcUrls.map((item) => item.url).filter(Boolean),
            multicallWrapperOption,
          );

          const balances: Erc20Balance[] = allBalances.map((item) => {
            return {
              ...item,
              lastUpdatedAtMs: startUpdateTime,
            };
          });

          const result: AccountAddressBalanceErc20 = { id, chainId, chainType, address, balances };
          return result;
        } catch {
          const defaultAssets: Erc20Balance[] = assets.map((item) => ({
            contract: item.id,
            balance: '0',
            lastUpdatedAtMs: startUpdateTime,
            status: 'error',
          }));

          const result: AccountAddressBalanceErc20 = { id, chainId, chainType, address, balances: defaultAssets };

          return result;
        }
      } else {
        const { results: allBalances } = await PromisePool.withConcurrency(5)
          .for(assets)
          .process(async (asset) => {
            const { id: contractAddress } = asset;

            try {
              const balance = await fetchERC20Balances(address, contractAddress, rpcUrls.map((item) => item.url).filter(Boolean));

              const result: Erc20Balance = { contract: contractAddress, balance, lastUpdatedAtMs: startUpdateTime, status: 'success' };

              return result;
            } catch {
              return {
                contract: asset.id,
                balance: '0',
                lastUpdatedAtMs: startUpdateTime,
                status: 'error',
              } as Erc20Balance;
            }
          });

        const result: AccountAddressBalanceErc20 = { id, chainId, chainType, address, balances: allBalances };
        return result;
      }
    });

  const stored = (await getExtensionLocalStorage(`${id}-custom-balance-erc20`)) || [];

  const updatedCustomERC20Balances = upsertERC20Balance(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-erc20`>>({ [`${id}-custom-balance-erc20`]: updatedCustomERC20Balances });
}

async function cw20Balance(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const hiddenAssets = await getHiddenAssets(id);
  const { cosmosChains } = await getChains();
  const { cw20Assets } = await getAssets();

  const cw20AssetsWithoutHidden = cw20Assets.filter((asset) => {
    const isAssetVisible = !hiddenAssets.find(
      (hiddenAsset) => hiddenAsset.id === asset.id && hiddenAsset.chainId === asset.chainId && hiddenAsset.chainType === asset.chainType,
    );
    const isPreload = asset.wallet_preload;

    return isAssetVisible || isPreload;
  });

  const cosmosChainsWithCosmwasm = cosmosChains.filter((chain) => chain.isCosmwasm);

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const targetChain = chainId && cosmosChainsWithCosmwasm.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || cosmosChainsWithCosmwasm.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
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

            const result: Cw20Balance = { contract: contractAddress, balance, lastUpdatedAtMs: startUpdateTime, status: 'success' };

            return result;
          } catch {
            return {
              contract: contractAddress,
              balance: '0',
              lastUpdatedAtMs: startUpdateTime,
              status: 'error',
            } as Cw20Balance;
          }
        });

      const result = { id, chainId, chainType, address, balances: allBalances };
      return result;
    });

  const stored = (await getExtensionLocalStorage(`${id}-balance-cw20`)) || [];

  const updatedCW20Balances = upsertCW20Balance(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-cw20`>>({ [`${id}-balance-cw20`]: updatedCW20Balances });
}

async function customCw20Balance(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const allAccountAddress = await getAllAccountAddress(id);

  const allChain = await getAllChains();

  const allCosmosChains = allChain.filter((chain) => chain.chainType === 'cosmos');

  const { customCw20Assets } = await getAssets();

  const cosmosChainsWithCosmwasm = allCosmosChains.filter((chain) => chain.isCosmwasm);

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? allAccountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : allAccountAddress;

  const targetChain = chainId && cosmosChainsWithCosmwasm.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || cosmosChainsWithCosmwasm.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
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

            const result: Cw20Balance = { contract: contractAddress, balance, lastUpdatedAtMs: startUpdateTime, status: 'success' };

            return result;
          } catch {
            return {
              contract: contractAddress,
              balance: '0',
              lastUpdatedAtMs: startUpdateTime,
              status: 'error',
            } as Cw20Balance;
          }
        });

      const result = { id, chainId, chainType, address, balances: allBalances };
      return result;
    });

  const stored = (await getExtensionLocalStorage(`${id}-custom-balance-cw20`)) || [];

  const updatedCustomCW20Balances = upsertCW20Balance(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-cw20`>>({ [`${id}-custom-balance-cw20`]: updatedCustomCW20Balances });
}

async function splTokenBalance(id: string, { chainId }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const { solanaChains } = await getChains();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const targetChain = chainId && solanaChains.find((chain) => isMatchingUniqueChainId(chain, chainId));

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || solanaChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(10)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls, programId } = chain;

      try {
        const balance = await fetchSolanaSplTokenBalances(address, programId.splToken, rpcUrls.map((item) => item.url).filter(Boolean));

        const balances: SplTokenBalance[] = balance.value.map((item) => {
          return { ...item, lastUpdatedAtMs: startUpdateTime, status: 'success' };
        });
        const result: AccountAddressBalanceSplToken = { id, chainId, chainType, address, balances: balances };

        return result;
      } catch {
        const result: AccountAddressBalanceSplToken = { id, chainId, chainType, address, balances: [] };

        return result;
      }
    });

  const stored = (await getExtensionLocalStorage(`${id}-balance-spltoken`)) || [];

  const updatedSplTokenBalances = upsertSplTokenBalance(stored, results);

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-spltoken`>>({ [`${id}-balance-spltoken`]: updatedSplTokenBalances });
}
