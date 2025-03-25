import { useCallback, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import { produce } from 'immer';

import { useNewSortedAccountStore } from '@/zustand/hooks/useNewSortedAccountStore';

import DraggableMnemonicAccountItem from './components/DraggableMnemonicAccountItem';
import { ListContainer } from './styled';

export const MNEMONIC_ACCOUNT_DND_ITEM_TYPE = {
  MNEMONIC_CARD: 'mnemonic-card',
} as const;

type DraggableMnemonicAccountListProps = {
  uniqueMnemonicRestoreStrings: string[];
};

export type IndexedMnemonicAccount = {
  index: number;
  mnemonicRestoreString: string;
};

export default function DraggableMnemonicAccountList({ uniqueMnemonicRestoreStrings }: DraggableMnemonicAccountListProps) {
  const { menmonicRestoreStrings, updatedNewSortedMnemonicAccounts } = useNewSortedAccountStore((state) => state);

  const [indexedAccounts, setIndexedAccounts] = useState<IndexedMnemonicAccount[]>(
    menmonicRestoreStrings.length > 0
      ? menmonicRestoreStrings.map((item, idx) => ({ index: idx, mnemonicRestoreString: item }))
      : uniqueMnemonicRestoreStrings.map((item, idx) => ({
          index: idx,
          mnemonicRestoreString: item,
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

  useEffect(() => {
    if (
      menmonicRestoreStrings.length !== indexedAccounts.length ||
      menmonicRestoreStrings.some((item, idx) => item !== indexedAccounts[idx].mnemonicRestoreString)
    ) {
      updatedNewSortedMnemonicAccounts(indexedAccounts.map((item) => item.mnemonicRestoreString));
    }
  }, [indexedAccounts, menmonicRestoreStrings, updatedNewSortedMnemonicAccounts]);

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
