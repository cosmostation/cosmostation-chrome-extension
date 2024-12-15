import { CURRENCY_TYPE } from '@/constants/currency';
import { DefaultSortKey } from '@/constants/initialStorage';
import type { ChainToAccountTypeMap, PreferAccountType } from '@/types/account';
import type { ExtensionSessionStorage, ExtensionSessionStorageKeys, ExtensionStorage, ExtensionStorageKeys } from '@/types/extension';

import { extension } from './browser';
import { aesDecrypt } from './crypto';

export async function initExtensionLocalStorage() {
  const originStorage = await getAllExtensionLocalStorage();

  if (!originStorage.language) {
    setExtensionLocalStorage('language', 'en');
  }

  if (!originStorage.currency) {
    const newCurrency = CURRENCY_TYPE.USD;

    await setExtensionLocalStorage('currency', newCurrency);
  }

  if (!originStorage.dappListSortKey) {
    await setExtensionLocalStorage('dappListSortKey', DefaultSortKey.dappListSortKey);
  }

  if (!originStorage.dashboardCoinSortKey) {
    await setExtensionLocalStorage('dashboardCoinSortKey', DefaultSortKey.dashboardCoinSortKey);
  }

  if (!originStorage.accounts) {
    await setExtensionLocalStorage('accounts', []);
  }

  if (!originStorage.accountNamesById) {
    await setExtensionLocalStorage('accountNamesById', {});
  }

  if (!originStorage.mnemonicNamesByHashedMnemonic) {
    await setExtensionLocalStorage('mnemonicNamesByHashedMnemonic', {});
  }

  if (!originStorage.notBackedUpAccountIds) {
    await setExtensionLocalStorage('notBackedUpAccountIds', []);
  }

  if (!originStorage.preferAccountType) {
    await setExtensionLocalStorage('preferAccountType', {});
  }

  // NOTE 이미 저장된 상태. 새 체인파람에 멀티 어카운트 타입이 감지가 됐는데 이게 스토리지에는 저장이 안되어있을때
  if (Object.keys(originStorage.preferAccountType).length > 0) {
    const filteredAccountTypes = Object.values(originStorage.paramsV11).filter(
      (item) => item.params.chainlist_params?.account_type && item.params.chainlist_params.account_type.length > 1,
    );

    const freshMultiAccountChainNames = filteredAccountTypes.map((item) => item.params.chainlist_params.api_name);

    const notStoredNewMultiAccountTypes = freshMultiAccountChainNames.filter((item) => !Object.keys(originStorage.preferAccountType).includes(item));

    if (notStoredNewMultiAccountTypes && notStoredNewMultiAccountTypes.length > 0) {
      const newPreferAccountType: ChainToAccountTypeMap = {};

      notStoredNewMultiAccountTypes.forEach((item) => {
        const aaaaaa = filteredAccountTypes.find((ac) => ac.params.chainlist_params.api_name === item)?.params.chainlist_params.account_type;
        const defaultAccountType = aaaaaa?.find((type) => type.is_default !== false);

        if (defaultAccountType) {
          const type = {
            hdPath: defaultAccountType.hd_path,
            pubkeyStyle: defaultAccountType.pubkey_style,
            isDefault: defaultAccountType.is_default,
            pubKeyType: defaultAccountType.pubkey_type,
          };
          newPreferAccountType[item] = type;
        }
      });

      const oldPreferAccountType = Object.values(originStorage.preferAccountType)[0];
      const mergedPreferAccountType = { ...oldPreferAccountType, ...newPreferAccountType };

      const aaa = originStorage.accounts.reduce((acc: PreferAccountType, cur) => {
        acc[cur.id] = mergedPreferAccountType;
        return acc;
      }, {});

      await setExtensionLocalStorage('preferAccountType', aaa);
    }
  }

  // NOTE 마이그레이션 용 로직
  // NOTE accounts는 있지만 preferAccountType이 없는 경우
  if (originStorage.accounts.length > 0 && Object.keys(originStorage.preferAccountType).length < 1) {
    const updatedPreferAccountType = Object.values(originStorage.paramsV11)
      .filter((item) => item.params.chainlist_params?.account_type && item.params.chainlist_params.account_type.length > 1)
      .reduce((acc: ChainToAccountTypeMap, cur) => {
        const defaultAccountType = cur.params.chainlist_params.account_type?.find((type) => type.is_default !== false);

        if (defaultAccountType) {
          const type = {
            hdPath: defaultAccountType.hd_path,
            pubkeyStyle: defaultAccountType.pubkey_style,
            isDefault: defaultAccountType.is_default,
            pubKeyType: defaultAccountType.pubkey_type,
          };

          acc[cur.params.chainlist_params.api_name] = type;
        }

        return acc;
      }, {});

    const aaa = originStorage.accounts.reduce((acc: PreferAccountType, cur) => {
      acc[cur.id] = updatedPreferAccountType;
      return acc;
    }, {});

    await setExtensionLocalStorage('preferAccountType', aaa);
  }
}

export async function setExtensionLocalStorage<T extends ExtensionStorageKeys>(key: T, value: ExtensionStorage[T]) {
  await extension.storage.local.set({ [key]: value as ExtensionStorage[T] });
}

export async function getExtensionLocalStorage<T extends ExtensionStorageKeys>(key: T) {
  const localStorage = await extension.storage.local.get(key);

  return localStorage[key] as ExtensionStorage[T];
}

export async function getAllExtensionLocalStorage(): Promise<ExtensionStorage> {
  const localStorage = await extension.storage.local.get();

  return localStorage as ExtensionStorage;
}

export async function setExtensionSessionStorage<T extends ExtensionSessionStorageKeys>(key: T, value: ExtensionSessionStorage[T]) {
  await extension.storage.session.set({ [key]: value as ExtensionSessionStorage[T] });
}

export async function getExtensionSessionStorage<T extends ExtensionSessionStorageKeys>(key: T) {
  const sessionStorage = await extension.storage.session.get(key);

  return sessionStorage[key] as ExtensionSessionStorage[T];
}

export async function getAllExtensionSessionStorage(): Promise<ExtensionSessionStorage> {
  const sessionStorage = await extension.storage.session.get();

  return sessionStorage as ExtensionSessionStorage;
}

export async function extensionSessionStorage() {
  const storage = await getAllExtensionSessionStorage();

  const currentPassword = storage.password ? aesDecrypt(storage.password.encryptedPassword, `${storage.password.key}${storage.password.timestamp}`) : null;

  return {
    ...storage,
    currentPassword,
  };
}
