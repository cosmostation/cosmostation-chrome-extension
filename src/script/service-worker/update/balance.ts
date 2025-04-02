import axios from 'axios';
import { Contract, ethers } from 'ethers';
import { MulticallWrapper } from 'ethers-multicall-provider';
import { PromisePool } from '@supercharge/promise-pool';

import { BALANCE_FETCH_TIME_OUT_MS } from '@/constants/common';
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
  AccountAddressBalanceSui,
} from '@/types/account';
import type { AptosResourceResponse } from '@/types/aptos/api';
import type { AccountDetail } from '@/types/bitcoin/balance';
import type { ChainType } from '@/types/chain';
import type { CosmosBalance, CosmosBalanceResponse, CosmosCw20BalanceResponse } from '@/types/cosmos/api';
import type { EvmRpcGetBalanceResponse } from '@/types/evm/api';
import type { ExtensionStorage } from '@/types/extension';
import type { SuiRpcGetBalanceResponse } from '@/types/sui/api';
import { isEqualsIgnoringCase } from '@/utils/string';

const defaultCosmosCoinList = [{ id: 'uatom', chainId: 'cosmos', chainType: 'cosmos' }];
const defaultEvmCoinList = [{ id: NATIVE_EVM_COIN_ADDRESS, chainId: 'ethereum', chainType: 'evm' }];
const defaultBitcoinCoinList = [{ id: 'btc', chainId: 'bitcoin', chainType: 'bitcoin' }];

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
    console.timeEnd(`balance-${id}`);
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

