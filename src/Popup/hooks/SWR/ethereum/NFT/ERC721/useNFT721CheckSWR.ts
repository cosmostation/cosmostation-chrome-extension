import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';

import { ERC721_ABI } from '~/constants/abi';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import type { EthereumNetwork } from '~/types/chain';
import type { ERC721CheckPayload, ERC721ContractMethods } from '~/types/ethereum/contract';

import { useCurrentChain } from '../../../../useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '../../../../useCurrent/useCurrentEthereumNetwork';

type FetcherParams = {
  rpcURL: string;
  contractAddress: string;
  interfaceId: string;
};

type UseNFT721CheckSWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
};

const ERC721_INTERFACE_FNHASH = '0x80ac58cd';

export function useNFT721CheckSWR({ network, contractAddress }: UseNFT721CheckSWR, config?: SWRConfiguration) {
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

    return methods.supportsInterface(params.interfaceId).call() as Promise<ERC721CheckPayload>;
  };

  const { data, error, mutate } = useSWR<ERC721CheckPayload, AxiosError>({ rpcURL, contractAddress, interfaceId: ERC721_INTERFACE_FNHASH }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => currentChain.id !== ETHEREUM.id || !contractAddress || !rpcURL,
    ...config,
  });

  return { data, error, mutate };
}
