import { useDrop } from 'react-dnd';

import { ListContainer } from './styled';
import { ItemTypes } from '../AccountItem';

type AccountListProps = {
  children: JSX.Element;
};

export default function AccountList({ children }: AccountListProps) {
  const [, drop] = useDrop(() => ({ accept: ItemTypes.CARD }));
  return <ListContainer ref={drop}>{children}</ListContainer>;
}
