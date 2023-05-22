import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';

import { ERC721_ABI } from '~/constants/abi';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import type { EthereumNetwork } from '~/types/chain';
import type { ERC721ContractMethods, ERC721TokenOfOwnerByIndexPayload } from '~/types/ethereum/contract';

import { useCurrentChain } from '../../../../useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '../../../../useCurrent/useCurrentEthereumNetwork';

type FetcherParams = {
  rpcURL: string;
  contractAddress: string;
  ownerAddress: string;
  quantity: number;
};

type UseNFT721TokenOfOwnerByIndexSWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
  ownerAddress?: string;
  quantity?: number;
};

export function useNFT721TokenOfOwnerByIndexSWR(
  { network, contractAddress, ownerAddress, quantity }: UseNFT721TokenOfOwnerByIndexSWR,
  config?: SWRConfiguration,
) {
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
    // NOTE need more research for errors
    return methods.tokenOfOwnerByIndex(params.ownerAddress, String(params.quantity)).call() as Promise<ERC721TokenOfOwnerByIndexPayload>;
  };

  const { data, error, mutate } = useSWR<ERC721TokenOfOwnerByIndexPayload, AxiosError>({ rpcURL, contractAddress, ownerAddress, quantity }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => currentChain.id !== ETHEREUM.id || !contractAddress || !ownerAddress || !quantity || !rpcURL,
    ...config,
  });

  return { data, error, mutate };
}
