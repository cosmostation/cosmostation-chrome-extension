import type { Account } from '@/types/account';
import type { ExtensionStorage } from '@/types/extension';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';

export async function getAccount(id: string) {
  const { accounts } = await chrome.storage.local.get<ExtensionStorage>('accounts');

  const account = accounts?.find((account) => account.id === id);

  if (!account) {
    throw new Error('Account not found');
  }

  return account;
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
