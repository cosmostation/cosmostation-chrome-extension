import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';

import { ERC20_ABI } from '~/constants/abi';
import type { ERC20ContractBalanceOfPayload, ERC20ContractMethods } from '~/types/ethereum/contract';
import type { IntegratedSwapEVMChain, IntegratedSwapToken } from '~/types/swap/asset';

import { useCurrentAccount } from '../../useCurrent/useCurrentAccount';
import { useAccounts } from '../cache/useAccounts';

type FetcherParams = {
  rpcURL: string;
  tokenAddress: string;
  address: string;
};

export function useTokenBalanceSWR(currentEthereumNetwork?: IntegratedSwapEVMChain, token?: IntegratedSwapToken, config?: SWRConfiguration) {
  const accounts = useAccounts(config?.suspense);
  const { currentAccount } = useCurrentAccount();

  const address = accounts.data?.find((account) => account.id === currentAccount.id)?.address[currentEthereumNetwork?.addressId || ''] || '';

  const fetcher = (params: FetcherParams) => {
    const provider = new Web3.providers.HttpProvider(params.rpcURL, {
      headers: [
        {
          name: 'Cosmostation',
          value: `extension/${String(process.env.VERSION)}`,
        },
      ],
    });
    const web3 = new Web3(provider);

    const contract = new web3.eth.Contract(ERC20_ABI as AbiItem[], params.tokenAddress);
    const methods = contract.methods as ERC20ContractMethods;
    return methods.balanceOf(params.address).call() as Promise<ERC20ContractBalanceOfPayload>;
  };

  const { data, error, mutate } = useSWR<ERC20ContractBalanceOfPayload, AxiosError>(
    { rpcURL: currentEthereumNetwork ? currentEthereumNetwork.rpcURL : '', tokenAddress: token?.address, address },
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 14000,
      refreshInterval: 15000,
      errorRetryCount: 0,
      isPaused: () => !currentEthereumNetwork || !token?.address || !address,
      ...config,
    },
  );

  return { data, error, mutate };
}