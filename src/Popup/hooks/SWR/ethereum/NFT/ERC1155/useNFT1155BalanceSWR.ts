import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';

import { ERC1155_ABI } from '~/constants/abi';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import type { EthereumNetwork } from '~/types/chain';
import type { ERC1155BalanceOfPayload, ERC1155ContractMethods } from '~/types/ethereum/contract';

import { useCurrentAccount } from '../../../../useCurrent/useCurrentAccount';
import { useCurrentChain } from '../../../../useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '../../../../useCurrent/useCurrentEthereumNetwork';
import { useAccounts } from '../../../cache/useAccounts';

type FetcherParams = {
  rpcURL: string;
  contractAddress: string;
  tokenId: string;
  ownerAddress: string;
};

type UseNFT1155BalanceSWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
  ownerAddress?: string;
  tokenId?: string;
};

export function useNFT1155BalanceSWR({ network, contractAddress, ownerAddress, tokenId }: UseNFT1155BalanceSWR, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();
  const accounts = useAccounts(config?.suspense);
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { currentAccount } = useCurrentAccount();

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[currentChain.id] || '',
    [accounts?.data, currentAccount.id, currentChain.id],
  );

  const addr = useMemo(() => ownerAddress || currentAddress, [ownerAddress, currentAddress]);

  const rpcURL = network?.rpcURL || currentEthereumNetwork.rpcURL;

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

    const contract = new web3.eth.Contract(ERC1155_ABI as AbiItem[], params.contractAddress);

    const methods = contract.methods as ERC1155ContractMethods;

    return methods.balanceOf(params.ownerAddress, params.tokenId).call() as Promise<ERC1155BalanceOfPayload>;
  };

  const { data, error, mutate } = useSWR<ERC1155BalanceOfPayload, AxiosError>({ rpcURL, contractAddress, ownerAddress: addr, tokenId }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => currentChain.id !== ETHEREUM.id || !addr || !contractAddress || !tokenId || !rpcURL,
    ...config,
  });

  return { data, error, mutate };
}
