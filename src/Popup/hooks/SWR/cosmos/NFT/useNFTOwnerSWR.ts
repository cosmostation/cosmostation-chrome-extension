import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';

import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentChain } from '~/Popup/hooks/useCurrent/useCurrentChain';
import type { CosmosChain } from '~/types/chain';

import { useOwnedNFTTokenIDsSWR } from './useOwnedNFTTokenIDsSWR';
import { useAccounts } from '../../cache/useAccounts';

type UseNFTOwnerSWR = {
  chain: CosmosChain;
  contractAddress: string;
  tokenId: string;
  ownerAddress?: string;
};

export function useNFTOwnerSWR({ chain, contractAddress, tokenId, ownerAddress }: UseNFTOwnerSWR, config?: SWRConfiguration) {
  const { currentChain } = useCurrentChain();
  const accounts = useAccounts(config?.suspense);

  const { currentAccount } = useCurrentAccount();

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[currentChain.id] || '',
    [accounts?.data, currentAccount.id, currentChain.id],
  );

  const ownerWalletAddress = useMemo(() => ownerAddress || currentAddress, [ownerAddress, currentAddress]);

  const ownedTokenIds = useOwnedNFTTokenIDsSWR({ chain, contractAddress, ownerAddress: ownerWalletAddress }, config);

  const isValidating = useMemo(() => ownedTokenIds.isValidating, [ownedTokenIds.isValidating]);

  const error = useMemo(() => ownedTokenIds.error, [ownedTokenIds.error]);

  const isOwnedNFT = useMemo(() => {
    if (ownedTokenIds.data?.tokens) {
      return ownedTokenIds.data.tokens.includes(tokenId);
    }
    return false;
  }, [ownedTokenIds.data?.tokens, tokenId]);

  return { isOwnedNFT, isValidating, error };
}
