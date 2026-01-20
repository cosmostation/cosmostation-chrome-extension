import { useQuery } from '@tanstack/react-query';

import type { CosmosNFT, EvmNFT, IotaNFT, SuiNFT } from '@/types/nft';
import { getMultipleFromExtensionStorage } from '@/utils/storage';

export type AccountNFTData = {
  evm: EvmNFT[];
  cosmos: CosmosNFT[];
  sui: SuiNFT[];
  iota: IotaNFT[];
};

export function useAccountNFTQuery(accountId: string) {
  return useQuery({
    queryKey: ['account-nft', accountId],
    queryFn: async (): Promise<AccountNFTData> => {
      const storage = await getMultipleFromExtensionStorage([
        `${accountId}-nft-evm`,
        `${accountId}-nft-cosmos`,
        `${accountId}-nft-sui`,
        `${accountId}-nft-iota`,
      ]);

      return {
        evm: storage[`${accountId}-nft-evm`] || [],
        cosmos: storage[`${accountId}-nft-cosmos`] || [],
        sui: storage[`${accountId}-nft-sui`] || [],
        iota: storage[`${accountId}-nft-iota`] || [],
      };
    },
    staleTime: 1000 * 60,
    enabled: !!accountId,
  });
}
