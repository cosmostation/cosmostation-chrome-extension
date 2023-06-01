import type { AxiosError } from 'axios';
import { ethers, FetchRequest } from 'ethers';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ERC721_ABI, ERC1155_ABI } from '~/constants/abi';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { TOKEN_TYPE } from '~/constants/ethereum';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import type { EthereumNetwork } from '~/types/chain';
import type { ERC721CheckPayload, ERC1155CheckPayload } from '~/types/ethereum/contract';
import type { GetNFTStandardPayload } from '~/types/ethereum/nft';

type FetcherParams = {
  rpcURL: string;
  contractAddress: string;
  erc721InterfaceId: string;
  erc1155InterfaceId: string;
};

type UseGetNFTStandardSWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
};

const ERC721_INTERFACE_ID = '0x80ac58cd';
const ERC1155_INTERFACE_ID = '0xd9b67a26';

export function useGetNFTStandardSWR({ network, contractAddress }: UseGetNFTStandardSWR, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const rpcURL = network?.rpcURL || currentEthereumNetwork.rpcURL;

  const fetcher = async (params: FetcherParams) => {
    const customFetchRequest = new FetchRequest(rpcURL);

    customFetchRequest.setHeader('Cosmostation', `extension/${String(process.env.VERSION)}`);

    const provider = new ethers.JsonRpcProvider(customFetchRequest);

    const erc721Contract = new ethers.Contract(params.contractAddress, ERC721_ABI, provider);

    const erc721ContractCall = erc721Contract.supportsInterface(params.erc721InterfaceId) as Promise<ERC721CheckPayload>;
    const erc721ContractCallResponse = await erc721ContractCall;
    if (erc721ContractCallResponse) {
      return TOKEN_TYPE.ERC721;
    }

    const erc1155Contract = new ethers.Contract(params.contractAddress, ERC1155_ABI, provider);

    const erc1155ContractCall = erc1155Contract.supportsInterface(params.erc1155InterfaceId) as Promise<ERC1155CheckPayload>;
    const erc1155ContractResponse = await erc1155ContractCall;
    if (erc1155ContractResponse) {
      return TOKEN_TYPE.ERC1155;
    }

    return undefined;
  };

  const { data, error, mutate } = useSWR<GetNFTStandardPayload, AxiosError>(
    { rpcURL, contractAddress, erc721InterfaceId: ERC721_INTERFACE_ID, erc1155InterfaceId: ERC1155_INTERFACE_ID },
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      errorRetryCount: 0,
      isPaused: () => currentChain.id !== ETHEREUM.id || !contractAddress || !rpcURL,
      ...config,
    },
  );

  return { data, error, mutate };
}
