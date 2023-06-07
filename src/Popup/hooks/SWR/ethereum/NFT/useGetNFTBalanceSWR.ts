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
import type { EthereumNetwork } from '~/types/chain';
import type { ERC721BalanceOfPayload, ERC1155BalanceOfPayload } from '~/types/ethereum/contract';
import type { GetNFTBalancePayload } from '~/types/ethereum/nft';

import { useGetNFTStandardSWR } from './useGetNFTStandardSWR';
import { useAccounts } from '../../cache/useAccounts';

type FetcherParams = {
  rpcURL: string;
  contractAddress: string;
  ownerAddress: string;
  tokenId: string;
};

type UseGetNFTBalanceSWR = {
  network?: EthereumNetwork;
  contractAddress?: string;
  ownerAddress?: string;
  tokenId?: string;
};

export function useGetNFTBalanceSWR({ network, contractAddress, ownerAddress, tokenId }: UseGetNFTBalanceSWR, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const { data: currentNFTStandard } = useGetNFTStandardSWR({ contractAddress }, config);

  const accounts = useAccounts(config?.suspense);

  const { currentAccount } = useCurrentAccount();

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[currentChain.id] || '',
    [accounts?.data, currentAccount.id, currentChain.id],
  );

  const walletAddress = useMemo(() => ownerAddress || currentAddress, [ownerAddress, currentAddress]);

  const rpcURL = network?.rpcURL || currentEthereumNetwork.rpcURL;

  const fetcher = async (params: FetcherParams) => {
    const customFetchRequest = new FetchRequest(rpcURL);

    customFetchRequest.setHeader('Cosmostation', `extension/${String(process.env.VERSION)}`);

    const provider = new ethers.JsonRpcProvider(customFetchRequest);

    try {
      if (currentNFTStandard === TOKEN_TYPE.ERC721) {
        const erc721Contract = new ethers.Contract(params.contractAddress, ERC721_ABI, provider);

        const erc721ContractCall = erc721Contract.balanceOf(params.ownerAddress) as Promise<ERC721BalanceOfPayload>;
        const erc721ContractCallResponse = await erc721ContractCall;
        return BigInt(erc721ContractCallResponse).toString(10);
      }

      if (currentNFTStandard === TOKEN_TYPE.ERC1155) {
        const erc1155Contract = new ethers.Contract(params.contractAddress, ERC1155_ABI, provider);

        const erc1155ContractCall = erc1155Contract.balanceOf(params.ownerAddress, params.tokenId) as Promise<ERC1155BalanceOfPayload>;
        const erc1155ContractCallResponse = await erc1155ContractCall;

        return BigInt(erc1155ContractCallResponse).toString(10);
      }
    } catch (e) {
      return null;
    }

    return null;
  };

  const { data, error, mutate } = useSWR<GetNFTBalancePayload | null, AxiosError>(
    { id: 'balance', rpcURL, contractAddress, ownerAddress: walletAddress, tokenId },
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 14000,
      refreshInterval: 15000,
      errorRetryCount: 0,
      isPaused: () => currentChain.id !== ETHEREUM.id || !contractAddress || !tokenId || !walletAddress || !rpcURL,
      ...config,
    },
  );

  return { data, error, mutate };
}
