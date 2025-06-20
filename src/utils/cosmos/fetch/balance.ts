import axios from 'axios';
import { Contract, ethers } from 'ethers';
import { MulticallWrapper } from 'ethers-multicall-provider';

import { BALANCE_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { CosmosBalance, CosmosBalanceResponse, CosmosCw20BalanceResponse } from '@/types/cosmos/api';
import type { EvmRpcGetBalanceResponse } from '@/types/evm/api';
import { fetchWithFailover } from '@/utils/fetch/fetchWithFailover';
import { removeTrailingSlash } from '@/utils/string';

export const fetchCosmosBalances = async (
  address: string,
  lcdUrls: string[],
  option?: {
    path: string;
  },
): Promise<CosmosBalance[]> => {
  return await fetchWithFailover(lcdUrls, async (lcdUrl) => {
    let nextKey: string | null = null;
    const responseBalances: CosmosBalance[][] = [];

    const base = removeTrailingSlash(lcdUrl);
    const urlPath = option?.path || `/cosmos/bank/v1beta1/balances/${address}`;
    const urlQuery = 'pagination.limit=10000';
    const requestUrl = `${base}${urlPath}?${urlQuery}`;

    const response = await axios.get<CosmosBalanceResponse>(requestUrl, {
      timeout: BALANCE_FETCH_TIME_OUT_MS,
      headers: {
        Cosmostation: `extension/${__APP_VERSION__}`,
      },
    });

    const initialResponse = response.data;

    nextKey = initialResponse?.pagination?.next_key ?? null;
    responseBalances.push(initialResponse?.balances ?? []);

    while (nextKey) {
      try {
        const paginatedRequestUrl = `${requestUrl}&pagination.key=${nextKey}`;

        const paginatedResponse = await axios.get<CosmosBalanceResponse>(paginatedRequestUrl, {
          timeout: BALANCE_FETCH_TIME_OUT_MS,
          headers: {
            Cosmostation: `extension/${__APP_VERSION__}`,
          },
        });

        const paginatedData = paginatedResponse.data;

        nextKey = paginatedData?.pagination?.next_key ?? null;
        responseBalances.push(paginatedData?.balances ?? []);
      } catch {
        nextKey = null;
      }
    }

    const balances = responseBalances.flat();
    return balances;
  });
};

export const fetchCoreumSpendableBalances = async (address: string, lcdUrls: string[]): Promise<CosmosBalance[]> => {
  return await fetchCosmosBalances(address, lcdUrls, {
    path: `/cosmos/bank/v1beta1/spendable_balances/${address}`,
  });
};

export const fetchCW20Balances = async (address: string, contractAddress: string, lcdUrls: string[]): Promise<string> => {
  return await fetchWithFailover(lcdUrls, async (lcdUrl) => {
    const base = removeTrailingSlash(lcdUrl);
    const urlPath = `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${btoa(`{"balance":{"address":"${address}"}}`)}`;
    const requestUrl = `${base}${urlPath}`;

    const response = await axios.get<CosmosCw20BalanceResponse>(requestUrl, {
      timeout: BALANCE_FETCH_TIME_OUT_MS,
      headers: {
        Cosmostation: `extension/${__APP_VERSION__}`,
      },
    });

    return response.data?.data?.balance ?? '0';
  });
};

export const fetchEVMBalances = async (address: string, rpcUrls: string[]): Promise<string> => {
  return await fetchWithFailover(rpcUrls, async (rpcUrl) => {
    const body = {
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1,
    };

    const baseRpcUrl = removeTrailingSlash(rpcUrl);
    const response = await axios.post<EvmRpcGetBalanceResponse>(baseRpcUrl, body, {
      timeout: BALANCE_FETCH_TIME_OUT_MS,
    });

    if (response.data.error) {
      throw new Error(`[RPC Error] URL: ${baseRpcUrl}, Method: ${body.method}, Message: ${response.data.error?.message}`);
    }

    const balance = response.data?.result ?? '0x0';

    return balance;
  });
};

const ERC20_TOTAL_SUPPLY = 'function totalSupply() view returns (uint256)';
const ERC20_DECIMALS = 'function decimals() view returns (uint8)';
const ERC20_SYMBOL = 'function symbol() view returns (string)';
const ERC20_NAME = 'function name() view returns (string)';
const ERC20_BALANCE_OF = 'function balanceOf(address account) view returns (uint256)';

const ERC20_READ_ABI = [ERC20_TOTAL_SUPPLY, ERC20_DECIMALS, ERC20_SYMBOL, ERC20_NAME, ERC20_BALANCE_OF];

export const fetchERC20Balances = async (address: string, contractAddress: string, rpcUrls: string[]): Promise<string> => {
  return await fetchWithFailover(rpcUrls, async (rpcUrl) => {
    const baseRpcUrl = removeTrailingSlash(rpcUrl);
    const provider = new ethers.JsonRpcProvider(baseRpcUrl, undefined, {
      batchMaxCount: 1,
      polling: false,
      staticNetwork: true,
    });

    provider._getConnection().timeout = BALANCE_FETCH_TIME_OUT_MS;

    try {
      const contract = new Contract(contractAddress, ERC20_READ_ABI, provider);
      const response: bigint = await contract.balanceOf(address);

      const balance = response.toString();

      return balance;
    } finally {
      provider.destroy();
    }
  });
};

export const fetchMultiERC20Balances = async (
  address: string,
  contractAddresses: string[],
  rpcUrls: string[],
): Promise<
  {
    contract: string;
    balance: string;
  }[]
> => {
  return await fetchWithFailover(rpcUrls, async (rpcUrl) => {
    const baseRpcUrl = removeTrailingSlash(rpcUrl);
    const provider = new ethers.JsonRpcProvider(baseRpcUrl, undefined, {
      polling: false,
      staticNetwork: true,
    });

    provider._getConnection().timeout = BALANCE_FETCH_TIME_OUT_MS;

    const multicallProvider = MulticallWrapper.wrap(provider);

    try {
      const tokenContracts = contractAddresses.map((contractAddress) => {
        return {
          contractAddress,
          erc20ContractInstance: new Contract(contractAddress, ERC20_READ_ABI, multicallProvider),
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
    } finally {
      multicallProvider.destroy();
    }
  });
};
