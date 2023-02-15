import { useDrag, useDrop } from 'react-dnd';
import { Typography } from '@mui/material';

import type { AccountType } from '~/types/chromeStorage';

import { Container, LeftContainer, LeftLedgerContainer, LeftTextContainer, RightContainer, StyledButton } from './styled';
import type { IndexedAccount } from '../../entry';

import Add24Icon from '~/images/icons/Add24.svg';
import Ledger14Icon from '~/images/icons/Ledger14.svg';

type AccountItemProps = Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'children'> & {
  itemIndex: number;
  draggableItem: IndexedAccount;
  moveAccountItem: (id: number, atIndex: number) => void;
  findAccountItem: (id: number) => { index: number };
  children?: string;
  isActive?: boolean;
  accountType?: AccountType;
};

export const ItemTypes = {
  CARD: 'card',
};

export default function AccountItem({
  children,
  isActive,
  accountType,
  draggableItem,
  itemIndex,
  moveAccountItem,
  findAccountItem,
  ...remainder
}: AccountItemProps) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.CARD,
      item: draggableItem,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        if (!monitor.didDrop()) {
          moveAccountItem(itemIndex, item.index);
        }
      },
    }),
    [itemIndex, moveAccountItem],
  );

  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.CARD,
      hover: ({ index: draggedId }: IndexedAccount) => {
        if (draggedId !== itemIndex) {
          const { index: overIndex } = findAccountItem(itemIndex);
          moveAccountItem(draggedId, overIndex);
        }
      },
    }),
    [findAccountItem, moveAccountItem],
  );

  return (
    <Container ref={(node) => drag(drop(node))} data-is-dragging={isDragging}>
      <LeftContainer>
        <LeftTextContainer>
          <Typography variant="h5">{children}</Typography>
        </LeftTextContainer>
        {accountType === 'LEDGER' && (
          <LeftLedgerContainer>
            <Ledger14Icon />
          </LeftLedgerContainer>
        )}
      </LeftContainer>
      <RightContainer>
        <StyledButton data-is-active={isActive ? 1 : 0} {...remainder}>
          <Add24Icon />
        </StyledButton>
      </RightContainer>
    </Container>
  );
}
