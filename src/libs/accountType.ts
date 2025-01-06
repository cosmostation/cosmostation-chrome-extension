import { produce } from 'immer';

import type { AccountAddress, ChainToAccountTypeMap } from '@/types/account';
import { getExtensionLocalStorage } from '@/utils/storage';

import { getAccountAddress } from './account';

export async function getMultipleAccountTypesChain(id: string) {
  const addresses = await getAccountAddress(id);
  const params = await getExtensionLocalStorage('paramsV11');

  const chainIds = Object.keys(params);
  const chainInfos = chainIds.map((chainId) => {
    const chainInfo = params[chainId];

    return {
      id: chainId,
      ...chainInfo,
    };
  });

  const multiAccountTypesChainlistParam = chainInfos.filter((item) => {
    if (item.params.chainlist_params?.account_type) {
      if (item.params.chainlist_params.account_type.length > 1) {
        return true;
      }
    } else {
      return false;
    }
  });

  const multipleAccountTypesSupportAddresses = addresses.filter((item) =>
    multiAccountTypesChainlistParam.some((i) => i.id === item.chainId && i.params.chainlist_params.chain_type.includes(item.chainType)),
  );

  const groupedAccountAddressesByChainId = multipleAccountTypesSupportAddresses.reduce(
    (acc, item) => {
      const { chainId } = item;

      if (!acc[chainId]) {
        acc[chainId] = [];
      }

      acc[chainId].push(item);

      return acc;
    },
    {} as Record<string, AccountAddress[]>,
  );

  const mutlipleAccountTypesWithAddress = Object.entries(groupedAccountAddressesByChainId).reduce(
    (acc, [key, value]) => {
      const filteredCosmosAccountAddress = value.filter((item) => item.chainType === 'cosmos' || item.chainType === 'bitcoin');
      acc[key] = filteredCosmosAccountAddress.map((item) => {
        return produce(item, (draft) => {
          draft.accountType.hdPath = draft.accountType.hdPath.replace('X', '${index}');
        });
      });
      return acc;
    },
    {} as Record<string, AccountAddress[]>,
  );

  return mutlipleAccountTypesWithAddress;
}

export async function getDefaultAccountTypes() {
  const params = await getExtensionLocalStorage('paramsV11');

  const chainIds = Object.keys(params);
  const chainInfos = chainIds.map((chainId) => {
    const chainInfo = params[chainId];

    return {
      id: chainId,
      ...chainInfo,
    };
  });

  const multiAccountTypesChainlistParam = chainInfos.filter((item) => {
    if (item.params.chainlist_params?.account_type) {
      if (item.params.chainlist_params.account_type.length > 1) {
        return true;
      }
    } else {
      return false;
    }
  });

  const defaultAccountTypes = multiAccountTypesChainlistParam.reduce((acc: ChainToAccountTypeMap, item) => {
    const id = item.id;
    const { account_type } = item.params.chainlist_params;

    const defaultAccount = account_type?.find((item) => item.is_default !== false);

    if (!defaultAccount) return acc;

    const defaultAccountType = {
      hdPath: defaultAccount.hd_path.replace('X', '${index}'),
      pubkeyStyle: defaultAccount.pubkey_style,
      isDefault: defaultAccount.is_default,
      pubkeyType: defaultAccount.pubkey_type,
    };

    acc[id] = defaultAccountType;
    return acc;
  }, {});

  return defaultAccountTypes;
}
