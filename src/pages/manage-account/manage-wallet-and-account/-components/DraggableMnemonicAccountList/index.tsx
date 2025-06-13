import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { produce } from 'immer';

import EmptyAsset from '@/components/EmptyAsset';
import type { Account } from '@/types/account';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { useNewSortedAccountStore } from '@/zustand/hooks/useNewSortedAccountStore';

import DraggableMnemonicAccountItem from './components/DraggableMnemonicAccountItem';
import { EmptyAssetContainer, ListContainer } from './styled';

import ImportMnemonicIcon from '@/assets/images/icons/ImportMnemonic70.svg';

export const MNEMONIC_ACCOUNT_DND_ITEM_TYPE = {
  MNEMONIC_CARD: 'mnemonic-card',
} as const;

type DraggableMnemonicAccountListProps = {
  uniqueMnemonicRestoreStrings: string[];
  search?: string;
};

export type IndexedMnemonicAccount = {
  index: number;
  mnemonicRestoreString: string;
  mnemonicName: string;
  accounts: (Account & {
    accountName: string;
  })[];
};

export default function DraggableMnemonicAccountList({ uniqueMnemonicRestoreStrings, search }: DraggableMnemonicAccountListProps) {
  const { t } = useTranslation();
  const { menmonicRestoreStrings, updatedNewSortedMnemonicAccounts } = useNewSortedAccountStore((state) => state);
  const { userAccounts, accountNamesById, mnemonicNamesByHashedMnemonic } = useExtensionStorageStore((state) => state);

  const [indexedAccounts, setIndexedAccounts] = useState(
    menmonicRestoreStrings.length > 0
      ? menmonicRestoreStrings.map((item, idx) => ({
          index: idx,
          mnemonicRestoreString: item,
          mnemonicName: mnemonicNamesByHashedMnemonic[item] || '',
          accounts: userAccounts
            .filter((account) => account.type === 'MNEMONIC' && account.encryptedRestoreString === item)
            .map((item) => ({
              ...item,
              accountName: accountNamesById[item.id],
            })),
        }))
      : uniqueMnemonicRestoreStrings.map((item, idx) => ({
          index: idx,
          mnemonicRestoreString: item,
          mnemonicName: mnemonicNamesByHashedMnemonic[item] || '',
          accounts: userAccounts
            .filter((account) => account.type === 'MNEMONIC' && account.encryptedRestoreString === item)
            .map((item) => ({
              ...item,
              accountName: accountNamesById[item.id],
            })),
        })),
  );

  const findAccountItem = useCallback(
    (id: number) => {
      const index = indexedAccounts.findIndex((c) => c.index === id);
      return {
        cardItem: indexedAccounts[index],
        index,
      };
    },
    [indexedAccounts],
  );

  const moveAccountItem = useCallback((id: number, atIndex: number) => {
    setIndexedAccounts((prevAccounts) => {
      const index = prevAccounts.findIndex((item) => item.index === id);
      if (index === -1 || index === atIndex) return prevAccounts;

      return produce(prevAccounts, (draft) => {
        const [movedItem] = draft.splice(index, 1);
        draft.splice(atIndex, 0, movedItem);
      });
    });
  }, []);

  const [, drop] = useDrop(() => ({ accept: MNEMONIC_ACCOUNT_DND_ITEM_TYPE.MNEMONIC_CARD }));

  const filteredMnemonicAccounts = useMemo(() => {
    if (!indexedAccounts) return [];

    const lowerSearch = search?.toLowerCase() ?? '';

    if (!lowerSearch) return indexedAccounts;

    return indexedAccounts
      .map(({ mnemonicName, accounts, ...rest }) => {
        const matchesMnemonicName = mnemonicName.toLowerCase().includes(lowerSearch);

        const filteredAccounts = accounts.filter((acc) => (acc.accountName ?? '').toLowerCase().includes(lowerSearch));

        if (matchesMnemonicName || filteredAccounts.length > 0) {
          return {
            ...rest,
            mnemonicName,
            accounts: filteredAccounts.length > 0 ? filteredAccounts : accounts,
          };
        }

        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [indexedAccounts, search]);

  useEffect(() => {
    if (
      menmonicRestoreStrings.length !== indexedAccounts.length ||
      menmonicRestoreStrings.some((item, idx) => item !== indexedAccounts[idx].mnemonicRestoreString)
    ) {
      updatedNewSortedMnemonicAccounts(indexedAccounts.map((item) => item.mnemonicRestoreString));
    }
  }, [indexedAccounts, menmonicRestoreStrings, updatedNewSortedMnemonicAccounts]);

  if (search && filteredMnemonicAccounts.length === 0) {
    return (
      <EmptyAssetContainer>
        <EmptyAsset
          icon={<ImportMnemonicIcon />}
          title={t('pages.manage-account.manage-wallet-and-account.entry.importMnemonic')}
          subTitle={t('pages.manage-account.manage-wallet-and-account.entry.importMnemonicDescription')}
        />
      </EmptyAssetContainer>
    );
  }

  if (search) {
    return (
      <ListContainer ref={drop}>
        {filteredMnemonicAccounts.map((account) => (
          <DraggableMnemonicAccountItem
            draggableItem={account}
            moveAccountItem={moveAccountItem}
            findAccountItem={findAccountItem}
            key={account.mnemonicRestoreString}
            itemIndex={account.index}
            blockDrag
          />
        ))}
      </ListContainer>
    );
  } else {
    return (
      <ListContainer ref={drop}>
        {indexedAccounts.map((account) => (
          <DraggableMnemonicAccountItem
            draggableItem={account}
            moveAccountItem={moveAccountItem}
            findAccountItem={findAccountItem}
            key={account.mnemonicRestoreString}
            itemIndex={account.index}
          />
        ))}
      </ListContainer>
    );
  }
}
