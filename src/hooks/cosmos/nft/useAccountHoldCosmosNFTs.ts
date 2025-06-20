import { useMemo } from 'react';

import type { UseFetchConfig } from '@/hooks/common/useFetch';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentAccountAddresses } from '@/hooks/useCurrentAccountAddresses';
import { getUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';

import { useOwnedNFTsTokenId } from './useOwnedNFTsTokenId';
import { useSupportedCW721Assets } from '../useSupportedCW721Assets';

type UseAccountHoldCosmosNFTsProps =
  | {
      accountId?: string;
      config?: UseFetchConfig;
    }
  | undefined;

export function useAccountHoldCosmosNFTs({ accountId, config }: UseAccountHoldCosmosNFTsProps = {}) {
  const { chainList } = useChainList();
  const { currentAccount } = useCurrentAccount();
  const currentAccountId = accountId || currentAccount.id;

  const supportedCW721Assets = useSupportedCW721Assets(config);

  const { data: currentAccountAddress } = useCurrentAccountAddresses({ accountId: currentAccountId });

  const formatedParams = useMemo(() => {
    if (!supportedCW721Assets.data || !currentAccountAddress) return undefined;

    const formatted = supportedCW721Assets.data
      .map((item) => {
        const chain = chainList.cosmosChains?.find((chain) => chain.id === item.chain);
        if (!chain) return undefined;

        const uniqueChainId = chain ? getUniqueChainId(chain) : undefined;

        const ownerAddress = currentAccountAddress?.find((item) => item.chainId === chain?.id && item.chainType === chain?.chainType)?.address;
        return {
          chainId: uniqueChainId,
          contractAddress: item.contractAddress,
          ownerAddress,
        };
      })
      .filter((item) => !!item);

    return formatted && formatted.length > 0 ? formatted : undefined;
  }, [chainList.cosmosChains, currentAccountAddress, supportedCW721Assets]);

  const ownedNFTs = useOwnedNFTsTokenId({
    params: formatedParams,
    config: {
      ...config,
      retry: 2,
      retryDelay: 1000 * 3,
      staleTime: 1000 * 60 * 1,
      refetchInterval: false,
    },
  });

  const currentAccountHoldCosmosNFTs = useMemo(() => {
    const flattendOwnedNFTTokenIDs =
      ownedNFTs.data
        ?.map((obj) =>
          obj?.tokens.map((tokenId) => ({
            contractAddress: obj.contractAddress,
            tokenId,
          })),
        )
        .reduce((acc, arr) => (arr ? acc?.concat(arr) : arr), [] as { contractAddress: string; tokenId: string }[]) || [];

    const formattedOwnedNFTs = flattendOwnedNFTTokenIDs
      .map((item) => {
        const matchedNft = formatedParams?.find((aaa) => aaa.contractAddress === item.contractAddress);
        if (!matchedNft || !matchedNft.chainId || !matchedNft.ownerAddress) return undefined;
        const { id, chainType } = parseUniqueChainId(matchedNft.chainId);

        return {
          chainId: id,
          chainType: chainType,
          contractAddress: item.contractAddress,
          tokenId: item.tokenId,
          ownerAddress: matchedNft.ownerAddress,
          tokenType: 'CW721',
        };
      })
      .filter((item) => !!item);

    return formattedOwnedNFTs && formattedOwnedNFTs.length > 0 ? formattedOwnedNFTs : undefined;
  }, [formatedParams, ownedNFTs.data]);

  const isLoading = useMemo(() => supportedCW721Assets.isLoading || ownedNFTs.isLoading, [ownedNFTs.isLoading, supportedCW721Assets.isLoading]);
  const isFetching = useMemo(() => supportedCW721Assets.isFetching || ownedNFTs.isFetching, [ownedNFTs.isFetching, supportedCW721Assets.isFetching]);
  const error = useMemo(() => supportedCW721Assets.error || ownedNFTs.error, [ownedNFTs.error, supportedCW721Assets.error]);

  const refetch = () => {
    supportedCW721Assets.refetch();
    ownedNFTs.refetch();
  };

  return { data: currentAccountHoldCosmosNFTs, isLoading, isFetching, error, refetch };
}