export async function updateBalance(id: string) {
  console.time(`update-balance-${id}`);
  try {
    await getAccount(id);

    await Promise.all([
      cosmosBalances(id),
      evmBalances(id),
      aptosBalances(id),
      suiBalances(id),
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

async function cosmosBalances(id: string, { isMinimal = false } = {}) {
  const address = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  const addressList = isMinimal
    ? address.filter((addr) => defaultCosmosCoinList.some((chain) => chain.chainId === addr.chainId && chain.chainType === addr.chainType))
    : address;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = cosmosChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(10)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const urlPath = `/cosmos/bank/v1beta1/balances/${address}`;
      const urlQuery = 'pagination.limit=10000';

      const { lcdUrls } = chain;

      let nextKey: string | null = null;

      const responseBalances: CosmosBalance[][] = [];

      const promises = lcdUrls.map(async (lcdUrl) => {
        const url = lcdUrl.url.endsWith('/') ? lcdUrl.url.slice(0, -1) : lcdUrl.url;
        const requestUrl = `${url}${urlPath}?${urlQuery}`;

        const response = await axios.get<CosmosBalanceResponse>(requestUrl, {
          timeout: BALANCE_FETCH_TIME_OUT_MS,
        });

        return response.data;
      });

      const response = await Promise.any(promises);

      nextKey = response?.pagination?.next_key ?? null;

      responseBalances.push(response?.balances ?? []);

      while (nextKey) {
        const nextPromises = lcdUrls.map(async (lcdUrl) => {
          const url = lcdUrl.url.endsWith('/') ? lcdUrl.url.slice(0, -1) : lcdUrl.url;
          const requestUrl = `${url}${urlPath}?${urlQuery}&pagination.key=${nextKey}`;

          const response = await axios.get<CosmosBalanceResponse>(requestUrl, {
            timeout: BALANCE_FETCH_TIME_OUT_MS,
          });

          return response.data;
        });
        const nextResponse = await Promise.any(nextPromises);

        responseBalances.push(nextResponse?.balances ?? []);
        nextKey = nextResponse?.pagination?.next_key ?? null;
      }

      const balances = responseBalances.flat();

      const result: AccountAddressBalanceCosmos = { id, chainId, chainType, address, balances };

      return result;
    });

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-cosmos`>>({ [`${id}-balance-cosmos`]: results });
}

async function customCosmosBalances(id: string) {
  const address = await getCustomAccountAddress(id);
  const addedCustomChains = await getAddedCustomChains();

  const addressWithChain = address
    .map((addr) => {
      const addedCosmosCustomChains = addedCustomChains.filter((chain) => chain.chainType === 'cosmos');
      const chain = addedCosmosCustomChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(10)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;
      const urlPath = `/cosmos/bank/v1beta1/balances/${address}`;
      const urlQuery = 'pagination.limit=10000';

      const { lcdUrls } = chain;

      let nextKey: string | null = null;

      const responseBalances: CosmosBalance[][] = [];

      const promises = lcdUrls.map(async (lcdUrl) => {
        const url = lcdUrl.url.endsWith('/') ? lcdUrl.url.slice(0, -1) : lcdUrl.url;
        const requestUrl = `${url}${urlPath}?${urlQuery}`;

        const response = await axios.get<CosmosBalanceResponse>(requestUrl, {
          timeout: BALANCE_FETCH_TIME_OUT_MS,
        });

        return response.data;
      });

      const response = await Promise.any(promises);

      nextKey = response?.pagination?.next_key ?? null;

      responseBalances.push(response?.balances ?? []);

      while (nextKey) {
        const nextPromises = lcdUrls.map(async (lcdUrl) => {
          const url = lcdUrl.url.endsWith('/') ? lcdUrl.url.slice(0, -1) : lcdUrl.url;
          const requestUrl = `${url}${urlPath}?${urlQuery}&pagination.key=${nextKey}`;

          const response = await axios.get<CosmosBalanceResponse>(requestUrl, {
            timeout: BALANCE_FETCH_TIME_OUT_MS,
          });

          return response.data;
        });
        const nextResponse = await Promise.any(nextPromises);

        responseBalances.push(nextResponse?.balances ?? []);
        nextKey = nextResponse?.pagination?.next_key ?? null;
      }

      const balances = responseBalances.flat();

      const result: AccountAddressBalanceCosmos = { id, chainId, chainType, address, balances };

      return result;
    });

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-cosmos`>>({ [`${id}-custom-balance-cosmos`]: results });
}

async function evmBalances(id: string, { isMinimal = false } = {}) {
  const address = await getAccountAddress(id);
  const { evmChains } = await getChains();

  const addressList = isMinimal
    ? address.filter((addr) => defaultEvmCoinList.find((chain) => chain.chainId === addr.chainId && chain.chainType === addr.chainType))
    : address;

  const addressWithChain = addressList
    .map((addr) => {
      const chain = evmChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(10)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      const body = {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      };

      const promises = rpcUrls.map(async (rpcUrl) => {
        const url = rpcUrl.url;

        const response = await axios.post<EvmRpcGetBalanceResponse>(url, body, {
          timeout: BALANCE_FETCH_TIME_OUT_MS,
        });

        return response.data;
      });

      const response = await Promise.any(promises);

      const balance = response?.result ?? '0x0';

      const result: AccountAddressBalanceEvm = { id, chainId, chainType, address, balance };

      return result;
    });

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-evm`>>({ [`${id}-balance-evm`]: results });
}

async function customEvmBalances(id: string) {
  const address = await getCustomAccountAddress(id);
  const addedCustomChains = await getAddedCustomChains();

  const addressWithChain = address
    .map((addr) => {
      const addedEVMCustomChains = addedCustomChains.filter((chain) => chain.chainType === 'evm');
      const chain = addedEVMCustomChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;

      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(10)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      const body = {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      };

      const promises = rpcUrls.map(async (rpcUrl) => {
        const url = rpcUrl.url;

        const response = await axios.post<EvmRpcGetBalanceResponse>(url, body, {
          timeout: BALANCE_FETCH_TIME_OUT_MS,
        });

        return response.data;
      });

      const response = await Promise.any(promises);

      const balance = response?.result ?? '0x0';

      const result: AccountAddressBalanceEvm = { id, chainId, chainType, address, balance };

      return result;
    });

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-evm`>>({ [`${id}-custom-balance-evm`]: results });
}

async function bitcoinBalances(id: string) {
  const address = await getAccountAddress(id);
  const { bitcoinChains } = await getChains();

  const addressWithChain = address

    .map((addr) => {
      const chain = bitcoinChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(10)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { mempoolURL } = chain;

      const url = `${mempoolURL}/address/${address}`;

      const response = await axios.get<AccountDetail>(url, {
        timeout: BALANCE_FETCH_TIME_OUT_MS,
      });

      const balance = {
        chainStats: response.data?.chain_stats || undefined,
        mempoolStats: response.data?.mempool_stats || undefined,
      };

      const result: AccountAddressBalanceBitcoin = { id, chainId, chainType, address, balance };

      return result;
    });

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-bitcoin`>>({ [`${id}-balance-bitcoin`]: results });
}

async function aptosBalances(id: string) {
  const address = await getAccountAddress(id);
  const { aptosChains } = await getChains();

  const addressWithChain = address
    .map((addr) => {
      const chain = aptosChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(10)
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

      const response = await Promise.any(promises);

      const balances = response.filter((resource) => resource.type?.startsWith('0x1::coin::CoinStore'));

      const result: AccountAddressBalanceAptos = { id, chainId, chainType, address, balances };

      return result;
    });

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-aptos`>>({ [`${id}-balance-aptos`]: results });
}

async function suiBalances(id: string) {
  const address = await getAccountAddress(id);
  const { suiChains } = await getChains();

  const addressWithChain = address
    .map((addr) => {
      const chain = suiChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    .filter((addr) => addr.chain);

  const { results } = await PromisePool.withConcurrency(10)
    .for(addressWithChain)
    .process(async (addr) => {
      const { chainId, chainType, address, chain } = addr;

      const { rpcUrls } = chain;

      const body = {
        jsonrpc: '2.0',
        method: 'suix_getAllBalances',
        params: [address],
        id: 1,
      };

      const promises = rpcUrls.map(async (rpcUrl) => {
        const url = rpcUrl.url;

        const response = await axios.post<SuiRpcGetBalanceResponse>(url, body, {
          timeout: BALANCE_FETCH_TIME_OUT_MS,
        });

        return response.data;
      });

      const response = await Promise.any(promises);

      const balances = response?.result ?? [];

      const result: AccountAddressBalanceSui = { id, chainId, chainType, address, balances };

      return result;
    });

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-sui`>>({ [`${id}-balance-sui`]: results });
}

const ERC20_TOTAL_SUPPLY = 'function totalSupply() view returns (uint256)';
const ERC20_DECIMALS = 'function decimals() view returns (uint8)';
const ERC20_SYMBOL = 'function symbol() view returns (string)';
const ERC20_NAME = 'function name() view returns (string)';
const ERC20_BALANCE_OF = 'function balanceOf(address account) view returns (uint256)';

const ERC20_READ_ABI = [ERC20_TOTAL_SUPPLY, ERC20_DECIMALS, ERC20_SYMBOL, ERC20_NAME, ERC20_BALANCE_OF];

async function erc20Balance(id: string) {
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

  const addressWithChain = accountAddress
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
        const providers = rpcUrls.map((rpcUrl) => {
          const provider = new ethers.JsonRpcProvider(rpcUrl.url);

          provider._getConnection().timeout = BALANCE_FETCH_TIME_OUT_MS;

          return MulticallWrapper.wrap(provider);
        });

        const allBalances = await Promise.any(
          providers.map(async (provider) => {
            const tokenContracts = assets.map((asset) => {
              return {
                contractAddress: asset.id,
                erc20ContractInstance: new Contract(asset.id, ERC20_READ_ABI, provider),
              };
            });

            const settledTokenBalances = await Promise.allSettled(
              tokenContracts.map(async ({ contractAddress, erc20ContractInstance }) => {
                const response: bigint = await erc20ContractInstance.balanceOf(address);

                const balance = response.toString();

                const result = { contract: contractAddress, balance };

                return result;
              }),
            );

            const filteredAllBalances = settledTokenBalances
              .map((balance) => {
                if (balance.status === 'fulfilled') {
                  return balance.value;
                } else {
                  return undefined;
                }
              })
              .filter((item) => !!item);

            if (filteredAllBalances.length === 0) {
              throw new Error('No balance');
            }

            return filteredAllBalances;
          }),
        );

        const balances = allBalances.filter((balance) => balance.balance !== '0');

        providers.forEach((provider) => provider.destroy());

        const result = { id, chainId, chainType, address, balances };

        return result;
      } else {
        const providers = rpcUrls.map((rpcUrl) => {
          const provider = new ethers.JsonRpcProvider(rpcUrl.url, undefined, {
            batchMaxCount: 1,
            polling: false,
            staticNetwork: true,
          });

          provider._getConnection().timeout = BALANCE_FETCH_TIME_OUT_MS;

          return provider;
        });

        const { results: allBalances } = await PromisePool.withConcurrency(10)
          .for(assets)
          .process(async (asset) => {
            const { id: contractAddress } = asset;
            const promises = providers.map(async (provider) => {
              const contract = new Contract(contractAddress, ERC20_READ_ABI, provider);
              const response: bigint = await contract.balanceOf(address);

              const balance = response.toString();
              return balance;
            });

            const balance = await Promise.any(promises);

            const result = { contract: contractAddress, balance };

            return result;
          });

        providers.forEach((provider) => provider.destroy());

        const balances = allBalances.filter((balance) => balance.balance !== '0');

        const result = { id, chainId, chainType, address, balances };
        return result;
      }
    });

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-erc20`>>({ [`${id}-balance-erc20`]: results });
}

async function customErc20Balance(id: string) {
  const allAccountAddress = await getAllAccountAddress(id);

  const allChain = await getAllChains();

  const allEVMChains = allChain.filter((chain) => chain.chainType === 'evm');

  const { customErc20Assets } = await getAssets();

  const addressWithChain = allAccountAddress
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
        const providers = rpcUrls.map((rpcUrl) => {
          const provider = new ethers.JsonRpcProvider(rpcUrl.url, undefined, {
            batchMaxCount: 1,
            polling: false,
            staticNetwork: true,
          });

          provider._getConnection().timeout = BALANCE_FETCH_TIME_OUT_MS;

          return MulticallWrapper.wrap(provider);
        });

        const allBalances = await Promise.any(
          providers.map(async (provider) => {
            const tokenContracts = assets.map((asset) => {
              return {
                contractAddress: asset.id,
                erc20ContractInstance: new Contract(asset.id, ERC20_READ_ABI, provider),
              };
            });

            const settledTokenBalances = await Promise.allSettled(
              tokenContracts.map(async ({ contractAddress, erc20ContractInstance }) => {
                const response: bigint = await erc20ContractInstance.balanceOf(address);

                const balance = response.toString();

                const result = { contract: contractAddress, balance };

                return result;
              }),
            );

            const filteredAllBalances = settledTokenBalances
              .map((balance) => {
                if (balance.status === 'fulfilled') {
                  return balance.value;
                } else {
                  return undefined;
                }
              })
              .filter((item) => !!item);

            if (filteredAllBalances.length === 0) {
              throw new Error('No balance');
            }

            return filteredAllBalances;
          }),
        );

        const balances = allBalances.filter((balance) => balance.balance !== '0');

        providers.forEach((provider) => provider.destroy());

        const result = { id, chainId, chainType, address, balances };
        return result;
      } else {
        const providers = rpcUrls.map((rpcUrl) => {
          const provider = new ethers.JsonRpcProvider(rpcUrl.url, undefined, {
            batchMaxCount: 1,
            polling: false,
            staticNetwork: true,
          });

          provider._getConnection().timeout = BALANCE_FETCH_TIME_OUT_MS;

          return provider;
        });

        const { results: allBalances } = await PromisePool.withConcurrency(10)
          .for(assets)
          .process(async (asset) => {
            const { id: contractAddress } = asset;
            const promises = providers.map(async (provider) => {
              const contract = new Contract(contractAddress, ERC20_READ_ABI, provider);
              const response: bigint = await contract.balanceOf(address);

              const balance = response.toString();
              return balance;
            });

            const balance = await Promise.any(promises);

            const result = { contract: contractAddress, balance };

            return result;
          });

        providers.forEach((provider) => provider.destroy());

        const balances = allBalances.filter((balance) => balance.balance !== '0');

        const result = { id, chainId, chainType, address, balances };
        return result;
      }
    });

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-erc20`>>({ [`${id}-custom-balance-erc20`]: results });
}

async function cw20Balance(id: string) {
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

  const addressWithChain = accountAddress
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

      const { results: allBalances } = await PromisePool.withConcurrency(10)
        .for(assets)
        .process(async (asset) => {
          const { id: contractAddress } = asset;
          const promises = lcdUrls.map(async (lcdUrl) => {
            const url = lcdUrl.url.endsWith('/') ? lcdUrl.url.slice(0, -1) : lcdUrl.url;
            const urlPath = `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${btoa(`{"balance":{"address":"${address}"}}`)}`;
            const requestUrl = `${url}${urlPath}`;

            const response = await axios.get<CosmosCw20BalanceResponse>(requestUrl, {
              timeout: BALANCE_FETCH_TIME_OUT_MS,
            });

            return response.data?.data?.balance ?? '0';
          });

          const balance = await Promise.any(promises);

          const result = { contract: contractAddress, balance };

          return result;
        });

      const balances = allBalances.filter((balance) => balance.balance !== '0');

      const result = { id, chainId, chainType, address, balances };
      return result;
    });

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-cw20`>>({ [`${id}-balance-cw20`]: results });
}

async function customCw20Balance(id: string) {
  const allAccountAddress = await getAllAccountAddress(id);

  const allChain = await getAllChains();

  const allCosmosChains = allChain.filter((chain) => chain.chainType === 'cosmos');

  const { customCw20Assets } = await getAssets();

  const cosmosChainsWithCosmwasm = allCosmosChains.filter((chain) => chain.isCosmwasm);

  const addressWithChain = allAccountAddress
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

      const { results: allBalances } = await PromisePool.withConcurrency(10)
        .for(assets)
        .process(async (asset) => {
          const { id: contractAddress } = asset;
          const promises = lcdUrls.map(async (lcdUrl) => {
            const url = lcdUrl.url.endsWith('/') ? lcdUrl.url.slice(0, -1) : lcdUrl.url;
            const urlPath = `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${btoa(`{"balance":{"address":"${address}"}}`)}`;
            const requestUrl = `${url}${urlPath}`;

            const response = await axios.get<CosmosCw20BalanceResponse>(requestUrl, {
              timeout: BALANCE_FETCH_TIME_OUT_MS,
            });

            return response.data?.data?.balance ?? '0';
          });

          const balance = await Promise.any(promises);

          const result = { contract: contractAddress, balance };

          return result;
        });

      const balances = allBalances.filter((balance) => balance.balance !== '0');

      const result = { id, chainId, chainType, address, balances };
      return result;
    });

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-custom-balance-cw20`>>({ [`${id}-custom-balance-cw20`]: results });
}
