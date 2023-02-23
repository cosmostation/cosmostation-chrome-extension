import { useDrag, useDrop } from 'react-dnd';
import { Typography } from '@mui/material';

import { DND_ITEM_TYPE } from '~/constants/dnd';

import { Container, LeftContainer, LeftTextContainer, RightContainer } from './styled';
import type { IndexedAccount } from '../../entry';

import Change24Icon from '~/images/icons/Change24.svg';

type DraggableAccountItemProps = {
  itemIndex: number;
  draggableItem: IndexedAccount;
  moveAccountItem: (id: number, atIndex: number) => void;
  findAccountItem: (id: number) => { index: number };
  children?: string;
};

export default function DraggableAccountItem({ children, draggableItem, itemIndex, moveAccountItem, findAccountItem }: DraggableAccountItemProps) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DND_ITEM_TYPE.CARD,
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
      accept: DND_ITEM_TYPE.CARD,
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
      </LeftContainer>
      <RightContainer>
        <Change24Icon />
      </RightContainer>
    </Container>
  );
}
