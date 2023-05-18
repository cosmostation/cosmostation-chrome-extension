import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';

import { ERC721_ABI } from '~/constants/abi';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import type { EthereumNetwork } from '~/types/chain';
import type { ERC721BalanceOfPayload, ERC721ContractMethods } from '~/types/ethereum/contract';

import { useCurrentChain } from '../../../../useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '../../../../useCurrent/useCurrentEthereumNetwork';

type FetcherParams = {
  rpcURL: string;
  contractAddress: string;
  ownerAddress: string;
};

type UseNFT721BalanceSWR = {
  network?: EthereumNetwork;
  ownerAddress?: string;
  contractAddress?: string;
};

export function useNFT721BalanceSWR({ network, contractAddress, ownerAddress }: UseNFT721BalanceSWR, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

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

    const contract = new web3.eth.Contract(ERC721_ABI as AbiItem[], params.contractAddress);

    const methods = contract.methods as ERC721ContractMethods;

    return methods.balanceOf(params.ownerAddress).call() as Promise<ERC721BalanceOfPayload>;
  };

  const { data, error, mutate } = useSWR<ERC721BalanceOfPayload, AxiosError>({ rpcURL, contractAddress, ownerAddress }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => currentChain.id !== ETHEREUM.id || !contractAddress || !ownerAddress || !rpcURL,
    ...config,
  });

  return { data, error, mutate };
}
