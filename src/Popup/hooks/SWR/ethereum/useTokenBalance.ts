import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';

import { ERC20_ABI } from '~/constants/abi';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import type { EthereumToken } from '~/types/chain';
import type { ERC20ContractBalanceOfPayload, ERC20ContractMethods } from '~/types/ethereum/contract';

import { useCurrentAccount } from '../../useCurrent/useCurrentAccount';
import { useCurrentChain } from '../../useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '../../useCurrent/useCurrentEthereumNetwork';
import { useAccounts } from '../cache/useAccounts';

type FetcherParams = {
  rpcURL: string;
  tokenAddress: string;
  address: string;
};

export function useTokenBalance(token: EthereumToken, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();
  const accounts = useAccounts(true);
  const { currentNetwork } = useCurrentEthereumNetwork();

  const { currentAccount } = useCurrentAccount();

  const address = accounts.data?.find((account) => account.id === currentAccount.id)?.address[currentChain.id] || '';

  const fetcher = (params: FetcherParams) => {
    const web3 = new Web3(params.rpcURL);

    const contract = new web3.eth.Contract(ERC20_ABI as AbiItem[], params.tokenAddress);
    const methods = contract.methods as ERC20ContractMethods;
    return methods.balanceOf(params.address).call() as Promise<ERC20ContractBalanceOfPayload>;
  };

  const { data, error, mutate } = useSWR<ERC20ContractBalanceOfPayload, AxiosError>(
    { rpcURL: currentNetwork.rpcURL, tokenAddress: token.address, address },
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 14000,
      refreshInterval: 15000,
      errorRetryCount: 0,
      isPaused: () => currentChain.id !== ETHEREUM.id || !address || !token.address,
      ...config,
    },
  );

  return { data, error, mutate };
}
