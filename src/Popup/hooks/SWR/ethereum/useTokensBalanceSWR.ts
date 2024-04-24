import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';

import { ERC20_ABI } from '~/constants/abi';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import type { EthereumNetwork, EthereumToken } from '~/types/chain';
import type { ERC20ContractBalancesOfPayload, ERC20ContractMethods } from '~/types/ethereum/contract';

import { useCurrentAccount } from '../../useCurrent/useCurrentAccount';
import { useCurrentChain } from '../../useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '../../useCurrent/useCurrentEthereumNetwork';
import { useAccounts } from '../cache/useAccounts';

type FetcherParams = {
  rpcURL: string;
  tokenAddress: string;
  address: string;
};

type MultiFetcherParams = {
  fetcherParamsList: FetcherParams[];
};

type UseTokensBalanceSWR = {
  network?: EthereumNetwork;
  tokens?: Omit<EthereumToken, 'id' | 'ethereumNetworkId' | 'tokenType'>[] | null;
};

export function useTokensBalanceSWR({ network, tokens }: UseTokensBalanceSWR, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();
  const accounts = useAccounts(config?.suspense);
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { currentAccount } = useCurrentAccount();

  const address = accounts.data?.find((account) => account.id === currentAccount.id)?.address[currentChain.id] || '';

  const rpcURL = network?.rpcURL || currentEthereumNetwork.rpcURL;

  const fetcherParamsList: FetcherParams[] = useMemo(
    () =>
      tokens?.map((item) => ({
        rpcURL,
        tokenAddress: item.address,
        address,
      })) || [],
    [address, rpcURL, tokens],
  );

  const fetcher = async (params: FetcherParams) => {
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
    const balance = (await methods.balanceOf(params.address).call()) as string;
    return {
      id: params.tokenAddress,
      balance,
    };
  };

  const multiFetcher = (params: MultiFetcherParams) => Promise.allSettled(params.fetcherParamsList.map((item) => fetcher(item)));

  const { data, error, mutate } = useSWR<PromiseSettledResult<ERC20ContractBalancesOfPayload>[], AxiosError>({ fetcherParamsList }, multiFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => currentChain.id !== ETHEREUM.id || !address || !tokens || !rpcURL,
    ...config,
  });

  return { data, error, mutate };
}
