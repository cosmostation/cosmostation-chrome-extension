import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';

import { ERC721_ABI } from '~/constants/abi';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import type { EthereumNetwork } from '~/types/chain';
import type { ERC721ContractMethods, ERC721OwnerPayload } from '~/types/ethereum/contract';

import { useCurrentChain } from '../../../../useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '../../../../useCurrent/useCurrentEthereumNetwork';

type FetcherParams = {
  rpcURL: string;
  contractAddress: string;
  tokenId: string;
};

type UseNFT721OwnerSWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
  tokenId?: string;
};

export function useNFT721OwnerSWR({ network, contractAddress, tokenId }: UseNFT721OwnerSWR, config?: SWRConfiguration) {
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

    return methods.ownerOf(params.tokenId).call() as Promise<ERC721OwnerPayload>;
  };

  const { data, error, mutate } = useSWR<ERC721OwnerPayload, AxiosError>({ id: 'NFT_721_OWNER_OF', rpcURL, contractAddress, tokenId }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => currentChain.id !== ETHEREUM.id || !contractAddress || !tokenId || !rpcURL,
    ...config,
  });

  return { data, error, mutate };
}
