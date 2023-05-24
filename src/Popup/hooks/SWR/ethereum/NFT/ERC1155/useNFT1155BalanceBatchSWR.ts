import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';

import { ERC1155_ABI } from '~/constants/abi';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import type { EthereumNetwork } from '~/types/chain';
import type { ERC1155ContractMethods, ERC1155URIPayload } from '~/types/ethereum/contract';

type FetcherParams = {
  rpcURL: string;
  contractAddress: string;
  ownerAddress: string;
  tokenId: string;
};

type UseNFT1155BalanceBatchSWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
  ownerAddress?: string;
  tokenId?: string;
};

export function useNFT1155BalanceBatchSWR({ network, ownerAddress, contractAddress, tokenId }: UseNFT1155BalanceBatchSWR, config?: SWRConfiguration) {
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

    const contract = new web3.eth.Contract(ERC1155_ABI as AbiItem[], params.contractAddress);

    const methods = contract.methods as ERC1155ContractMethods;

    return methods.balanceOfBatch([params.ownerAddress], [params.tokenId]).call() as Promise<ERC1155URIPayload>;
  };

  const { data, error, mutate } = useSWR<ERC1155URIPayload, AxiosError>({ rpcURL, contractAddress, ownerAddress, tokenId }, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    isPaused: () => currentChain.id !== ETHEREUM.id || !contractAddress || !tokenId || !rpcURL,
    ...config,
  });

  return { data, error, mutate };
}
