import type { AxiosError } from 'axios';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';

import { ERC721_ABI } from '~/constants/abi';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import type { EthereumNetwork } from '~/types/chain';
import type { ERC1155CheckPayload, ERC1155ContractMethods } from '~/types/ethereum/contract';

import { useCurrentChain } from '../../../../useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '../../../../useCurrent/useCurrentEthereumNetwork';

type FetcherParams = {
  rpcURL: string;
  interfaceId: string;
  contractAddress: string;
};

type UseNFT1155CheckSWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
};

const ERC1155_INTERFACE_FNHASH = '0xd9b67a26';

export function useNFT1155CheckSWR({ network, contractAddress }: UseNFT1155CheckSWR, config?: SWRConfiguration) {
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

    // NOTE 721로 했을때는 동작했는데 1155로 했을때 안나올수도
    const methods = contract.methods as ERC1155ContractMethods;

    return methods.supportsInterface(params.interfaceId).call() as Promise<ERC1155CheckPayload>;
  };

  const { data, error, mutate } = useSWR<ERC1155CheckPayload, AxiosError>({ rpcURL, contractAddress, interfaceId: ERC1155_INTERFACE_FNHASH }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    isPaused: () => currentChain.id !== ETHEREUM.id || !contractAddress || !rpcURL,
    ...config,
  });

  return { data, error, mutate };
}
