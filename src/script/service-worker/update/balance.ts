import axios from 'axios';
import { Contract, ethers } from 'ethers';
import { PromisePool } from '@supercharge/promise-pool';

import { getAccount, getAccountAddress } from '@/libs/account';
import { getAccountAssets, getAssets, getHiddenAssets } from '@/libs/asset';
import { getChains } from '@/libs/chain';
import type { AccountAddressBalanceAptos, AccountAddressBalanceCosmos, AccountAddressBalanceEvm, AccountAddressBalanceSui } from '@/types/account';
import type { AptosResourceResponse } from '@/types/aptos/api';
import type { CosmosBalance, CosmosBalanceResponse, CosmosCw20BalanceResponse } from '@/types/cosmos/api';
import type { EvmRpcGetBalanceResponse } from '@/types/evm/api';
import type { ExtensionStorage } from '@/types/extension';
import type { SuiRpcGetBalanceResponse } from '@/types/sui/api';

export async function balance(id: string) {
  console.time(`balance-${id}`);
  try {
    // NOTE 선언 이유? account가 정상적으로 저장, 불러오기 되는지 확인하기 위해?
    await getAccount(id);
    // TODO 디폴트 토큰만 냅두고 나머지를 히든 토큰에 밀어넣는 로직만 있으면 될듯
    await initAssests(id);

    // TODO init 밸런스 페칭에서는 타잉아웃 (2초 지나면 요청 취소) 설정이 필요할듯. // 궁극적으로 타임아웃은 있어도 좋을듯.
    await Promise.all([cosmosBalances(id), evmBalances(id), aptosBalances(id), suiBalances(id), erc20Balance(id), cw20Balance(id)]);
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

export async function initAccount(id: string) {
  await getAccount(id);
  const { initAccountIds } = await chrome.storage.local.get<ExtensionStorage>('initAccountIds');

  if (!initAccountIds?.includes(id)) {
    const { aptosAccountAssets, cosmosAccountAssets, cw20AccountAssets, erc20AccountAssets, evmAccountAssets, suiAccountAssets } = await getAccountAssets(id);

    const hiddenAssetIds = [
      ...aptosAccountAssets,
      ...cosmosAccountAssets,
      ...cw20AccountAssets,
      ...erc20AccountAssets,
      ...evmAccountAssets,
      ...suiAccountAssets,
    ]
      // TODO 앞단에서 히든에셋 로직을 따로 넣어놨으니 여기에서는 처리 안해줘도 될듯?
      .filter((asset) => asset.balance === '0')
      .map((asset) => {
        return { id: asset.asset.id, chainId: asset.asset.chainId, chainType: asset.asset.chainType };
      });

    if (initAccountIds?.length > 0) {
      await chrome.storage.local.set<Pick<ExtensionStorage, 'initAccountIds'>>({ initAccountIds: [...initAccountIds, id] });
    } else {
      await chrome.storage.local.set<Pick<ExtensionStorage, 'initAccountIds'>>({ initAccountIds: [id] });
    }

    // NOTE 이 로직을 살리면 히든처리가 2번 들어가는 거임
    // NOTE 1. preload기준
    // NOTE 히든처리 제외 나머지 전체 밸런스 페칭 후 밸런스 0인 애들 히든 처리.
    await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-hidden-assetIds`>>({ [`${id}-hidden-assetIds`]: hiddenAssetIds });
  }
}

// NOTE 기본 코인 및 디폴트 토큰(erc20. cw20의 preload만)만 냅두고 나머지는 히든처리작업
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

async function cosmosBalances(id: string) {
  const address = await getAccountAddress(id);
  const { cosmosChains } = await getChains();

  // NOTE 랩핑된 코스모스 체인 정보, 주소정보
  const addressWithChain = address
    .map((addr) => {
      const chain = cosmosChains.find((chain) => chain.chainType === addr.chainType && chain.id === addr.chainId)!;
      return { ...addr, chain };
    })
    // NOTE 코스모스 체인만 필터링해서 쓸 수 있도록
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

        const response = await axios.get<CosmosBalanceResponse>(requestUrl);

        return response.data;
      });

      const response = await Promise.any(promises);

      nextKey = response?.pagination?.next_key ?? null;

      responseBalances.push(response?.balances ?? []);

      while (nextKey) {
        const nextPromises = lcdUrls.map(async (lcdUrl) => {
          const url = lcdUrl.url.endsWith('/') ? lcdUrl.url.slice(0, -1) : lcdUrl.url;
          const requestUrl = `${url}${urlPath}?${urlQuery}&pagination.key=${nextKey}`;

          const response = await axios.get<CosmosBalanceResponse>(requestUrl);

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

async function evmBalances(id: string) {
  const address = await getAccountAddress(id);
  const { evmChains } = await getChains();

  const addressWithChain = address
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

        const response = await axios.post<EvmRpcGetBalanceResponse>(url, body);

        return response.data;
      });

      const response = await Promise.any(promises);

      const balance = response?.result ?? '0x0';

      const result: AccountAddressBalanceEvm = { id, chainId, chainType, address, balance };

      return result;
    });

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-evm`>>({ [`${id}-balance-evm`]: results });
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

        const response = await axios.get<AptosResourceResponse[]>(requestUrl);

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

        const response = await axios.post<SuiRpcGetBalanceResponse>(url, body);

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

  const erc20AssetsWithoutHidden = erc20Assets.filter(
    (asset) =>
      !hiddenAssets.find((hiddenAsset) => hiddenAsset.id === asset.id && hiddenAsset.chainId === asset.chainId && hiddenAsset.chainType === asset.chainType),
  );

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
      const assets = erc20AssetsWithoutHidden.filter((asset) => asset.chainType === addr.chainType && asset.chainId === addr.chainId && asset.type === 'erc20');

      const providers = rpcUrls.map(
        (rpcUrl) =>
          new ethers.JsonRpcProvider(rpcUrl.url, undefined, {
            batchMaxCount: 1,
            polling: false,
            staticNetwork: true,
          }),
      );

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
    });

  await chrome.storage.local.set<Pick<ExtensionStorage, `${string}-balance-erc20`>>({ [`${id}-balance-erc20`]: results });
}

async function cw20Balance(id: string) {
  const accountAddress = await getAccountAddress(id);
  const hiddenAssets = await getHiddenAssets(id);
  const { cosmosChains } = await getChains();
  const { cw20Assets } = await getAssets();

  const cw20AssetsWithoutHidden = cw20Assets.filter(
    (asset) =>
      !hiddenAssets.find((hiddenAsset) => hiddenAsset.id === asset.id && hiddenAsset.chainId === asset.chainId && hiddenAsset.chainType === asset.chainType),
  );

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

            const response = await axios.get<CosmosCw20BalanceResponse>(requestUrl);

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
