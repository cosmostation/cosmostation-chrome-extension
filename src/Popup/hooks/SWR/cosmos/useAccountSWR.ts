import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import useSWR from 'swr';

import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { get, isAxiosError } from '~/Popup/utils/axios';
import { cosmosURL } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type {
  AuthAccount,
  AuthAccountPubKey,
  AuthAccountsPayload,
  AuthAccountValue,
  AuthBaseVestingAccount,
  AuthBaseWithStartAndPeriod,
  DesmosAccount,
  DesmosAuthAccount,
  DesmosAuthAccountsPayload,
  DesmosBaseAccount,
  DesmosModuleAccount,
} from '~/types/cosmos/account';

export function useAccountSWR(chain: CosmosChain, suspense?: boolean) {
  const accounts = useAccounts(suspense);
  const { extensionStorage } = useExtensionStorage();

  const address = accounts.data?.find((account) => account.id === extensionStorage.selectedAccountId)?.address[chain.id] || '';
  const { getAccount } = cosmosURL(chain);

  const requestURL = getAccount(address);

  const fetcher = async (url: string) => {
    try {
      return await get<AuthAccountsPayload>(url);
    } catch (e: unknown) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      throw e;
    }
  };

  const { data, error, mutate } = useSWR<AuthAccountsPayload | null, AxiosError>(requestURL, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 14000,
    refreshInterval: 15000,
    errorRetryCount: 0,
    suspense,
    isPaused: () => !address || !chain,
  });

  const isBaseVestingAccount = (payload: AuthAccountValue | AuthBaseVestingAccount | AuthBaseWithStartAndPeriod): payload is AuthBaseVestingAccount =>
    (payload as AuthBaseVestingAccount).base_vesting_account !== undefined && (payload as AuthBaseWithStartAndPeriod).vesting_periods === undefined;

  const isBaseWithStartAndPeriod = (payload: AuthAccountValue | AuthBaseVestingAccount | AuthBaseWithStartAndPeriod): payload is AuthBaseWithStartAndPeriod =>
    (payload as AuthBaseWithStartAndPeriod).base_vesting_account !== undefined &&
    (payload as AuthBaseWithStartAndPeriod).start_time !== undefined &&
    (payload as AuthBaseWithStartAndPeriod).vesting_periods !== undefined;

  const isDesmosPayload = (payload: DesmosAuthAccountsPayload | AuthAccountsPayload): payload is DesmosAuthAccountsPayload =>
    (payload as DesmosAuthAccountsPayload).account !== undefined && (payload as DesmosAuthAccountsPayload).account['@type'] !== undefined;

  const isDesmosBasePayload = (payload: DesmosAuthAccount | DesmosAccount | DesmosModuleAccount): payload is DesmosAccount =>
    (payload as DesmosAccount)['@type'] !== '/desmos.profiles.v1beta1.Profile' && (payload as DesmosAccount).base_vesting_account !== undefined;

  const isDesmosModulePayload = (payload: DesmosAuthAccount | DesmosAccount | DesmosModuleAccount): payload is DesmosModuleAccount =>
    (payload as DesmosModuleAccount)['@type'] !== '/cosmos.auth.v1beta1.ModuleAccount' && (payload as DesmosModuleAccount).base_account !== undefined;

  const isDesmosBaseAccount = (account: DesmosAccount | DesmosBaseAccount | DesmosModuleAccount): account is DesmosBaseAccount =>
    (account as DesmosBaseAccount).address !== undefined && (account as DesmosBaseAccount).pub_key !== undefined;

  const isDesmosModuleAccount = (account: DesmosAccount | DesmosModuleAccount): account is DesmosModuleAccount =>
    (account as DesmosAccount).base_vesting_account === undefined && (account as DesmosModuleAccount).base_account !== undefined;

  const result = useMemo(() => {
    if (data) {
      if (isDesmosPayload(data)) {
        const account = isDesmosBasePayload(data.account) || isDesmosModulePayload(data.account) ? data.account : data.account.account || data.account;

        if (isDesmosBaseAccount(account)) {
          const basePubKey = {
            type: account.pub_key?.['@type'],
            value: account.pub_key?.key,
          } as AuthAccountPubKey;

          const typeArray = account['@type'].split('.');

          return {
            type: typeArray[typeArray.length - 1],
            value: {
              address: account.address,
              public_key: basePubKey,
              account_number: account.account_number,
              sequence: account.sequence,
            },
          } as AuthAccount;
        }

        if (isDesmosModuleAccount(account)) {
          const basePubKey = {
            type: account.base_account.pub_key?.['@type'],
            value: account.base_account?.pub_key?.key,
          } as AuthAccountPubKey;

          const typeArray = account['@type'].split('.');

          return {
            type: typeArray[typeArray.length - 1],
            value: {
              address: account.base_account.address,
              public_key: basePubKey,
              account_number: account.base_account.account_number,
              sequence: account.base_account.sequence,
            },
          } as AuthAccount;
        }

        const baseVestingAccount = account.base_vesting_account;

        const pubKey = {
          type: baseVestingAccount?.base_account.pub_key?.['@type'],
          value: baseVestingAccount?.base_account.pub_key?.key,
        } as AuthAccountPubKey;

        const typeArray = account['@type'].split('.');

        return {
          type: typeArray[typeArray.length - 1],
          value: {
            address: baseVestingAccount?.base_account.address,
            public_key: pubKey,
            account_number: baseVestingAccount?.base_account.account_number,
            sequence: baseVestingAccount?.base_account.sequence,
            original_vesting: baseVestingAccount?.original_vesting,
            delegated_free: baseVestingAccount?.delegated_free,
            delegated_vesting: baseVestingAccount?.delegated_vesting,
            start_time: account.start_time,
            vesting_periods: account.vesting_periods,
            end_time: baseVestingAccount?.end_time,
          },
        } as AuthAccount;
      }

      const value = data.result.value || data.result;

      if (isBaseWithStartAndPeriod(value)) {
        const vestingAccount = value.base_vesting_account;

        return {
          type: data.result.type?.split('/')[1],
          value: {
            address: vestingAccount.base_account.address,
            public_key: vestingAccount.base_account.public_key,
            account_number: vestingAccount.base_account.account_number,
            sequence: vestingAccount.base_account.sequence,
            original_vesting: vestingAccount.original_vesting,
            delegated_free: vestingAccount.delegated_free,
            delegated_vesting: vestingAccount.delegated_vesting,
            start_time: value.start_time,
            vesting_periods: value.vesting_periods,
            end_time: vestingAccount.end_time,
          },
        } as AuthAccount;
      }

      if (isBaseVestingAccount(value)) {
        const vestingAccount = value.base_vesting_account;

        return {
          type: data.result.type?.split('/')[1],
          value: {
            address: vestingAccount.base_account.address,
            public_key: vestingAccount.base_account.public_key,
            account_number: vestingAccount.base_account.account_number,
            sequence: vestingAccount.base_account.sequence,
            original_vesting: vestingAccount.original_vesting,
            delegated_free: vestingAccount.delegated_free,
            delegated_vesting: vestingAccount.delegated_vesting,
            start_time: value.start_time,
            end_time: vestingAccount.end_time,
          },
        } as AuthAccount;
      }

      if (data.result.account_number) {
        return {
          value: data.result,
          type: data.result.type?.split('/')[1],
        } as AuthAccount;
      }

      if (data.result.base_account) {
        return {
          value: {
            ...data.result.base_account,
            code_hash: data.result.code_hash,
          },
          type: data.result.type?.split('/')[1],
        } as AuthAccount;
      }

      return {
        ...data.result,
        type: data.result.type?.split('/')[1],
      } as AuthAccount;
    }

    if (!data) {
      return undefined;
    }

    return data as unknown as AuthAccount;
  }, [data]);

  return {
    data: result,
    error,
    mutate,
  };
}
