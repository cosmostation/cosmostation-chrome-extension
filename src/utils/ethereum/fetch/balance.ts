import { Contract, ethers, Network } from 'ethers';
import { MulticallWrapper } from 'ethers-multicall-provider';

import { BALANCE_FETCH_TIME_OUT_MS } from '@/constants/common';
import type { EthersProviderParam, EvmRpcGetBalanceResponse } from '@/types/evm/api';
import type { Erc20Balance } from '@/types/evm/balance';
import { postWithFullResponse } from '@/utils/axios';
import { fetchWithFailover, fetchWithFailoverEVM } from '@/utils/fetch/fetchWithFailover';

export const fetchEVMBalances = async (address: string, rpcUrls: string[]): Promise<string> => {
  return await fetchWithFailover(rpcUrls, async (rpcUrl) => {
    const body = {
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1,
    };

    const baseRpcUrl = rpcUrl;
    const response = await postWithFullResponse<EvmRpcGetBalanceResponse>(baseRpcUrl, body, {
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

export const fetchERC20Balances = async (address: string, contractAddress: string, params: EthersProviderParam[]): Promise<string> => {
  return await fetchWithFailoverEVM(params, async (param) => {
    const { rpcUrl, networkName, chainId } = param;

    const network = new Network(networkName, chainId);
    const provider = new ethers.JsonRpcProvider(rpcUrl, network, {
      batchMaxCount: 1,
      polling: false,
      staticNetwork: network,
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
  params: EthersProviderParam[],
  multicallWrapperOption?: {
    maxMulticallDataLength: number;
  },
): Promise<Erc20Balance[]> => {
  const { maxMulticallDataLength } = multicallWrapperOption || {};

  return await fetchWithFailoverEVM(params, async (param) => {
    const { rpcUrl, networkName, chainId } = param;
    const network = new Network(networkName, chainId);
    const provider = new ethers.JsonRpcProvider(rpcUrl, network, {
      polling: false,
      staticNetwork: network,
    });

    provider._getConnection().timeout = BALANCE_FETCH_TIME_OUT_MS;

    const multicallProvider = MulticallWrapper.wrap(provider, maxMulticallDataLength);

    try {
      const tokenContracts = contractAddresses.map((contractAddress) => {
        return {
          contractAddress,
          erc20ContractInstance: new Contract(contractAddress, ERC20_READ_ABI, multicallProvider),
        };
      });

      const tokensBalances = await Promise.all(
        tokenContracts.map(async ({ contractAddress, erc20ContractInstance }) => {
          try {
            const response: bigint = await erc20ContractInstance.balanceOf(address);

            const balance = response.toString();

            const result: Erc20Balance = { contract: contractAddress, balance, status: 'success' };

            return result;
          } catch {
            const result: Erc20Balance = { contract: contractAddress, balance: '0', status: 'error' };

            return result;
          }
        }),
      );

      return tokensBalances;
    } finally {
      multicallProvider.destroy();
    }
  });
};
