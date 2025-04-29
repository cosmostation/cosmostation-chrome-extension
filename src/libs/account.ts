import type { Account } from '@/types/account';
import type { ExtensionStorage } from '@/types/extension';
import { aesDecrypt } from '@/utils/crypto';
import { getExtensionLocalStorage, getExtensionSessionStorage, setExtensionLocalStorage } from '@/utils/storage';

export async function getAccount(id: string) {
  const { userAccounts: accounts } = await chrome.storage.local.get<ExtensionStorage>('userAccounts');

  const account = accounts?.find((account) => account.id === id);

  if (!account) {
    throw new Error('Account not found');
  }

  return account;
}

export async function getPassword() {
  const password = await getExtensionSessionStorage('sessionPassword');

  if (!password) {
    throw new Error('Password not found');
  }

  const { encryptedPassword, key, timestamp } = password;

  const decryptedPassword = aesDecrypt(encryptedPassword, `${key}${timestamp}`);

  return decryptedPassword;
}

export async function addAccount(account: Account) {
  const storedAccounts = await getExtensionLocalStorage('userAccounts');

  const updatedAccounts = [...storedAccounts, account];

  await setExtensionLocalStorage('userAccounts', updatedAccounts);
}

export async function getAccountAddress(id: string) {
  const storage = await chrome.storage.local.get<ExtensionStorage>(`${id}-address`);

  const address = storage[`${id}-address`] || [];

  return address;
}

export async function getCustomAccountAddress(id: string) {
  const storage = await chrome.storage.local.get<ExtensionStorage>(`${id}-custom-address`);

  const address = storage[`${id}-custom-address`] || [];

  return address;
}

export async function getAllAccountAddress(id: string) {
  const accountAddress = await getAccountAddress(id);
  const customAccountAddress = await getCustomAccountAddress(id);

  return [...accountAddress, ...customAccountAddress];
}
