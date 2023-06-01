import { useCallback, useMemo, useState } from 'react';
import { useDrop } from 'react-dnd';
import update from 'immutability-helper';
import { useSnackbar } from 'notistack';

import { DND_ITEM_TYPE } from '~/constants/dnd';
import IconTextButton from '~/Popup/components/common/IconTextButton';
import SubSideHeader from '~/Popup/components/SubSideHeader';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { Account, AccountName } from '~/types/extensionStorage';

import { ListContainer, SideButtonContainer } from './styeld';
import type { IndexedAccount } from '../../entry';
import DraggableAccountItem from '../DraggableAccountItem';

import Check16Icon from '~/images/icons/Check16.svg';
import Close16Icon from '~/images/icons/Close16.svg';

type DraggableAccountListProps = {
  accounts: Account[];
  accountName: AccountName;
  onClose: () => void;
};

export default function DraggableAccountList({ accounts, accountName, onClose }: DraggableAccountListProps) {
  const { t } = useTranslation();
  const { navigateBack } = useNavigate();

  const { setExtensionStorage } = useExtensionStorage();
  const { enqueueSnackbar } = useSnackbar();

  const [indexedAccounts, setIndexedAccounts] = useState<IndexedAccount[]>(
    accounts.map((item, idx) => ({
      index: idx,
      ...item,
    })),
  );

  const findAccountItem = useCallback(
    (id: number) => {
      const cardItem = indexedAccounts.filter((c) => c.index === id)[0];

      return {
        cardItem,
        index: indexedAccounts.indexOf(cardItem),
      };
    },
    [indexedAccounts],
  );

  const moveAccountItem = useCallback(
    (id: number, atIndex: number) => {
      const { cardItem, index } = findAccountItem(id);
      setIndexedAccounts(
        update(indexedAccounts, {
          $splice: [
            [index, 1],
            [atIndex, 0, cardItem],
          ],
        }),
      );
    },
    [findAccountItem, indexedAccounts],
  );

  const [, drop] = useDrop(() => ({ accept: DND_ITEM_TYPE.CARD }));

  const isChanged = useMemo(() => Object.keys(accounts).toString() !== indexedAccounts.map(({ index }) => index).toString(), [accounts, indexedAccounts]);

  return (
    <>
      <SubSideHeader onClick={() => navigateBack()}>
        <SideButtonContainer>
          <IconTextButton
            onClick={() => {
              onClose();
            }}
            Icon={<Close16Icon />}
            isActive={false}
          >
            {t('pages.Account.Management.components.DraggableAccountList.index.cancel')}
          </IconTextButton>
          <IconTextButton
            onClick={async () => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const revertedAccount: Account[] = indexedAccounts.map(({ index, ...rest }) => ({
                ...rest,
              }));

              if (
                !isChanged ||
                JSON.stringify([...accounts].sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))) !==
                  JSON.stringify([...revertedAccount].sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0)))
              ) {
                onClose();
              } else {
                await setExtensionStorage('accounts', revertedAccount);
                onClose();
                enqueueSnackbar(t('pages.Account.Management.components.DraggableAccountList.index.successSnackbar'));
              }
            }}
            Icon={<Check16Icon />}
          >
            {t('pages.Account.Management.components.DraggableAccountList.index.confirm')}
          </IconTextButton>
        </SideButtonContainer>
      </SubSideHeader>
      <ListContainer ref={drop}>
        {indexedAccounts.map((account) => (
          <DraggableAccountItem
            draggableItem={account}
            moveAccountItem={moveAccountItem}
            findAccountItem={findAccountItem}
            key={account.id}
            itemIndex={account.index}
          >
            {accountName[account.id]}
          </DraggableAccountItem>
        ))}
      </ListContainer>
    </>
  );
}
