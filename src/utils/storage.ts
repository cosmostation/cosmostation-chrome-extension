import { produce } from 'immer';

import { AD_POPOVER_IDS } from '@/constants/adPopover';
import { CURRENCY_TYPE } from '@/constants/currency';
import { DefaultSortKey } from '@/constants/initialStorage';
import { v11 } from '@/script/service-worker/update/v11';
import type { AccountNamesById, ChainToAccountTypeMap, PreferAccountType } from '@/types/account';
import type { AdPopoverStateMap, ExtensionSessionStorage, ExtensionSessionStorageKeys, ExtensionStorage, ExtensionStorageKeys } from '@/types/extension';

import { extension } from './browser';
import { aesDecrypt } from './crypto';

export async function initExtensionLocalStorage() {
  const originStorage = await getAllExtensionLocalStorage();

  if (!originStorage.paramsV11 || !originStorage.assetsV11) {
    await v11();
  }

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

  if (!originStorage.customErc20Assets) {
    await setExtensionLocalStorage('customErc20Assets', []);
  }

  if (!originStorage.customCw20Assets) {
    await setExtensionLocalStorage('customCw20Assets', []);
  }

  if (!originStorage.addressBookList) {
    await setExtensionLocalStorage('addressBookList', []);
  }

  if (!originStorage.addedCustomChainList) {
    await setExtensionLocalStorage('addedCustomChainList', []);
  }

  if (!originStorage.selectedAccountId) {
    const defaultAccountId = originStorage.accounts?.[0]?.id || '';
    await setExtensionLocalStorage('selectedAccountId', defaultAccountId);
  }

  if (!originStorage.customAssets) {
    await setExtensionLocalStorage('customAssets', []);
  }

  if (!originStorage.customHiddenAssetIds) {
    await setExtensionLocalStorage('customHiddenAssetIds', []);
  }

  if (!originStorage.customErc20Assets) {
    await setExtensionLocalStorage('customErc20Assets', []);
  }

  if (!originStorage.customCw20Assets) {
    await setExtensionLocalStorage('customCw20Assets', []);
  }

  if (!originStorage.approvedOrigins) {
    await setExtensionLocalStorage('customCw20Assets', []);
  }

  if (!originStorage.initCheckLegacyBalanceAccountIds) {
    await setExtensionLocalStorage('initCheckLegacyBalanceAccountIds', []);
  }

  if (originStorage.isBalanceVisible === undefined) {
    await setExtensionLocalStorage('isBalanceVisible', true);
  }

  if (!originStorage.adPopoverState) {
    const defaultState = AD_POPOVER_IDS.reduce((acc: AdPopoverStateMap, cur) => {
      acc[cur] = {
        isVisiable: false,
        lastClosed: '',
      };
      return acc;
    }, {});

    await setExtensionLocalStorage('adPopoverState', defaultState);
  }

  if (originStorage.adPopoverState) {
    const adPopoverState = originStorage.adPopoverState;

    AD_POPOVER_IDS.forEach(async (id) => {
      if (adPopoverState[id]) {
        const dropPopoverState = adPopoverState[id];

        if (dropPopoverState.isVisiable) {
          const newState = produce(adPopoverState, (draft) => {
            draft[id].isVisiable = false;
          });

          await setExtensionLocalStorage('adPopoverState', newState);
        }
      }

      if (!adPopoverState[id]) {
        const newState = produce(adPopoverState, (draft) => {
          draft[id] = {
            isVisiable: false,
            lastClosed: '',
          };
        });

        await setExtensionLocalStorage('adPopoverState', newState);
      }
    });
  }

  if (originStorage.accountNamesById) {
    const accountMissingNames = (() => {
      const storedAccounts = originStorage.accounts;
      const accountNameIds = Object.keys(originStorage.accountNamesById);

      return storedAccounts.filter((item) => !accountNameIds.includes(item.id));
    })();

    if (accountMissingNames.length > 0) {
      const oldPreferAccountType = originStorage.accountNamesById;

      const generatedAccountNames = accountMissingNames.reduce((acc: AccountNamesById, cur, i) => {
        acc[cur.id] = `Account ${i + 1}`;
        return acc;
      }, {});

      const mergedAccountNamesById = { ...oldPreferAccountType, ...generatedAccountNames };

      await setExtensionLocalStorage('accountNamesById', mergedAccountNamesById);
    }
  }

  if (originStorage.mnemonicNamesByHashedMnemonic) {
    const mnemonicAccountsMissingMnemonicNames = (() => {
      const mnemonicAccounts = originStorage.accounts.filter((item) => item.type === 'MNEMONIC');
      const mnemonicNameKeys = Object.keys(originStorage.mnemonicNamesByHashedMnemonic);

      return mnemonicAccounts.filter((item) => !mnemonicNameKeys.includes(item.encryptedRestoreString));
    })();

    if (mnemonicAccountsMissingMnemonicNames.length > 0) {
      const oldMnemonicNamesByHashedMnemonic = originStorage.mnemonicNamesByHashedMnemonic;

      const updatedMnemonicNamesByHashedMnemonic = mnemonicAccountsMissingMnemonicNames.reduce((acc: AccountNamesById, cur, i) => {
        acc[cur.encryptedRestoreString] = `Mnemonic ${i + 1}`;
        return acc;
      }, {});

      const mergedMnemonicNamesByHashedMnemonic = { ...oldMnemonicNamesByHashedMnemonic, ...updatedMnemonicNamesByHashedMnemonic };

      await setExtensionLocalStorage('mnemonicNamesByHashedMnemonic', mergedMnemonicNamesByHashedMnemonic);
    }
  }

  // NOTE 이미 저장된 상태. 새 체인파람에 멀티 어카운트 타입이 감지가 됐는데 이게 스토리지에는 저장이 안되어있을때
  if (originStorage.preferAccountType && Object.keys(originStorage.preferAccountType).length > 0) {
    const chainIds = Object.keys(originStorage.paramsV11);
    const chainInfos = chainIds.map((chainId) => {
      const chainInfo = originStorage.paramsV11[chainId];

      return {
        id: chainId,
        ...chainInfo,
      };
    });

    const filteredAccountTypes = chainInfos.filter(
      (item) => item.params.chainlist_params?.account_type && item.params.chainlist_params.account_type.length > 1,
    );

    const freshMultiAccountChainNames = filteredAccountTypes.map((item) => item.id);

    const notStoredNewMultiAccountTypes = freshMultiAccountChainNames
      .filter((item) => !Object.keys(Object.values(originStorage.preferAccountType)[0]).includes(item))
      .filter((item) => !!item);

    if (notStoredNewMultiAccountTypes && notStoredNewMultiAccountTypes.length > 0) {
      const newPreferAccountType: ChainToAccountTypeMap = {};

      notStoredNewMultiAccountTypes.forEach((item) => {
        const newChainAccountType = filteredAccountTypes.find((ac) => ac.params.chainlist_params.api_name === item)?.params.chainlist_params.account_type;
        const defaultAccountType = newChainAccountType?.find((type) => type.is_default !== false);

        if (defaultAccountType) {
          const type = {
            hdPath: defaultAccountType.hd_path.replace('X', '${index}'),
            pubkeyStyle: defaultAccountType.pubkey_style,
            isDefault: defaultAccountType.is_default,
            pubkeyType: defaultAccountType.pubkey_type,
          };
          newPreferAccountType[item] = type;
        }
      });

      const updatedPreferAccountType = originStorage.accounts.reduce((acc: PreferAccountType, cur) => {
        const oldPreferAccountType = originStorage.preferAccountType[cur.id];
        const mergedPreferAccountType = { ...oldPreferAccountType, ...newPreferAccountType };

        acc[cur.id] = mergedPreferAccountType;
        return acc;
      }, {});

      await setExtensionLocalStorage('preferAccountType', updatedPreferAccountType);
    }
  }

  // NOTE 마이그레이션 용 로직
  // NOTE accounts는 있지만 preferAccountType이 없는 경우
  if (originStorage.accounts && originStorage.accounts.length > 0 && Object.keys(originStorage.preferAccountType).length < 1) {
    const defaultPreferAccountType = Object.values(originStorage.paramsV11)
      .filter((item) => item.params.chainlist_params?.account_type && item.params.chainlist_params.account_type.length > 1)
      .reduce((acc: ChainToAccountTypeMap, cur) => {
        const defaultAccountType = cur.params.chainlist_params.account_type?.find((type) => type.is_default !== false);

        if (defaultAccountType) {
          const type = {
            hdPath: defaultAccountType.hd_path.replace('X', '${index}'),
            pubkeyStyle: defaultAccountType.pubkey_style,
            isDefault: defaultAccountType.is_default,
            pubkeyType: defaultAccountType.pubkey_type,
          };

          acc[cur.params.chainlist_params.api_name] = type;
        }

        return acc;
      }, {});

    const updatedPreferAccountType = originStorage.accounts.reduce((acc: PreferAccountType, cur) => {
      acc[cur.id] = defaultPreferAccountType;
      return acc;
    }, {});

    await setExtensionLocalStorage('preferAccountType', updatedPreferAccountType);
  }
}

export async function setExtensionLocalStorage<T extends ExtensionStorageKeys>(key: T, value: ExtensionStorage[T]) {
  await extension.storage.local.set({ [key]: value as ExtensionStorage[T] });
}

export async function getExtensionLocalStorage<T extends ExtensionStorageKeys>(key: T) {
  const localStorage = await extension.storage.local.get(key);

  return localStorage[key] as ExtensionStorage[T];
}

export const deleteKeysContainingString = async (searchString: string): Promise<void> => {
  chrome.storage.local.get(null, (items) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    const keysToDelete = Object.keys(items).filter((key) => key.includes(searchString));

    if (keysToDelete.length > 0) {
      chrome.storage.local.remove(keysToDelete, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        }
      });
    } else {
      console.log(`No keys found containing the string: "${searchString}"`);
    }
  });
};

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
