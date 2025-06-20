import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { produce } from 'immer';

import EmptyAsset from '@/components/EmptyAsset';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { useNewSortedAccountStore } from '@/zustand/hooks/useNewSortedAccountStore';

import DraggablePrivateKeyAccountItem from './components/DraggablePrivateKeyAccountItem';
import { EmptyAssetContainer, ListContainer } from './styled';

import ImportPrivateKeyIcon from '@/assets/images/icons/ImportPrivateKey70.svg';

export const PRIVATE_KEY_ACCOUNT_DND_ITEM_TYPE = {
  PRIVATE_KEY_CARD: 'private-key-card',
} as const;

type DraggablePrivateKeyAccountListProps = {
  privateKeyAccountIds: string[];
  search?: string;
};

export type IndexedPrivatedKeyAccount = {
  index: number;
  accountId: string;
  accountName: string;
};

export default function DraggablePrivateKeyAccountList({ privateKeyAccountIds, search }: DraggablePrivateKeyAccountListProps) {
  const { t } = useTranslation();
  const { privateKeyAccountIds: newSortedPrivateKeyAccountIds, updatedNewSortedPrivateAccounts } = useNewSortedAccountStore((state) => state);
  const { accountNamesById } = useExtensionStorageStore((state) => state);

  const [indexedAccounts, setIndexedAccounts] = useState<IndexedPrivatedKeyAccount[]>(
    newSortedPrivateKeyAccountIds.length > 0
      ? newSortedPrivateKeyAccountIds.map((item, idx) => ({
          index: idx,
          accountId: item,
          accountName: accountNamesById[item] ?? '',
        }))
      : privateKeyAccountIds.map((item, idx) => ({
          index: idx,
          accountId: item,
          accountName: accountNamesById[item] ?? '',
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

  const [, drop] = useDrop(() => ({ accept: PRIVATE_KEY_ACCOUNT_DND_ITEM_TYPE.PRIVATE_KEY_CARD }));

  const filteredAccounts = useMemo(() => {
    if (search) {
      return (
        indexedAccounts.filter((account) => {
          const condition = [account.accountName];

          return condition.some((item) => item.toLowerCase().indexOf(search.toLowerCase()) > -1);
        }) || []
      );
    }
    return indexedAccounts;
  }, [indexedAccounts, search]);

  useEffect(() => {
    if (
      newSortedPrivateKeyAccountIds.length !== indexedAccounts.length ||
      newSortedPrivateKeyAccountIds.some((item, idx) => item !== indexedAccounts[idx].accountId)
    ) {
      updatedNewSortedPrivateAccounts(indexedAccounts.map((item) => item.accountId));
    }
  }, [indexedAccounts, newSortedPrivateKeyAccountIds, updatedNewSortedPrivateAccounts]);

  if (search && filteredAccounts.length === 0) {
    return (
      <EmptyAssetContainer>
        <EmptyAsset
          icon={<ImportPrivateKeyIcon />}
          title={t('pages.manage-account.manage-wallet-and-account.entry.importPrivateKey')}
          subTitle={t('pages.manage-account.manage-wallet-and-account.entry.importPrivateKeyDescription')}
        />
      </EmptyAssetContainer>
    );
  }

  if (search) {
    return (
      <ListContainer ref={drop}>
        {filteredAccounts.map((account) => (
          <DraggablePrivateKeyAccountItem
            key={account.accountId}
            draggableItem={account}
            moveAccountItem={moveAccountItem}
            findAccountItem={findAccountItem}
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
          <DraggablePrivateKeyAccountItem
            key={account.accountId}
            draggableItem={account}
            moveAccountItem={moveAccountItem}
            findAccountItem={findAccountItem}
            itemIndex={account.index}
          />
        ))}
      </ListContainer>
    );
  }
}
