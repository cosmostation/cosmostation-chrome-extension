import { useCallback, useMemo, useState } from 'react';
import { useDrop } from 'react-dnd';
import update from 'immutability-helper';
import { useSnackbar } from 'notistack';

import IconTextButton from '~/Popup/components/common/IconTextButton';
import SubSideHeader from '~/Popup/components/SubSideHeader';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import type { Account, AccountName } from '~/types/chromeStorage';

import { Container, ListContainer, SideButtonContainer } from './styeld';
import type { IndexedAccount } from '../../entry';
import DraggableAccountItem, { ItemTypes } from '../DraggableAccountItem';

import Check16Icon from '~/images/icons/Check16.svg';
import Close16Icon from '~/images/icons/Close16.svg';

type AccountListProps = {
  accounts: Account[];
  accountName: AccountName;
  onClose: () => void;
};

export default function AccountList({ accounts, accountName, onClose }: AccountListProps) {
  const { t } = useTranslation();
  const { navigateBack } = useNavigate();

  const { setChromeStorage } = useChromeStorage();
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

  const [, drop] = useDrop(() => ({ accept: ItemTypes.CARD }));

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
              if (!isChanged) {
                onClose();
              } else {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const revertedAccount: Account[] = indexedAccounts.map(({ index, ...rest }) => ({
                  ...rest,
                }));
                await setChromeStorage('accounts', revertedAccount);
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
      <Container>
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
      </Container>
    </>
  );
}
