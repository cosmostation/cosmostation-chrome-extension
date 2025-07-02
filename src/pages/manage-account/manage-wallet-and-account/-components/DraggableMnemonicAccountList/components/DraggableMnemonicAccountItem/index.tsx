import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import VerifyPasswordBottomSheet from '@/components/VerifyPasswordBottomSheet';
import { Route as ManageBackupStep1 } from '@/pages/manage-account/backup-wallet/step1/$accountId';
import { Route as MnemonicDetail } from '@/pages/manage-account/detail/mnemonic/$mnemonicId';
import { Route as MnemonicAccountDetail } from '@/pages/manage-account/detail/mnemonic/account/$accountId';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  AccountButton,
  AccountInfoContainer,
  AccountLeftContainer,
  BodyContainer,
  Container,
  LastHdPathIndexText,
  LastHdPathText,
  LastHdPathTextContainer,
  NotBackedUpText,
  OutlinedButtonContainer,
  RightArrowIconContainer,
  StyledOutlinedButton,
  TopButton,
  TopLeftContainer,
  TopRightContainer,
} from './styled';
import { type IndexedMnemonicAccount, MNEMONIC_ACCOUNT_DND_ITEM_TYPE } from '../..';

import MnemonicIcon from '@/assets/images/icons/Mnemonics14.svg';
import RightArrowIcon from '@/assets/images/icons/RightArrow14.svg';
import OrderIcon from 'assets/images/icons/Order20.svg';

type DraggableMnemonicAccountItemProps = {
  itemIndex: number;
  draggableItem: IndexedMnemonicAccount;
  blockDrag?: boolean;
  moveAccountItem: (id: number, atIndex: number) => void;
  findAccountItem: (id: number) => { index: number };
};

export default function DraggableMnemonicAccountItem({
  draggableItem,
  itemIndex,
  blockDrag = false,
  moveAccountItem,
  findAccountItem,
}: DraggableMnemonicAccountItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [supposedToBackupAccountId, setSupposedToBackupAccountId] = useState<string | undefined>();

  const { notBackedUpAccountIds } = useExtensionStorageStore((state) => state);

  const isNotBackedUp = draggableItem.accounts.length > 0 && notBackedUpAccountIds.includes(draggableItem.accounts[0].id);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: MNEMONIC_ACCOUNT_DND_ITEM_TYPE.MNEMONIC_CARD,
      item: draggableItem,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: () => !blockDrag,
      end: (item, monitor) => {
        if (!monitor.didDrop()) {
          moveAccountItem(itemIndex, item.index);
        }
      },
    }),
    [itemIndex, moveAccountItem, blockDrag],
  );

  const [, drop] = useDrop(
    () => ({
      accept: MNEMONIC_ACCOUNT_DND_ITEM_TYPE.MNEMONIC_CARD,
      hover: ({ index: draggedId }: IndexedMnemonicAccount, monitor) => {
        if (draggedId === itemIndex) return;

        if (!ref.current) return;
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        if (!hoverBoundingRect) return;

        const hoverMiddleY = (hoverBoundingRect.top + hoverBoundingRect.bottom) / 2;
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        const hoverClientY = clientOffset.y;

        if (draggedId < itemIndex && hoverClientY < hoverMiddleY) return;
        if (draggedId > itemIndex && hoverClientY > hoverMiddleY) return;

        const { index: overIndex } = findAccountItem(itemIndex);
        moveAccountItem(draggedId, overIndex);
      },
    }),
    [findAccountItem, moveAccountItem],
  );

  drag(drop(ref));

  return (
    <Container ref={ref} data-is-dragging={isDragging}>
      <TopButton
        onClick={() => {
          navigate({
            to: MnemonicDetail.to,
            params: { mnemonicId: draggableItem.mnemonicRestoreString },
          });
        }}
      >
        <TopLeftContainer>
          <MnemonicIcon />
          <Base1300Text variant="h4_B">{draggableItem.mnemonicName}</Base1300Text>
          {isNotBackedUp && (
            <NotBackedUpText variant="b4_M">{t('pages.manage-account.manage-wallet-and-account.components.MnemonicAccount.index.notBackedUp')}</NotBackedUpText>
          )}
        </TopLeftContainer>
        {!blockDrag && (
          <TopRightContainer>
            <OrderIcon />
          </TopRightContainer>
        )}
      </TopButton>
      <BodyContainer>
        {draggableItem.accounts.map((item, i) => {
          const accountName = item.accountName || '';
          const lastHdPath = item.type === 'MNEMONIC' ? item.index : '';

          return (
            <AccountButton
              key={i}
              onClick={() => {
                navigate({
                  to: MnemonicAccountDetail.to,
                  params: { accountId: item.id },
                });
              }}
            >
              <AccountLeftContainer>
                <AccountInfoContainer>
                  <Base1300Text variant="b2_M">{accountName}</Base1300Text>
                  <LastHdPathTextContainer>
                    <LastHdPathText variant="b4_R">{`${t('pages.manage-account.switch-account.components.lastHdPath')} :`}</LastHdPathText>
                    &nbsp;
                    <LastHdPathIndexText>
                      <NumberTypo typoOfIntegers="h6n_M">{lastHdPath}</NumberTypo>
                    </LastHdPathIndexText>
                  </LastHdPathTextContainer>
                </AccountInfoContainer>
              </AccountLeftContainer>
            </AccountButton>
          );
        })}
        {isNotBackedUp && (
          <OutlinedButtonContainer>
            <StyledOutlinedButton
              variant="dark"
              typoVarient="b4_M"
              trailingIcon={
                <RightArrowIconContainer>
                  <RightArrowIcon />
                </RightArrowIconContainer>
              }
              onClick={() => {
                setSupposedToBackupAccountId(draggableItem.accounts[0]?.id);
              }}
            >
              {t('pages.manage-account.manage-wallet-and-account.components.MnemonicAccount.index.backUpNow')}
            </StyledOutlinedButton>
          </OutlinedButtonContainer>
        )}
      </BodyContainer>
      <VerifyPasswordBottomSheet
        open={!!supposedToBackupAccountId}
        onClose={() => setSupposedToBackupAccountId(undefined)}
        onSubmit={() => {
          navigate({
            to: ManageBackupStep1.to,
            params: {
              accountId: supposedToBackupAccountId || '',
            },
          });
        }}
      />
    </Container>
  );
}
