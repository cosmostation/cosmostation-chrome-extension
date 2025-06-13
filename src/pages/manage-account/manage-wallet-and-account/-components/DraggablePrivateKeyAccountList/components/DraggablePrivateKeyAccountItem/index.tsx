import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useNavigate } from '@tanstack/react-router';

import AccountImage from '@/components/AccountImage';
import Base1300Text from '@/components/common/Base1300Text';
import { Route as PrivateKeyAccountDetail } from '@/pages/manage-account/detail/privateKey/account/$accountId';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { AccountButton, AccountImgContainer, AccountInfoContainer, AccountLeftContainer, AccountRightContainer, Container } from './styled';
import { type IndexedPrivatedKeyAccount, PRIVATE_KEY_ACCOUNT_DND_ITEM_TYPE } from '../..';

import OrderIcon from 'assets/images/icons/Order20.svg';

type DraggablePrivateKeyAccountItemProps = {
  itemIndex: number;
  draggableItem: IndexedPrivatedKeyAccount;
  blockDrag?: boolean;
  moveAccountItem: (id: number, atIndex: number) => void;
  findAccountItem: (id: number) => { index: number };
};

export default function DraggablePrivateKeyAccountItem({
  draggableItem,
  itemIndex,
  blockDrag = false,
  moveAccountItem,
  findAccountItem,
}: DraggablePrivateKeyAccountItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { accountNamesById } = useExtensionStorageStore((state) => state);

  const accountName = accountNamesById[draggableItem.accountId];

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: PRIVATE_KEY_ACCOUNT_DND_ITEM_TYPE.PRIVATE_KEY_CARD,
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
    [itemIndex, blockDrag, moveAccountItem],
  );

  const [, drop] = useDrop(
    () => ({
      accept: PRIVATE_KEY_ACCOUNT_DND_ITEM_TYPE.PRIVATE_KEY_CARD,
      hover: ({ index: draggedId }: IndexedPrivatedKeyAccount) => {
        if (draggedId !== itemIndex) {
          const { index: overIndex } = findAccountItem(itemIndex);
          moveAccountItem(draggedId, overIndex);
        }
      },
    }),
    [findAccountItem, moveAccountItem],
  );

  drag(drop(ref));

  return (
    <Container ref={ref} data-is-dragging={isDragging}>
      <AccountButton
        onClick={() => {
          navigate({
            to: PrivateKeyAccountDetail.to,
            params: {
              accountId: draggableItem.accountId,
            },
          });
        }}
      >
        <AccountLeftContainer>
          <AccountImgContainer>
            <AccountImage accountId={draggableItem.accountId} />
          </AccountImgContainer>

          <AccountInfoContainer>
            <Base1300Text variant="b2_M">{accountName}</Base1300Text>
          </AccountInfoContainer>
        </AccountLeftContainer>

        {!blockDrag && (
          <AccountRightContainer>
            <OrderIcon />
          </AccountRightContainer>
        )}
      </AccountButton>
    </Container>
  );
}
