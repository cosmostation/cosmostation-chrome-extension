import { useQuery } from '@tanstack/react-query';

import type { AccountAddress } from '@/types/account';
import { getMultipleFromExtensionStorage } from '@/utils/storage';

export type AccountAddressData = {
  addresses: AccountAddress[];
  customAddresses: AccountAddress[];
};

export function useAccountAddressQuery(accountId: string) {
  return useQuery({
    queryKey: ['account-address', accountId],
    queryFn: async (): Promise<AccountAddressData> => {
      const storage = await getMultipleFromExtensionStorage([`${accountId}-address`, `${accountId}-custom-address`]);

      const addresses = storage[`${accountId}-address`] || [];
      const customAddresses = storage[`${accountId}-custom-address`] || [];

      return {
        addresses,
        customAddresses,
      };
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!accountId,
  });
}

export function useMultipleAccountAddressesQuery(accountIds: string[], isCustomChain: boolean) {
  return useQuery({
    queryKey: ['multiple-account-addresses', accountIds, isCustomChain],
    queryFn: async (): Promise<Record<string, AccountAddress[]>> => {
      const addressKey = isCustomChain ? 'custom-address' : 'address';

      const addressKeys = accountIds.map((id) => `${id}-${addressKey}` as const);

      const storage = await getMultipleFromExtensionStorage(addressKeys);

      return accountIds.reduce(
        (acc, id) => {
          const addresses = storage[`${id}-${addressKey}`] || [];
          acc[id] = addresses;
          return acc;
        },
        {} as Record<string, AccountAddress[]>,
      );
    },
    staleTime: 1000 * 60 * 5,
    enabled: accountIds.length > 0,
  });
}
