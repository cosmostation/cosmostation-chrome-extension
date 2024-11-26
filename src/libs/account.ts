import type { Account } from '@/types/account';
import type { ExtensionStorage } from '@/types/extension';

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
  await chrome.storage.local.set<Partial<ExtensionStorage>>({ accounts: [account] });
}

export async function getAccountAddress(id: string) {
  const storage = await chrome.storage.local.get<ExtensionStorage>(`${id}-address`);

  const address = storage[`${id}-address`];

  return address;
}
