import PromisePool from '@supercharge/promise-pool';

import { chainToDeploymentMap } from '@/constants/evm/mutlicall3';
import { getAccountAddress, getAllAccountAddress } from '@/libs/account';
import { getAssets } from '@/libs/asset';
import type { AccountAddressBalanceErc20 } from '@/types/account';
import type { ChainId } from '@/types/chain';
import type { Cw20Balance } from '@/types/cosmos/balance';
import type { Erc20Balance } from '@/types/evm/balance';
import type { ExtensionStorage } from '@/types/extension';
import type { BalanceFetchOption } from '@/types/message/service-worker/updateRequest';
import { chunkArray } from '@/utils/array';
import { upsertCW20Balance, upsertERC20Balance } from '@/utils/balanceUpsert';
import { createChainMap, createCosmwasmChainMap } from '@/utils/cache/chainMap';
import { createHiddenAssetIdSet } from '@/utils/cache/hiddenAssetIdMap';
import { fetchCW20Balances, fetchERC20Balances, fetchMultiERC20Balances } from '@/utils/cosmos/fetch/balance';
import { getCoinId, getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';

const CHAIN_MULTICALL_CONFIGS: Record<ChainId['id'], { maxMulticallDataLength: number }> = {
  evmos: {
    maxMulticallDataLength: 500,
  },
};

export async function cw20Balance(id: string, { chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const hiddenAssetIdSet = await createHiddenAssetIdSet(id);

  const { cw20Assets } = await getAssets();

  const cw20AssetsWithoutHidden = cw20Assets.filter((asset) => {
    const isAssetVisible = !hiddenAssetIdSet?.has(getCoinId(asset));
    const isPreload = asset.wallet_preload;

    return isAssetVisible || isPreload;
  });

  const cosmwasmChainMapInstance = await createCosmwasmChainMap();

  if (priority) {
    const cw20BalanceData = (await getExtensionLocalStorage(`${id}-balance-cw20`)) || [];

    const balanceChainIds = new Set(
      cw20BalanceData
        .filter((data) => {
          const hasBalance = data.balances.length > 0;
          return priority === 'high' ? hasBalance : !hasBalance;
        })
        .map((item) => getUniqueChainIdWithManual(String(item.chainId), item.chainType)),
    );

    return accountAddress
      .map((address) => {
        const uniqueId = getUniqueChainIdWithManual(address.chainId, address.chainType);

        if (balanceChainIds?.has(uniqueId)) {
          const chain = cosmwasmChainMapInstance.get(uniqueId);

          return chain ? { ...address, chain } : null;
        }
        return null;
      })
      .filter((item) => !!item);
  }

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const targetChain = chainId && cosmwasmChainMapInstance.get(chainId);

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || cosmwasmChainMapInstance.get(getUniqueChainIdWithManual(addr.chainId, addr.chainType));
      return chain ? { ...addr, chain } : null;
    })
    .filter((item) => !!item);

  let stored = (await getExtensionLocalStorage(`${id}-balance-cw20`)) || [];

  const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

  for (const chunk of chunks) {
    const { results } = await PromisePool.withConcurrency(5)
      .for(chunk)
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

    stored = upsertCW20Balance(stored, results);

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-cw20`>>({ [`${id}-balance-cw20`]: stored });

    updateAssets?.();
  }
}

export async function erc20Balance(id: string, { chainId, priority, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const accountAddress = await getAccountAddress(id);
  const hiddenAssetIdSet = await createHiddenAssetIdSet(id);

  const chainMapInstance = await createChainMap('evm');
  const { erc20Assets } = await getAssets();

  const erc20AssetsToDisplay = erc20Assets.filter((asset) => {
    const isAssetVisible = !hiddenAssetIdSet?.has(getCoinId(asset));
    const isPreload = asset.wallet_preload;

    return isAssetVisible || isPreload;
  });

  const isUpdateSpecificAddress = !!chainId;

  if (priority) {
    const erc20BalanceData = (await getExtensionLocalStorage(`${id}-balance-erc20`)) || [];

    const balanceChainIds = new Set(
      erc20BalanceData
        .filter((data) => {
          const hasBalance = data.balances.length > 0;
          return priority === 'high' ? hasBalance : !hasBalance;
        })
        .map((item) => getUniqueChainIdWithManual(String(item.chainId), item.chainType)),
    );

    return accountAddress
      .map((address) => {
        const uniqueId = getUniqueChainIdWithManual(address.chainId, address.chainType);

        if (balanceChainIds?.has(uniqueId)) {
          const chain = chainMapInstance?.get(uniqueId);

          return chain ? { ...address, chain } : null;
        }
        return null;
      })
      .filter((item) => !!item);
  }

  const addressList = isUpdateSpecificAddress
    ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : accountAddress;

  const targetChain = chainId && chainMapInstance?.get(chainId);

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || chainMapInstance?.get(getUniqueChainIdWithManual(addr.chainId, addr.chainType));
      return chain ? { ...addr, chain } : null;
    })
    .filter((item) => !!item);

  let stored = (await getExtensionLocalStorage(`${id}-balance-erc20`)) || [];

  const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

  for (const chunk of chunks) {
    const { results } = await PromisePool.withConcurrency(5)
      .for(chunk)
      .process(async (addr) => {
        const { chainId, chainType, address, chain } = addr;
        const { rpcUrls, chainId: networkId, name: networkName, id } = chain;

        const assets = erc20AssetsToDisplay.filter((asset) => asset.chainType === addr.chainType && asset.chainId === addr.chainId && asset.type === 'erc20');

        const chainIdDecimal = parseInt(networkId, 16);
        const isMulticallEnabled = chainToDeploymentMap.get(chainIdDecimal);
        if (isMulticallEnabled) {
          try {
            const multicallWrapperOption = CHAIN_MULTICALL_CONFIGS[id];

            const allBalances = await fetchMultiERC20Balances(
              address,
              assets.map((item) => item.id),
              rpcUrls
                .map((item) => {
                  if (!item.url) return undefined;

                  return {
                    networkName: networkName,
                    chainId: networkId,
                    rpcUrl: item.url,
                  };
                })
                .filter((item) => !!item),
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
                const balance = await fetchERC20Balances(
                  address,
                  contractAddress,
                  rpcUrls
                    .map((item) => {
                      if (!item.url) return undefined;

                      return {
                        networkName: networkName,
                        chainId: networkId,
                        rpcUrl: item.url,
                      };
                    })
                    .filter((item) => !!item),
                );

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

    stored = upsertERC20Balance(stored, results);

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-erc20`>>({ [`${id}-balance-erc20`]: stored });

    updateAssets?.();
  }
}

