import { useCallback, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import { produce } from 'immer';

import { useNewSortedAccountStore } from '@/zustand/hooks/useNewSortedAccountStore';

import DraggablePrivateKeyAccountItem from './components/DraggablePrivateKeyAccountItem';
import { ListContainer } from './styled';

export const PRIVATE_KEY_ACCOUNT_DND_ITEM_TYPE = {
  PRIVATE_KEY_CARD: 'private-key-card',
} as const;

type DraggablePrivateKeyAccountListProps = {
  privateKeyAccountIds: string[];
};

export type IndexedPrivatedKeyAccount = {
  index: number;
  accountId: string;
};

export default function DraggablePrivateKeyAccountList({ privateKeyAccountIds }: DraggablePrivateKeyAccountListProps) {
  const { privateKeyAccountIds: newSortedPrivateKeyAccountIds, updatedNewSortedPrivateAccounts } = useNewSortedAccountStore((state) => state);

  const [indexedAccounts, setIndexedAccounts] = useState<IndexedPrivatedKeyAccount[]>(
    newSortedPrivateKeyAccountIds.length > 0
      ? newSortedPrivateKeyAccountIds.map((item, idx) => ({ index: idx, accountId: item }))
      : privateKeyAccountIds.map((item, idx) => ({
          index: idx,
          accountId: item,
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

  useEffect(() => {
    if (
      newSortedPrivateKeyAccountIds.length !== indexedAccounts.length ||
      newSortedPrivateKeyAccountIds.some((item, idx) => item !== indexedAccounts[idx].accountId)
    ) {
      updatedNewSortedPrivateAccounts(indexedAccounts.map((item) => item.accountId));
    }
  }, [indexedAccounts, newSortedPrivateKeyAccountIds, updatedNewSortedPrivateAccounts]);

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
