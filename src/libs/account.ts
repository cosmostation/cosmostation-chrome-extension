import type { Account, AccountAddress } from '@/types/account';
import type { ExtensionStorage } from '@/types/extension';
import { aesDecrypt } from '@/utils/crypto';
import { getExtensionLocalStorage, getExtensionSessionStorage, setExtensionLocalStorage } from '@/utils/storage';

export async function getAccount(id: string) {
  const { accounts } = await chrome.storage.local.get<ExtensionStorage>('accounts');

  const account = accounts?.find((account) => account.id === id);

  if (!account) {
    throw new Error('Account not found');
  }

  return account;
}

export async function getPassword() {
  const password = await getExtensionSessionStorage('password');

  if (!password) {
    throw new Error('Password not found');
  }

  const { encryptedPassword, key, timestamp } = password;

  const decryptedPassword = aesDecrypt(encryptedPassword, `${key}${timestamp}`);

  return decryptedPassword;
}

// test
export async function addAccount(account: Account) {
  const storedAccounts = await getExtensionLocalStorage('accounts');

  const updatedAccounts = [...storedAccounts, account];

  await setExtensionLocalStorage('accounts', updatedAccounts);
}

export async function getAccountAddress(id: string) {
  const storage = await chrome.storage.local.get<ExtensionStorage>(`${id}-address`);

  const address = storage[`${id}-address`];

  return address;
}

export async function getMultipleAccountTypesChain(id: string) {
  const addresses = await getAccountAddress(id);
  const params = await getExtensionLocalStorage('paramsV11');

  const paramsValues = Object.values(params);

  const multiAccountTypesChainlistParam = paramsValues.filter((item) => {
    if (item.params.chainlist_params?.account_type) {
      if (item.params.chainlist_params.account_type.length > 1) {
        return true;
      }
    } else {
      return false;
    }
  });

  const multipleAccountTypesSupportAddresses = addresses.filter((item) =>
    multiAccountTypesChainlistParam.some(
      (i) => i.params.chainlist_params.api_name === item.chainId && i.params.chainlist_params.chain_type.includes(item.chainType),
    ),
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
      const filteredCosmosAccountAddress = value.filter((item) => item.chainType === 'cosmos');
      acc[key] = filteredCosmosAccountAddress;
      return acc;
    },
    {} as Record<string, AccountAddress[]>,
  );

  return mutlipleAccountTypesWithAddress;
}