export async function customErc20Balance(id: string, { chainId, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const allAccountAddress = await getAllAccountAddress(id);

  const chainMapInstance = await createChainMap('evm');

  const { customErc20Assets } = await getAssets();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? allAccountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : allAccountAddress;

  const targetChain = chainId && chainMapInstance?.get(chainId);

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || chainMapInstance?.get(getUniqueChainIdWithManual(addr.chainId, addr.chainType));
      return chain ? { ...addr, chain } : null;
    })
    .filter((item) => !!item);

  let stored = (await getExtensionLocalStorage(`${id}-custom-balance-erc20`)) || [];

  const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

  for (const chunk of chunks) {
    const { results } = await PromisePool.withConcurrency(5)
      .for(chunk)
      .process(async (addr) => {
        const { chainId, chainType, address, chain } = addr;
        const { rpcUrls, chainId: networkId, name: networkName } = chain;

        const assets = customErc20Assets.filter((asset) => asset.chainType === addr.chainType && asset.chainId === addr.chainId && asset.type === 'erc20');

        const chainIdDecimal = parseInt(networkId, 16);

        const isMulticallEnabled = chainToDeploymentMap.get(chainIdDecimal);
        if (isMulticallEnabled) {
          try {
            const multicallWrapperOption = CHAIN_MULTICALL_CONFIGS[id];

            const allBalances = await fetchMultiERC20Balances(
              address,
              assets.map((item) => item.id),
              rpcUrls
                .map((item) => {
                  if (!item.url) return undefined;

                  return {
                    networkName: networkName,
                    chainId: networkId,
                    rpcUrl: item.url,
                  };
                })
                .filter((item) => !!item),
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
                const balance = await fetchERC20Balances(
                  address,
                  contractAddress,
                  rpcUrls
                    .map((item) => {
                      if (!item.url) return undefined;

                      return {
                        networkName: networkName,
                        chainId: networkId,
                        rpcUrl: item.url,
                      };
                    })
                    .filter((item) => !!item),
                );

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

    stored = upsertERC20Balance(stored, results);

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-erc20`>>({ [`${id}-custom-balance-erc20`]: stored });

    updateAssets?.();
  }
}

export async function customCw20Balance(id: string, { chainId, updateAssets, chunkSize }: BalanceFetchOption = {}) {
  const startUpdateTime = Date.now();

  const allAccountAddress = await getAllAccountAddress(id);

  const cosmwasmChainMapInstance = await createCosmwasmChainMap();

  const { customCw20Assets } = await getAssets();

  const isUpdateSpecificAddress = !!chainId;

  const addressList = isUpdateSpecificAddress
    ? allAccountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
    : allAccountAddress;

  const targetChain = chainId && cosmwasmChainMapInstance.get(chainId);

  const addressWithChain = addressList
    .map((addr) => {
      const chain = targetChain || cosmwasmChainMapInstance.get(getUniqueChainIdWithManual(addr.chainId, addr.chainType));
      return chain ? { ...addr, chain } : null;
    })
    .filter((item) => !!item);

  let stored = (await getExtensionLocalStorage(`${id}-custom-balance-cw20`)) || [];

  const chunks = chunkSize ? chunkArray(addressWithChain, chunkSize) : [addressWithChain];

  for (const chunk of chunks) {
    const { results } = await PromisePool.withConcurrency(5)
      .for(chunk)
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

    stored = upsertCW20Balance(stored, results);

    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-cw20`>>({ [`${id}-custom-balance-cw20`]: stored });

    updateAssets?.();
  }
}
