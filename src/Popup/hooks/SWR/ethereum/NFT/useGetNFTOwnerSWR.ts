import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import { ethers, FetchRequest } from 'ethers';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { ERC721_ABI, ERC1155_ABI } from '~/constants/abi';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { TOKEN_TYPE } from '~/constants/ethereum';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { isAxiosError } from '~/Popup/utils/axios';
import { gt } from '~/Popup/utils/big';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { EthereumNetwork } from '~/types/chain';
import type { ERC721OwnerPayload, ERC1155BalanceOfPayload } from '~/types/ethereum/contract';
import type { GetNFTOwnerPayload } from '~/types/ethereum/nft';

import { useGetNFTStandardSWR } from './useGetNFTStandardSWR';
import { useAccounts } from '../../cache/useAccounts';

type FetcherParams = {
  rpcURL: string;
  contractAddress: string;
  tokenId: string;
  ownerAddress: string;
};

type UseGetNFTOwnerSWR = {
  network?: EthereumNetwork;
  ownerAddress?: string;
  contractAddress?: string;
  tokenId?: string;
};

export function useGetNFTOwnerSWR({ network, contractAddress, ownerAddress, tokenId }: UseGetNFTOwnerSWR, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();
  const accounts = useAccounts(config?.suspense);
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { currentAccount } = useCurrentAccount();

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[currentChain.id] || '',
    [accounts?.data, currentAccount.id, currentChain.id],
  );

  console.log('🚀 ~ file: useGetNFTOwnerSWR.ts:49 ~ useGetNFTOwnerSWR ~ currentAddress:', currentAddress);

  const walletAddress = useMemo(() => ownerAddress || currentAddress, [ownerAddress, currentAddress]);

  const rpcURL = network?.rpcURL || currentEthereumNetwork.rpcURL;

  const { data: getNFTStandard, error: getNFTStandardError } = useGetNFTStandardSWR({ contractAddress }, config);

  const fetcher = async (params: FetcherParams) => {
    const customFetchRequest = new FetchRequest(rpcURL);

    customFetchRequest.setHeader('Cosmostation', `extension/${String(process.env.VERSION)}`);

    const provider = new ethers.JsonRpcProvider(customFetchRequest);

    try {
      if (getNFTStandardError) {
        throw getNFTStandardError;
      }
      if (getNFTStandard === TOKEN_TYPE.ERC721) {
        const erc721Contract = new ethers.Contract(params.contractAddress, ERC721_ABI, provider);

        const erc721ContractCall = erc721Contract.ownerOf(params.tokenId) as Promise<ERC721OwnerPayload>;
        const erc721ContractCallResponse = await erc721ContractCall;

        return isEqualsIgnoringCase(erc721ContractCallResponse, params.ownerAddress);
      }
      if (getNFTStandard === TOKEN_TYPE.ERC1155) {
        const erc1155Contract = new ethers.Contract(params.contractAddress, ERC1155_ABI, provider);

        const erc1155ContractCall = erc1155Contract.balanceOf(params.ownerAddress, params.tokenId) as Promise<ERC1155BalanceOfPayload>;
        const erc1155ContractCallResponse = await erc1155ContractCall;

        return gt(BigInt(erc1155ContractCallResponse).toString(10), '0');
      }
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }

    return null;
  };

  const { data, isValidating, error, mutate } = useSWR<GetNFTOwnerPayload | null, AxiosError>(
    { id: 'owner', rpcURL, contractAddress, tokenId, ownerAddress: walletAddress },
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 14000,
      refreshInterval: 15000,
      errorRetryCount: 5,
      errorRetryInterval: 5000,

      isPaused: () => currentChain.id !== ETHEREUM.id || !contractAddress || !tokenId || !walletAddress || !rpcURL,
      ...config,
    },
  );

  return { data, isValidating, error, mutate };
}
