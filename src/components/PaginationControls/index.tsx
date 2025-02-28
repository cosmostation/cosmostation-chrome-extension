import type React from 'react';

import { Container, NaviagteIconButton } from './styled';
import Base1300Text from '../common/Base1300Text';

import BackIcon from '@/assets/images/icons/Back20.svg';
import ForwardIcon from '@/assets/images/icons/Forward20.svg';

type PaginationControlsProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function PaginationControls({ currentPage, totalPages, onPageChange, ...remainder }: PaginationControlsProps) {
  return (
    <Container {...remainder}>
      <NaviagteIconButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage + 1 === 1}>
        <BackIcon />
      </NaviagteIconButton>
      <Base1300Text variant="b3_M">{`${currentPage + 1} / ${totalPages}`}</Base1300Text>
      <NaviagteIconButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage + 1 === totalPages}>
        <ForwardIcon />
      </NaviagteIconButton>
    </Container>
  );
}
