import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import type { CosmosChain } from '~/types/chain';

import { useGetNFTTokenIdsSWR } from './useGetNFTTokenIdsSWR';
import { useAccounts } from '../../cache/useAccounts';

type UseGetNFTOwnerSWR = {
  chain: CosmosChain;
  ownerAddress: string;
  contractAddress: string;
  tokenId: string;
};

export function useGetNFTOwnerSWR({ chain, contractAddress, ownerAddress, tokenId }: UseGetNFTOwnerSWR, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();
  const accounts = useAccounts(config?.suspense);

  const { currentAccount } = useCurrentAccount();

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[currentChain.id] || '',
    [accounts?.data, currentAccount.id, currentChain.id],
  );

  const ownerWalletAddress = useMemo(() => ownerAddress || currentAddress, [ownerAddress, currentAddress]);

  const ownedTokenIds = useGetNFTTokenIdsSWR({ chain, contractAddress, ownerAddress: ownerWalletAddress });

  const isValidating = useMemo(() => ownedTokenIds.isValidating, [ownedTokenIds.isValidating]);

  const error = useMemo(() => ownedTokenIds.error, [ownedTokenIds.error]);

  const isOwnedNFT = useMemo(() => (tokenId ? ownedTokenIds.data?.tokens.includes(tokenId) : false), [ownedTokenIds.data?.tokens, tokenId]);

  return { isOwnedNFT, isValidating, error };
}
