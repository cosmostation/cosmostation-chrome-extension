import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import type { CosmosChain } from '~/types/chain';

import { useNFTTokenIdsSWR } from './useNFTTokenIdsSWR';
import { useAccounts } from '../../cache/useAccounts';

type UseNFTOwnerSWR = {
  chain: CosmosChain;
  ownerAddress: string;
  contractAddress: string;
  tokenId: string;
};

export function useNFTOwnerSWR({ chain, contractAddress, ownerAddress, tokenId }: UseNFTOwnerSWR, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();
  const accounts = useAccounts(config?.suspense);

  const { currentAccount } = useCurrentAccount();

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[currentChain.id] || '',
    [accounts?.data, currentAccount.id, currentChain.id],
  );

  const ownerWalletAddress = useMemo(() => ownerAddress || currentAddress, [ownerAddress, currentAddress]);

  const ownedTokenIds = useNFTTokenIdsSWR({ chain, contractAddress, ownerAddress: ownerWalletAddress });

  const isValidating = useMemo(() => ownedTokenIds.isValidating, [ownedTokenIds.isValidating]);

  const error = useMemo(() => ownedTokenIds.error, [ownedTokenIds.error]);

  const isOwnedNFT = useMemo(() => (tokenId ? ownedTokenIds.data?.tokens.includes(tokenId) : false), [ownedTokenIds.data?.tokens, tokenId]);

  return { isOwnedNFT, isValidating, error };
}
